"use client"

import { useEffect, useState, useCallback } from "react"
import { RpcProvider, Contract, shortString, num } from "starknet"
import { ipCollectionAbi } from "@/src/abis/ip_collection"
import { fetchIpfsJson, resolveMediaUrl } from "@/src/lib/ipfs"

// Contract configuration
const COLLECTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS || ""
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || ""
const START_BLOCK = Number(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_START_BLOCK) || 0
const COLLECTION_CREATED_SELECTOR = "0xfca650bfd622aeae91aa1471499a054e4c7d3f0d75fbcb98bdb3bbb0358b0c"

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
                    // console.log(`[Collection #${collectionId}] Metadata fetched successfully:`, data.name)
                    offChainMetadata = data
                } else {
                    console.warn(`[Collection #${collectionId}] Failed to fetch metadata from both strategies. BaseUri: ${baseUri}`)
                }
            } catch (e) {
                console.warn(`Failed to fetch metadata for collection ${collectionId}`, e)
            }
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
        return null
    }
}

/**
 * Helper to fetch all CollectionCreated events
 */
async function getAllCollectionIds(): Promise<bigint[]> {
    const provider = getProvider()
    const allIds: bigint[] = []
    let continuationToken: string | undefined = undefined

    // Safety break
    let pages = 0
    const MAX_PAGES = 100

    try {
        do {
            const response = await provider.getEvents({
                address: COLLECTION_CONTRACT_ADDRESS,
                keys: [[COLLECTION_CREATED_SELECTOR]],
                from_block: { block_number: START_BLOCK },
                chunk_size: 100,
                continuation_token: continuationToken
            })

            for (const event of response.events) {
                try {
                    const data = event.data
                    const dataIter = data[Symbol.iterator]()
                    const collectionIdLow = dataIter.next().value
                    const collectionIdHigh = dataIter.next().value
                    if (collectionIdLow && collectionIdHigh) {
                        const id = BigInt(collectionIdLow) + (BigInt(collectionIdHigh) * BigInt("340282366920938463463374607431768211456"))
                        allIds.push(id)
                    }
                } catch (e) { }
            }

            continuationToken = response.continuation_token
            pages++
        } while (continuationToken && pages < MAX_PAGES)
    } catch (e) {
        console.error("Error fetching collection events:", e)
    }

    return allIds
}

/**
 * Fetch all collections using event logs
 */
export async function fetchAllCollections(): Promise<OnChainCollection[]> {
    const collections: OnChainCollection[] = []

    try {
        // 1. Get all IDs from events
        const ids = await getAllCollectionIds()

        // 2. Fetch details for each (in batches)
        const BATCH_SIZE = 5
        for (let i = 0; i < ids.length; i += BATCH_SIZE) {
            const batch = ids.slice(i, i + BATCH_SIZE)
            const results = await Promise.all(batch.map(id => fetchCollectionById(id)))
            collections.push(...results.filter((c): c is OnChainCollection => c !== null))
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
        const collections: OnChainCollection[] = []

        const promises = []
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
 * Optimize: Fetch ONLY the ID for a given address by scanning on-chain structs
 * This avoids fetching IPFS metadata for every single collection
 */
export async function findCollectionIdByAddress(address: string): Promise<number | null> {
    if (!address) return null
    const normalizedAddr = address.toLowerCase()

    try {
        const contract = getIPCollectionContract()

        // Use event scanning to get all valid IDs
        const ids = await getAllCollectionIds()

        // Scan in batches to find the match
        const BATCH_SIZE = 10
        for (let i = 0; i < ids.length; i += BATCH_SIZE) {
            const batchIds = ids.slice(i, i + BATCH_SIZE)

            // Parallel fetch of on-chain data ONLY
            const results = await Promise.all(batchIds.map(async (id) => {
                try {
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
            if (found) return Number(found)
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
