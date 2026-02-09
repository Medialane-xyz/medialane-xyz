"use client"

import { useEffect, useState, useCallback } from "react"
import { RpcProvider, Contract, shortString, num } from "starknet"
import { ipCollectionAbi } from "@/src/abis/ip_collection"
// Utility imports
import { fetchIpfsJson, resolveIpfsUrl } from "@/src/lib/ipfs"

// Contract configuration
const COLLECTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS || ""
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://starknet-mainnet.public.blastapi.io" // public fallback if env missing
const START_BLOCK = Number(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_START_BLOCK) || 0

// Types for collections
export interface OnChainCollection {
    id: string
    collectionId: bigint
    name: string
    symbol: string
    baseUri: string
    owner: string
    ipNft: string
    isActive: boolean
    // UI-friendly fields
    image?: string
    banner?: string
    creator: string
    items: number
    volume: string
    verified: boolean
    description?: string
}

// Decode ByteArray from Starknet
function decodeByteArray(data: any[] | string): string {
    if (!data) return ""

    try {
        // If it's already a string
        if (typeof data === "string") {
            // If it doesn't look like a hex string, return it as is
            if (!data.startsWith("0x")) {
                return data
            }
            // Try to decode hex string
            return shortString.decodeShortString(data)
        }

        // Handle array of felts (ByteArray struct or Span)
        if (Array.isArray(data)) {
            // If it's empty, return empty string
            if (data.length === 0) return ""

            return data.map((felt) => {
                try {
                    const str = String(felt)
                    // If felt is meant to be a char/short string
                    return shortString.decodeShortString(str)
                } catch {
                    return ""
                }
            }).join("")
        }

        return String(data)
    } catch (e) {
        console.warn("Error decoding ByteArray, returning input:", data, e)
        // Fallback: return the input as string if possible
        return typeof data === "string" ? data : String(data)
    }
}

// Create provider instance
function getProvider(): RpcProvider {
    return new RpcProvider({ nodeUrl: RPC_URL })
}

// Get contract instance
function getIPCollectionContract(): Contract {
    const provider = getProvider()
    const abi = ipCollectionAbi
    return new Contract({
        abi,
        address: COLLECTION_CONTRACT_ADDRESS,
        providerOrAccount: provider
    })
}

/**
 * Fetch collection details by ID from the contract
 */
export async function fetchCollectionById(collectionId: number | bigint): Promise<OnChainCollection | null> {
    try {
        const contract = getIPCollectionContract()

        // Call get_collection
        const collectionData = await contract.get_collection(collectionId)

        // Call get_collection_stats for items count
        const stats = await contract.get_collection_stats(collectionId)

        const name = decodeByteArray(collectionData.name)
        const symbol = decodeByteArray(collectionData.symbol)
        const baseUri = decodeByteArray(collectionData.base_uri)

        // Fetch off-chain metadata if baseUri exists
        let offChainMetadata: any = {}
        if (baseUri) {
            try {
                // Strategy 1: strict directory structure (standard)
                // Assumes baseUri is a directory like ipfs://CID/
                const uriWithSlash = baseUri.endsWith('/') ? baseUri : `${baseUri}/`
                const metadataUriDir = `${uriWithSlash}collection.json`

                console.log(`[Collection #${collectionId}] Fetching metadata from strategy 1: ${metadataUriDir}`)
                let data = await fetchIpfsJson(metadataUriDir)

                // Strategy 2: direct file (fallback)
                // Assumes baseUri MIGHT be the direct link to JSON, e.g. ipfs://CID
                if (!data) {
                    console.log(`[Collection #${collectionId}] Strategy 1 failed. Trying strategy 2: ${baseUri}`)
                    data = await fetchIpfsJson(baseUri)
                }

                if (data) {
                    console.log(`[Collection #${collectionId}] Metadata fetched successfully:`, data.name)
                    offChainMetadata = data
                } else {
                    console.warn(`[Collection #${collectionId}] Failed to fetch metadata from both strategies. BaseUri: ${baseUri}`)
                }
            } catch (e) {
                console.warn(`Failed to fetch metadata for collection ${collectionId}`, e)
            }
        }

        // Helper to resolve image/banner URI
        const resolveMetaUri = (uri: string | undefined) => {
            if (!uri) return undefined
            if (uri.startsWith("http") || uri.startsWith("ipfs://")) {
                return `/api/proxy?url=${encodeURIComponent(resolveIpfsUrl(uri))}`
            }
            // If relative path, try to append to baseUri
            // If baseUri ends with /, append directly
            // If baseUri is a directory but no trailing slash, append / + uri
            // If baseUri is a file (no /), this might be tricky, but assuming directory structure for relative paths
            if (baseUri) {
                const cleanBase = baseUri.endsWith('/') ? baseUri : `${baseUri}/`
                return `/api/proxy?url=${encodeURIComponent(resolveIpfsUrl(`${cleanBase}${uri}`))}`
            }
            return undefined
        }

        return {
            id: String(collectionId),
            collectionId: BigInt(collectionId),
            name: offChainMetadata.name || name || `Collection #${collectionId}`,
            symbol,
            baseUri,
            owner: String(collectionData.owner),
            ipNft: num.toHex(collectionData.ip_nft),
            isActive: Boolean(collectionData.is_active),
            // UI fields
            creator: String(collectionData.owner).slice(0, 10) + "...",
            items: Number(stats.total_minted) - Number(stats.total_burned),
            volume: "0 ETH", // Volume would need marketplace integration
            verified: false, // Would need verification system
            image: resolveMetaUri(offChainMetadata.image)
                ? resolveMetaUri(offChainMetadata.image)
                : (baseUri ? `/api/proxy?url=${encodeURIComponent(resolveIpfsUrl(`${baseUri}/collection.png`))}` : undefined),
            banner: resolveMetaUri(offChainMetadata.banner)
                ? resolveMetaUri(offChainMetadata.banner)
                : (baseUri ? `/api/proxy?url=${encodeURIComponent(resolveIpfsUrl(`${baseUri}/banner.png`))}` : undefined),
            description: offChainMetadata.description,
        }
    } catch (error) {
        console.error(`Error fetching collection ${collectionId}:`, error)
        return null
    }
}

