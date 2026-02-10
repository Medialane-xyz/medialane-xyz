"use client"

import { useEffect, useState, useCallback } from "react"
import { RpcProvider, Contract, shortString, num } from "starknet"
import { ipCollectionAbi } from "@/src/abis/ip_collection"
// Utility imports
import { fetchIpfsJson, resolveIpfsUrl, resolveMediaUrl } from "@/src/lib/ipfs"

// Contract configuration
const COLLECTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS || ""
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || ""
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

        console.log(`[Collection #${collectionId}] Metadata:`, offChainMetadata, "BaseURI:", baseUri)

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
            image: resolveMediaUrl(offChainMetadata.image),
            banner: resolveMediaUrl(offChainMetadata.banner),
            description: offChainMetadata.description,
        }
    } catch (error) {
        console.error(`Error fetching collection ${collectionId}:`, error)
        return null
    }
}

/**
 * Optimized: Fetch ONLY on-chain collection data (specifically address/ipNft)
 * Skips the heavy IPFS metadata fetch.
 */
export async function fetchCollectionAddressOnly(collectionId: number | bigint): Promise<{ ipNft: string, name: string } | null> {
    try {
        const contract = getIPCollectionContract()
        const collectionData = await contract.get_collection(collectionId)

        return {
            ipNft: num.toHex(collectionData.ip_nft),
            name: decodeByteArray(collectionData.name) || `Collection #${collectionId}`
        }
    } catch (error) {
        // console.warn(`Error fetching collection address for #${collectionId}`, error)
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
        const BATCH_SIZE = 3

        for (let i = 1; i <= MAX_COLLECTIONS_TO_CHECK; i += BATCH_SIZE) {
            const batchPromises = []
            for (let j = 0; j < BATCH_SIZE; j++) {
                const collectionId = i + j
                if (collectionId > MAX_COLLECTIONS_TO_CHECK) break

                batchPromises.push(async () => {
                    try {
                        const contract = getIPCollectionContract()
                        const isValid = await contract.is_valid_collection(collectionId)
                        if (isValid) {
                            return await fetchCollectionById(collectionId)
                        }
                        return null
                    } catch (e) {
                        return null
                    }
                })
            }

            // Execute batch
            const results = await Promise.all(batchPromises.map(fn => fn()))

            // Add found collections
            const validResults = results.filter((c): c is OnChainCollection => c !== null)
            collections.push(...validResults)

            // If we found nothing in this batch, and it was a full batch, 
            // maybe we should stop? For now, let's keep going to be safe, 
            // or maybe assume sequential IDs and stop if we see consecutive failures?
            // Let's rely on MAX_COLLECTIONS_TO_CHECK for now.

            // Artificial delay to be nice to RPC/IPFS
            if (validResults.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 100))
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
 * Helper to find the max collection ID (probing strategy)
 * Copied/Adapted from useCollectionsScanner to keep this file self-contained for now
 */
async function findMaxCollectionId(contract: Contract): Promise<number> {
    try {
        let maxFound = 0
        const probes = [1, 10, 20, 50, 100, 200, 500, 1000]

        for (const probe of probes) {
            try {
                const valid = await contract.is_valid_collection(probe)
                if (valid) {
                    maxFound = probe
                } else {
                    break
                }
            } catch (e) {
                break
            }
        }
        return maxFound > 0 ? maxFound + 5 : 5
    } catch (e) {
        return 0
    }
}

/**
 * Optimize: Fetch ONLY the ID for a given address by scanning on-chain structs
 * This avoids fetching IPFS metadata for every single collection
 */
export async function findCollectionIdByAddress(address: string): Promise<number | null> {
    if (!address) return null
    const normalizedAddr = address.toLowerCase()

    try {
        const contract = getIPCollectionContract()
        const maxId = await findMaxCollectionId(contract)

        // Scan in batches
        const BATCH_SIZE = 10
        for (let i = 1; i <= maxId; i += BATCH_SIZE) {
            const batchIds = []
            for (let j = 0; j < BATCH_SIZE; j++) {
                if (i + j <= maxId) batchIds.push(i + j)
            }

            // Parallel fetch of on-chain data ONLY
            const results = await Promise.all(batchIds.map(async (id) => {
                try {
                    const isValid = await contract.is_valid_collection(id)
                    if (!isValid) return null

                    const data = await contract.get_collection(id)
                    const ipNft = num.toHex(data.ip_nft).toLowerCase()

                    if (ipNft === normalizedAddr) {
                        return id
                    }
                    return null
                } catch (e) {
                    return null
                }
            }))

            const found = results.find(id => id !== null)
            if (found) return found
        }

    } catch (e) {
        console.error("Error finding collection ID by address:", e)
    }

    return null
}

/**
 * Helper to fetch a collection by its address (ipNft)
 * Optimized to NOT fetch all collections' metadata
 */
export async function fetchCollectionByAddress(address: string): Promise<OnChainCollection | null> {
    if (!address) return null

    // 1. Find the ID efficiently
    const id = await findCollectionIdByAddress(address)

    if (id) {
        // 2. Fetch full details ONLY for the match
        return await fetchCollectionById(id)
    }

    return null
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
