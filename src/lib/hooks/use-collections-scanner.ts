"use client"

import { useState, useCallback, useEffect } from "react"
import { useContract } from "@starknet-react/core"
import { ipCollectionAbi } from "@/src/abis/ip_collection"
import { fetchIpfsJson, resolveMediaUrl } from "@/src/lib/ipfs"

const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS

export interface ScannedCollection {
    id: string
    name: string
    symbol: string
    image: string
    headerImage?: string
    description: string
    owner: string
    nftAddress: string
    baseUri: string
    totalSupply: number
    isValid: boolean
    type: string
}

interface UseCollectionsScannerReturn {
    collections: ScannedCollection[]
    loading: boolean
    loadingMore: boolean
    error: string | null
    hasMore: boolean
    loadMore: () => Promise<void>
    refresh: () => void
}

export function useCollectionsScanner(pageSize: number = 12): UseCollectionsScannerReturn {
    const [collections, setCollections] = useState<ScannedCollection[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [nextIdToScan, setNextIdToScan] = useState<number | null>(null)
    const [hasMore, setHasMore] = useState(true)

    const { contract } = useContract({
        abi: ipCollectionAbi,
        address: COLLECTION_ADDRESS as `0x${string}`,
    })

    // Helper to find the max collection ID (probing strategy)
    const findMaxCollectionId = useCallback(async () => {
        if (!contract) {
            console.warn("Scanner: Contract not loaded yet")
            return 0
        }

        console.log("Scanner: Probing for max collection ID...")
        try {
            // Quick check for standard IDs
            let maxFound = 0

            // Check in steps: 1, 10, 50, 100, 500, 1000...
            // Added 1 just to check if ANY exist
            const probes = [1, 10, 20, 30, 40, 50, 100, 200, 500, 1000]

            for (const probe of probes) {
                try {
                    // Try to call directly
                    // Note: contract.is_valid_collection might throw if the ID is too large or invalid in some way
                    // but for 'false' it should just return false.
                    const valid = await contract.is_valid_collection(probe)
                    console.log(`Scanner: Probe ${probe} -> ${valid}`)
                    if (valid) {
                        maxFound = probe
                    } else {
                        // Optimization: if 10 is invalid, 20 likely is too (assuming sequential ids)
                        // But we continue just in case of gaps if we were scanning strictly, 
                        // but for optimization we stop at first failure if we assume sequential.
                        // Let's break to save time.
                        break
                    }
                } catch (e) {
                    console.warn(`Scanner: Probe ${probe} failed`, e)
                    break
                }
            }

            console.log(`Scanner: Max found ID approx: ${maxFound}`)
            // If we found something, let's start a bit higher to catch any recent ones
            // If maxFound is 0, we might still want to check 1 just in case probe 1 failed but it exists?
            // If maxFound is 0, we return 0.
            return maxFound > 0 ? maxFound + 5 : 0
        } catch (e) {
            console.error("Scanner: Error finding max collection ID:", e)
            return 0
        }
    }, [contract])


    const fetchBatch = useCallback(async (startId: number, count: number) => {
        if (!contract) return { data: [], nextId: -1 };

        console.log(`Scanner: Fetching batch starting from ${startId}, count ${count}`)

        const newCollections: ScannedCollection[] = [];
        let currentId = startId;
        const scannedIds: number[] = [];
        let attempts = 0;
        const maxAttempts = 100; // Look back a bit further

        // Scan backwards
        while (newCollections.length < count && currentId >= 1 && attempts < maxAttempts) {
            scannedIds.push(currentId);
            currentId--;
            attempts++;
        }

        if (scannedIds.length === 0) return { data: [], nextId: currentId };

        try {
            // Check validity in parallel
            const validityResults = await Promise.all(
                scannedIds.map(async (id) => {
                    try {
                        const valid = await contract.is_valid_collection(id)
                        return { id, valid }
                    } catch (e) {
                        return { id, valid: false }
                    }
                })
            );

            const validIds = validityResults.filter(r => r.valid).map(r => r.id);
            console.log(`Scanner: Valid IDs in batch: ${validIds.join(", ")}`)

            if (validIds.length > 0) {
                const details = await Promise.all(
                    validIds.map(async (id) => {
                        try {
                            const rawData: any = await contract.get_collection(id)
                            // Also get stats for total supply
                            const stats: any = await contract.get_collection_stats(id)

                            let name = "Unknown Collection"
                            // Process ByteArray name
                            try {
                                if (rawData.name) {
                                    // Check if it's already a string or needs decoding
                                    // For now assume standard string or simple object structure
                                    name = rawData.name.toString()
                                }
                            } catch (e) { }

                            let image = ""
                            let description = ""
                            let headerImage = ""

                            // IPFS Metadata
                            if (rawData.base_uri) {
                                try {
                                    let uri = rawData.base_uri.toString()
                                    // Cleanup URI
                                    if (uri.startsWith("ipfs://")) uri = uri.replace("ipfs://", "")

                                    // Try fetching collection.json inside dir if it ends with /
                                    // or just the URI if it looks like a file
                                    let metadata = null
                                    if (uri.endsWith('/')) {
                                        metadata = await fetchIpfsJson(`${uri}collection.json`)
                                    }

                                    if (!metadata) {
                                        metadata = await fetchIpfsJson(uri)
                                    }

                                    if (metadata) {
                                        name = metadata.name || name
                                        image = resolveMediaUrl(metadata.image || "")
                                        headerImage = resolveMediaUrl(metadata.banner || metadata.headerImage || "")
                                        description = metadata.description || ""
                                    }
                                } catch (e) {
                                    console.warn(`Scanner: Failed to fetch/parse IPFS for ${id}`, e)
                                }
                            }

                            return {
                                id: id.toString(),
                                name,
                                symbol: rawData.symbol?.toString() || "COLL",
                                image,
                                headerImage,
                                description,
                                owner: typeof rawData.owner === 'bigint' ? "0x" + rawData.owner.toString(16) : String(rawData.owner),
                                nftAddress: typeof rawData.ip_nft === 'bigint' ? "0x" + rawData.ip_nft.toString(16) : String(rawData.ip_nft),
                                baseUri: rawData.base_uri?.toString() || "",
                                totalSupply: Number(stats.total_minted) || 0,
                                isValid: true
                            } as ScannedCollection

                        } catch (e) {
                            console.warn(`Scanner: Failed to fetch collection details ${id}`, e)
                            return null
                        }
                    })
                )

                newCollections.push(...details.filter(Boolean) as ScannedCollection[])
            }

        } catch (e) {
            console.error("Scanner: Batch fetch error", e)
        }

        return { data: newCollections, nextId: currentId }

    }, [contract])


    const loadMore = async () => {
        if (loadingMore || !nextIdToScan || nextIdToScan < 1) return
        setLoadingMore(true)

        try {
            const { data, nextId } = await fetchBatch(nextIdToScan, pageSize)

            // Avoid duplicates
            setCollections(prev => {
                const existing = new Set(prev.map(c => c.id))
                const uniqueNew = data.filter(c => !existing.has(c.id))
                return [...prev, ...uniqueNew]
            })

            setNextIdToScan(nextId)
            if (nextId < 1) setHasMore(false)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoadingMore(false)
        }
    }

    const refresh = () => {
        console.log("Scanner: Refreshing...")
        setCollections([])
        setNextIdToScan(null)
        setLoading(true)
        setHasMore(true)
        // Effect will re-trigger because contract is constant but loading state reset might not trigger effect if deps didn't change
        // We need to trigger the init effect. 
        // Actually, setting nextIdToScan to null triggering the effect? 
        // The effect depends on [contract, findMaxCollectionId, fetchBatch, nextIdToScan, pageSize]
        // If nextIdToScan is null, the effect runs.
        // But we need to make sure we don't get into a loop.
    }

    // Initial load
    useEffect(() => {
        let mounted = true

        const init = async () => {
            if (!contract) return
            // If we already have collections and nextIdToScan is not null, don't re-init automatically
            // ONLY init if nextIdToScan IS null (initial state or refresh)
            if (nextIdToScan !== null) return

            console.log("Scanner: Initializing...")
            setLoading(true)
            try {
                // Find start point
                const maxId = await findMaxCollectionId()
                console.log("Scanner: Max ID from probe:", maxId)

                if (maxId === 0) {
                    if (mounted) {
                        setLoading(false)
                        setHasMore(false)
                    }
                    return
                }

                const { data, nextId } = await fetchBatch(maxId, pageSize)

                if (mounted) {
                    setCollections(data)
                    setNextIdToScan(nextId)
                    if (nextId < 1) setHasMore(false)
                }

            } catch (err: any) {
                console.error("Scanner: Init error", err)
                if (mounted) setError(err.message)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        init()

        return () => { mounted = false }
    }, [contract, findMaxCollectionId, fetchBatch, nextIdToScan, pageSize])

    return {
        collections,
        loading,
        loadingMore,
        error,
        hasMore,
        loadMore,
        refresh
    }
}