/**
 * Fetch all collections using event logs
 */
export async function fetchAllCollections(): Promise<OnChainCollection[]> {
    const collections: OnChainCollection[] = []

    try {
        // For now, try to fetch collections by iterating from 1
        // In production, you'd want to use event indexing or a subgraph
        const MAX_COLLECTIONS_TO_CHECK = 50

        for (let i = 1; i <= MAX_COLLECTIONS_TO_CHECK; i++) {
            try {
                // Add a small delay to avoid rate limiting on IPFS gateway
                await new Promise(resolve => setTimeout(resolve, 200))

                const contract = getIPCollectionContract()
                const isValid = await contract.is_valid_collection(i)

                if (isValid) {
                    const collection = await fetchCollectionById(i)
                    if (collection) {
                        collections.push(collection)
                    }
                } else {
                    // Stop searching if encountered an invalid collection (assuming sequential IDs)
                    break
                }
            } catch (e) {
                // Collection doesn't exist or RPC error, stop searching if it's a "does not exist" type error, 
                // but if it's RPC error we might want to continue? 
                // Actually if seq is 1,2,3... and 1 fails, maybe stop.
                // But let's log specifically.
                break
            }
        }
    } catch (error) {
        console.error("Error fetching collections:", error)
    }

    return collections
}

/**
 * React hook to fetch all collections
 */
export function useAllCollections() {
    const [collections, setCollections] = useState<OnChainCollection[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const data = await fetchAllCollections()
            setCollections(data)
        } catch (e) {
            setError(e instanceof Error ? e : new Error("Failed to fetch collections"))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        refetch()
    }, [refetch])

    return { collections, isLoading, error, refetch }
}

/**
 * Fetch collections owned/created by a specific user
 */
export async function fetchUserCollections(userAddress: string): Promise<OnChainCollection[]> {
    if (!userAddress) return []

    try {
        const contract = getIPCollectionContract()

        // Call list_user_collections
        // Returns Span<u256> (array of collection IDs)
        const collectionIds = await contract.list_user_collections(userAddress)

        if (!collectionIds || collectionIds.length === 0) return []

        // Convert bigints to numbers/strings and fetch details
        // collectionIds can be an array of BigInts
        const collections: OnChainCollection[] = []

        // Fetch recursively or in parallel
        const promises = []
        // Iterate over the keys or values if it's a struct/object, but Starknet.js v5 returns array for Span/Array
        // Assuming it's an array
        for (const id of collectionIds) {
            const idNum = BigInt(id)
            promises.push(fetchCollectionById(idNum))
        }

        const results = await Promise.all(promises)

        return results.filter((c): c is OnChainCollection => c !== null)

    } catch (error) {
        console.error(`Error fetching user collections for ${userAddress}:`, error)
        return []
    }
}

/**
 * React hook to fetch user's collections
 */
export function useUserCollections(userAddress: string | undefined) {
    const [collections, setCollections] = useState<OnChainCollection[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(async () => {
        if (!userAddress) {
            setCollections([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const data = await fetchUserCollections(userAddress)
            setCollections(data)
        } catch (e) {
            setError(e instanceof Error ? e : new Error("Failed to fetch user collections"))
        } finally {
            setIsLoading(false)
        }
    }, [userAddress])

    useEffect(() => {
        refetch()
    }, [userAddress, refetch])

    return { collections, isLoading, error, refetch }
}

/**
 * React hook to fetch a single collection by ID
 */
export function useOnChainCollection(collectionId: number | bigint | undefined) {
    const [collection, setCollection] = useState<OnChainCollection | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(async () => {
        if (!collectionId) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const data = await fetchCollectionById(collectionId)
            setCollection(data)
        } catch (e) {
            setError(e instanceof Error ? e : new Error("Failed to fetch collection"))
        } finally {
            setIsLoading(false)
        }
    }, [collectionId])

    useEffect(() => {
        refetch()
    }, [refetch])

    return { collection, isLoading, error, refetch }
}

/**
 * Helper to fetch a collection by its address (ipNft)
 * Note: This iterates through all collections for now as the contract doesn't support lookup by address directly.
 */
export async function fetchCollectionByAddress(address: string): Promise<OnChainCollection | null> {
    if (!address) return null

    // Normalize address
    const normalizedAddress = address.toLowerCase()

    // Fetch all collections
    const allCollections = await fetchAllCollections()

    // Find match
    const found = allCollections.find(c =>
        c.ipNft && c.ipNft.toLowerCase() === normalizedAddress
    )

    return found || null
}

/**
 * React hook to fetch a single collection by Address
 */
export function useCollectionByAddress(address: string | undefined) {
    const [collection, setCollection] = useState<OnChainCollection | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const refetch = useCallback(async () => {
        if (!address) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const data = await fetchCollectionByAddress(address)
            setCollection(data)
        } catch (e) {
            setError(e instanceof Error ? e : new Error("Failed to fetch collection"))
        } finally {
            setIsLoading(false)
        }
    }, [address])

    useEffect(() => {
        refetch()
    }, [refetch])

    return { collection, isLoading, error, refetch }
}
