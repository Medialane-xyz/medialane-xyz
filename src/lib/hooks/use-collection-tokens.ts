"use client"

import { useEffect, useState, useCallback } from "react"
import { ipCollectionAbi } from "@/src/abis/ip_collection"
import { type TokenData } from "./use-collection-contract"
import { Contract, RpcProvider, shortString } from "starknet"

const COLLECTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS || ""
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://starknet-mainnet.public.blastapi.io"

// Extended Token Data with off-chain metadata
export interface ExtendedTokenData extends TokenData {
    name?: string
    description?: string
    image?: string
    attributes?: any[]
    identifier: string
}

// Helper to decode ByteArray from Starknet response
function decodeByteArray(data: any[] | string): string {
    if (!data) return ""

    try {
        // If it's already a string
        if (typeof data === "string") {
            // If it doesn't look like a hex string, return it as is (e.g., IPFS URLs)
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

// Get provider instance
function getProvider(): RpcProvider {
    return new RpcProvider({ nodeUrl: RPC_URL })
}

// Get contract instance - matches use-all-collections.ts pattern
function getContract(): Contract {
    const provider = getProvider()
    return new Contract({
        abi: ipCollectionAbi,
        address: COLLECTION_CONTRACT_ADDRESS,
        providerOrAccount: provider
    })
}

/**
 * Fetch a single token's data with optional base URI from collection
 */
export async function fetchTokenData(identifier: string, collectionBaseUri?: string): Promise<ExtendedTokenData | null> {
    try {
        const contract = getContract()
        // The contract expects ByteArray as argument
        console.log(`[fetchTokenData] Fetching token: ${identifier}`)
        const tokenData = await contract.get_token(identifier)

        // Check if token exists (owner is not 0)
        if (BigInt(tokenData.owner) === BigInt(0)) {
            console.log(`[fetchTokenData] Token ${identifier} has no owner, skipping`)
            return null
        }

        let metadataUri = decodeByteArray(tokenData.metadata_uri)
        console.log(`[fetchTokenData] Token ${identifier} metadata_uri:`, metadataUri || "(empty)")

        // If token has no metadata_uri, try to compose from collection's base_uri
        const tokenId = String(tokenData.token_id)
        if (!metadataUri && collectionBaseUri) {
            // Compose token metadata URL from collection's base URI
            // Common patterns: base_uri/{tokenId}.json or base_uri/{tokenId}
            const cleanBaseUri = collectionBaseUri.endsWith('/') ? collectionBaseUri : `${collectionBaseUri}/`
            metadataUri = `${cleanBaseUri}${tokenId}.json`
            console.log(`[fetchTokenData] Using composed metadata URI from collection base_uri: ${metadataUri}`)
        }

        // Basic data
        const basicData: ExtendedTokenData = {
            collection_id: BigInt(tokenData.collection_id),
            token_id: BigInt(tokenData.token_id),
            owner: String(tokenData.owner),
            metadata_uri: metadataUri,
            // Default UI values in case metadata fetch fails
            name: `Token #${tokenData.token_id}`,
            identifier,
            description: "",
            image: "/placeholder.svg"
        }

        // Attempt to fetch off-chain metadata
        if (metadataUri && (metadataUri.startsWith("http") || metadataUri.startsWith("ipfs"))) {
            try {
                // Handle IPFS URLs
                let url = metadataUri
                if (metadataUri.startsWith("ipfs://")) {
                    url = metadataUri.replace("ipfs://", "https://ipfs.io/ipfs/")
                }
                console.log(`[fetchTokenData] Fetching metadata from: ${url}`)

                const response = await fetch(url)
                if (!response.ok) {
                    console.warn(`[fetchTokenData] HTTP ${response.status} fetching ${url}`)
                    return basicData
                }

                const json = await response.json()
                console.log(`[fetchTokenData] Metadata for ${identifier}:`, json.name, json.image ? "(has image)" : "(no image)")

                return {
                    ...basicData,
                    name: json.name || basicData.name,
                    description: json.description || "",
                    image: json.image ? json.image.replace("ipfs://", "https://ipfs.io/ipfs/") : basicData.image,
                    attributes: json.attributes
                }
            } catch (e) {
                console.warn(`[fetchTokenData] Failed to fetch metadata for ${identifier}:`, e)
            }
        } else {
            console.log(`[fetchTokenData] No valid metadata URI for ${identifier}, using defaults`)
        }

        return basicData
    } catch (e) {
        console.error(`[fetchTokenData] Error fetching token ${identifier}:`, e)
        return null
    }
}

/**
 * Hook to fetch all tokens for a collection
 */
export function useCollectionTokens(collectionId: string | undefined) {
    const [tokens, setTokens] = useState<ExtendedTokenData[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    const fetchTokens = useCallback(async () => {
        if (!collectionId) {
            setTokens([])
            setIsLoading(false)
            return
        }

        console.log("[useCollectionTokens] Starting fetch for collectionId:", collectionId)
        setIsLoading(true)
        setError(null)

        try {
            const contract = getContract()

            // 0. First, get the collection's base_uri for composing token metadata URLs
            console.log("[useCollectionTokens] Fetching collection data for base_uri")
            const collectionData = await contract.get_collection(collectionId)
            const baseUri = decodeByteArray(collectionData.base_uri)
            console.log("[useCollectionTokens] Collection base_uri:", baseUri || "(empty)")

            // 1. Get stats to know how many tokens to fetch
            console.log("[useCollectionTokens] Fetching stats for collection:", collectionId)
            const stats = await contract.get_collection_stats(collectionId)
            const totalMinted = Number(stats.total_minted)
            const totalBurned = Number(stats.total_burned)
            console.log("[useCollectionTokens] Stats:", { totalMinted, totalBurned })

            // If no tokens, return empty
            if (totalMinted === 0) {
                setTokens([])
                setIsLoading(false)
                return
            }

            // 2. Iterate and fetch each token (passing the base_uri for metadata composition)
            // Optimistically fetch in parallel batches
            const promises = []
            // Token IDs are 0-indexed sequential: "collectionId:0", "collectionId:1", ...
            for (let i = 0; i < totalMinted; i++) {
                const identifier = `${collectionId}:${i}`
                promises.push(fetchTokenData(identifier, baseUri))
            }

            const results = await Promise.all(promises)

            // Filter out nulls (failed fetches)
            const validTokens = results.filter((t): t is ExtendedTokenData => t !== null)
            console.log("[useCollectionTokens] Fetched", validTokens.length, "valid tokens")
            setTokens(validTokens)

        } catch (e) {
            console.error("[useCollectionTokens] Error fetching collection tokens:", e)
            setError(e instanceof Error ? e : new Error("Failed to fetch tokens"))
        } finally {
            setIsLoading(false)
        }
    }, [collectionId])


    useEffect(() => {
        fetchTokens()
    }, [collectionId, fetchTokens])

    return { tokens, isLoading, error, refetch: fetchTokens }
}


/**
 * Hook to fetch a single token
 */
export function useToken(identifier: string | undefined) {
    const [token, setToken] = useState<ExtendedTokenData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchToken = useCallback(async () => {
        if (!identifier) return

        setIsLoading(true)
        setError(null)

        try {
            // Identifier string is passed directly if get_token takes ByteArray
            // Ensure decoded URL param is safe
            const decodedId = decodeURIComponent(identifier)
            const data = await fetchTokenData(decodedId)

            if (data) {
                setToken(data)
            } else {
                setError(new Error("Token not found"))
            }
        } catch (e) {
            console.error("Error fetching token:", e)
            setError(e instanceof Error ? e : new Error("Failed to fetch token"))
        } finally {
            setIsLoading(false)
        }
    }, [identifier])

    useEffect(() => {
        if (identifier) {
            fetchToken()
        }
    }, [identifier, fetchToken])

    return { token, isLoading, error, refetch: fetchToken }
}

/**
 * Hook to fetch all assets owned by a user across all collections
 */
import { fetchAllCollections } from "./use-all-collections" // Ensure this import works or move logic

export function useUserAssets(userAddress: string | undefined) {
    const [assets, setAssets] = useState<ExtendedTokenData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchAssets = useCallback(async () => {
        if (!userAddress) {
            setAssets([])
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // 1. Get all collections
            const collections = await fetchAllCollections()

            if (collections.length === 0) {
                setAssets([])
                setIsLoading(false)
                return
            }

            const contract = getContract() // Reuse contract instance helper
            const allTokens: ExtendedTokenData[] = []

            // 2. Iterate each collection and get user tokens
            // Parallelize collection checks
            const collectionPromises = collections.map(async (col) => {
                try {
                    // Contract instance must be able to call list_user_tokens_per_collection
                    // list_user_tokens_per_collection(collection_id, user)
                    const tokenIds = await contract.list_user_tokens_per_collection(col.collectionId, userAddress)

                    if (tokenIds && tokenIds.length > 0) {
                        // For each token ID, fetch data
                        // tokenIds might be BigInt[]
                        const tokenPromises = []
                        for (const tid of tokenIds) {
                            // Construct identifier: "collectionId:tokenId"
                            const identifier = `${col.collectionId}:${tid}`
                            tokenPromises.push(fetchTokenData(identifier))
                        }
                        return Promise.all(tokenPromises)
                    }
                } catch (e) {
                    console.warn(`Failed to list tokens for collection ${col.id}`, e)
                }
                return []
            })

            const collectionsResults = await Promise.all(collectionPromises)

            // Flatten results
            for (const res of collectionsResults) {
                if (res) {
                    for (const t of res) {
                        if (t) allTokens.push(t)
                    }
                }
            }

            setAssets(allTokens)

        } catch (e) {
            console.error("Error fetching user assets:", e)
            setError(e instanceof Error ? e : new Error("Failed to fetch assets"))
        } finally {
            setIsLoading(false)
        }
    }, [userAddress])

    useEffect(() => {
        fetchAssets()
    }, [userAddress, fetchAssets])

    return { assets, isLoading, error, refetch: fetchAssets }
}

/**
 * Hook to fetch a single token using the on-chain collection address and tokenId
 * This follows industry standards like OpenSea's URL format: /assets/{contract_address}/{token_id}
 */
export function useTokenByAddress(collectionAddress: string | undefined, tokenId: string | undefined) {
    const [token, setToken] = useState<ExtendedTokenData | null>(null)
    const [collection, setCollection] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchToken = useCallback(async () => {
        if (!collectionAddress || !tokenId) {
            setIsLoading(false)
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            // First, find the collection by its contract address (ipNft)
            const collections = await fetchAllCollections()
            const matchedCollection = collections.find(c =>
                c.ipNft?.toLowerCase() === collectionAddress.toLowerCase()
            )

            if (!matchedCollection) {
                setError(new Error("Collection not found"))
                setIsLoading(false)
                return
            }

            setCollection(matchedCollection)

            // Build the identifier in the format "collectionId:tokenId"
            const numericCollectionId = matchedCollection.id // This is the string representation of the numeric ID
            const identifier = `${numericCollectionId}:${tokenId}`

            console.log("[useTokenByAddress] Fetching token:", identifier, "from collection:", matchedCollection.name)

            // Fetch the token data using the identifier
            const data = await fetchTokenData(identifier)

            if (data) {
                setToken(data)
            } else {
                setError(new Error("Token not found"))
            }
        } catch (e) {
            console.error("Error fetching token by address:", e)
            setError(e instanceof Error ? e : new Error("Failed to fetch token"))
        } finally {
            setIsLoading(false)
        }
    }, [collectionAddress, tokenId])

    useEffect(() => {
        fetchToken()
    }, [collectionAddress, tokenId, fetchToken])

    return { token, collection, isLoading, error, refetch: fetchToken }
}
