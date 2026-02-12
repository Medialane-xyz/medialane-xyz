"use client"

import { useState, useCallback, useEffect } from "react"
import { RpcProvider, shortString, Contract, num } from "starknet"
import { ipCollectionAbi } from "@/src/abis/ip_collection"
import { fetchIpfsJson, resolveMediaUrl } from "@/src/lib/ipfs"

// Configuration
const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS
const TOKEN_MINTED_SELECTOR = "0x3e517dedbc7bae62d4ace7e3dfd33255c4a7fe7c1c6f53c725d52b45f9c5a00"
// Start block where the registry was deployed (or reasonable recent block)
const REGISTRY_START_BLOCK = Number(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_START_BLOCK) || 0
const BLOCK_WINDOW_SIZE = 50000

export interface RecentAsset {
    id: string
    tokenId: string
    collectionId: string
    name: string
    image: string
    owner: string
    txHash: string
    metadataUri?: string
    blockNumber?: number
    collectionAddress: string
    collectionName?: string
    ipType?: string
    // UI fields
    description?: string
    category?: string
    creator?: string
    creatorId?: string
    creatorAvatar?: string
    price?: string
    isRemix?: boolean
}

export interface UseRecentAssetsReturn {
    assets: RecentAsset[]
    loading: boolean
    loadingMore: boolean
    error: string | null
    hasMore: boolean
    totalCount: number
    loadMore: () => Promise<void>
    refresh: () => void
}

interface ParsedEvent {
    collectionId: string
    tokenId: string
    owner: string
    metadataUri: string
    txHash: string
    blockNumber: number
    collectionAddress: string
}

// Helper to parse Cairo ByteArray from event data iterator
function parseByteArray(dataIter: IterableIterator<string>): string {
    const lenResult = dataIter.next()
    if (lenResult.done) return ""
    const dataLen = parseInt(lenResult.value, 16)

    let result = ""

    // Read data chunks (bytes31)
    for (let i = 0; i < dataLen; i++) {
        const chunk = dataIter.next().value
        if (chunk) {
            try {
                result += shortString.decodeShortString(chunk)
            } catch {
                // Silently skip invalid chunks
            }
        }
    }

    // Read pending word
    const pendingWord = dataIter.next().value
    // pending word length is next, but we consume it
    dataIter.next()

    if (pendingWord && pendingWord !== "0x0" && pendingWord !== "0x00") {
        try {
            result += shortString.decodeShortString(pendingWord)
        } catch {
            // Silently skip
        }
    }

    return result
}

// Local helper to fetch collection address
async function resolveCollectionAddress(collectionId: string): Promise<{ ipNft: string, name: string } | null> {
    try {
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || ""
        const provider = new RpcProvider({ nodeUrl: rpcUrl })

        if (!COLLECTION_ADDRESS) return null

        const contract = new Contract(ipCollectionAbi, COLLECTION_ADDRESS, provider)

        // Use BigInt for the ID
        const id = BigInt(collectionId)

        // IMPORTANT: Use 'latest' block to avoid Alchemy 'pending' block errors
        const collectionData = await contract.get_collection(id, { blockIdentifier: "latest" })

        return {
            ipNft: num.toHex(collectionData.ip_nft),
            name: `Collection #${collectionId}` // Simplified name resolution for now
        }
    } catch (e) {
        console.error(`Error resolving collection address for ID ${collectionId}:`, e)
        return null
    }
}


export function useRecentAssets(pageSize: number = 20): UseRecentAssetsReturn {
    const [allParsedEvents, setAllParsedEvents] = useState<ParsedEvent[]>([])
    const [assets, setAssets] = useState<RecentAsset[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [displayCount, setDisplayCount] = useState(pageSize)

    // Scanning state
    const [lastScannedBlock, setLastScannedBlock] = useState<number | null>(null)
    const [hasMoreBlocks, setHasMoreBlocks] = useState(true)
    const [isScanning, setIsScanning] = useState(false)

    // Fetch events for a specific block range
    const fetchEventsInRange = useCallback(async (fromBlock: number, toBlock: number) => {
        if (!COLLECTION_ADDRESS) return []

        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || ""
        const provider = new RpcProvider({ nodeUrl: rpcUrl })

        const rangeEvents: ParsedEvent[] = []
        let continuationToken: string | undefined = undefined
        let pageCount = 0
        const maxPagesPerWindow = 50

        try {
            do {
                const response = await provider.getEvents({
                    address: COLLECTION_ADDRESS,
                    keys: [[TOKEN_MINTED_SELECTOR]],
                    from_block: { block_number: fromBlock },
                    to_block: { block_number: toBlock },
                    chunk_size: 100,
                    continuation_token: continuationToken,
                })

                for (const event of response.events) {
                    try {
                        const data = event.data
                        const dataIter = data[Symbol.iterator]()

                        // Parse collection_id (u256: low, high)
                        const collectionIdLow = dataIter.next().value
                        const collectionIdHigh = dataIter.next().value
                        if (!collectionIdLow || !collectionIdHigh) continue
                        const collectionId = (BigInt(collectionIdLow) + (BigInt(collectionIdHigh) * BigInt("340282366920938463463374607431768211456"))).toString()

                        // Parse token_id (u256: low, high)
                        const tokenIdLow = dataIter.next().value
                        const tokenIdHigh = dataIter.next().value
                        if (!tokenIdLow || !tokenIdHigh) continue
                        const tokenId = (BigInt(tokenIdLow) + (BigInt(tokenIdHigh) * BigInt("340282366920938463463374607431768211456"))).toString()

                        // Parse owner
                        const owner = dataIter.next().value
                        if (!owner) continue

                        // Parse metadata_uri (ByteArray)
                        const metadataUri = parseByteArray(dataIter)

                        // Placeholder address using ID
                        const collectionAddress = "0x" + (BigInt(collectionIdLow) + (BigInt(collectionIdHigh) * BigInt("340282366920938463463374607431768211456"))).toString(16)

                        rangeEvents.push({
                            collectionId,
                            tokenId,
                            owner,
                            metadataUri,
                            txHash: event.transaction_hash,
                            blockNumber: event.block_number || 0,
                            collectionAddress,
                        })
                    } catch (e) {
                        console.error("Error parsing TokenMinted event:", e)
                    }
                }

                continuationToken = response.continuation_token
                pageCount++
            } while (continuationToken && pageCount < maxPagesPerWindow)

        } catch (err) {
            console.error(`Error fetching events range ${fromBlock}-${toBlock}:`, err)
        }

        return rangeEvents
    }, [])

    // Fetch next batch of events (scanning backwards)
    const fetchMoreEvents = useCallback(async (targetCount: number = pageSize) => {
        if (isScanning || !hasMoreBlocks) return

        setIsScanning(true)
        if (allParsedEvents.length === 0) setLoading(true)

        try {
            const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || ""
            const provider = new RpcProvider({ nodeUrl: rpcUrl })

            let currentToBlock = lastScannedBlock

            // If starting fresh, get latest block
            if (currentToBlock === null) {
                const block = await provider.getBlock("latest")
                currentToBlock = block.block_number
            }

            const newEvents: ParsedEvent[] = []
            let attempts = 0
            const maxAttempts = 20

            while (newEvents.length < targetCount && attempts < maxAttempts && currentToBlock > REGISTRY_START_BLOCK) {
                const currentFromBlock = Math.max(REGISTRY_START_BLOCK, currentToBlock - BLOCK_WINDOW_SIZE)

                const windowEvents = await fetchEventsInRange(currentFromBlock, currentToBlock)
                newEvents.push(...windowEvents)

                currentToBlock = currentFromBlock - 1
                attempts++

                if (currentToBlock < REGISTRY_START_BLOCK) {
                    setHasMoreBlocks(false)
                    break
                }
            }

            if (currentToBlock <= REGISTRY_START_BLOCK) {
                setHasMoreBlocks(false)
            }

            setLastScannedBlock(currentToBlock)

            if (newEvents.length > 0) {
                // Sort by block number descending
                newEvents.sort((a, b) => b.blockNumber - a.blockNumber)

                setAllParsedEvents(prev => {
                    const combined = [...prev, ...newEvents]
                    // Deduplicate
                    const uniqueMap = new Map()
                    for (const event of combined) {
                        const key = `${event.collectionId}-${event.tokenId}` // Stable key
                        if (!uniqueMap.has(key)) {
                            uniqueMap.set(key, event)
                        }
                    }
                    return Array.from(uniqueMap.values()).sort((a, b) => b.blockNumber - a.blockNumber)
                })
            }

        } catch (err: any) {
            console.error("Error fetching more events:", err)
            setError(err.message || "Failed to load assets")
        } finally {
            setLoading(false)
            setIsScanning(false)
        }
    }, [isScanning, hasMoreBlocks, lastScannedBlock, fetchEventsInRange, allParsedEvents.length, pageSize])

    useEffect(() => {
        if (lastScannedBlock === null && !loadingMore && !isScanning) {
            fetchMoreEvents(pageSize)
        }
    }, [lastScannedBlock, fetchMoreEvents, pageSize, loadingMore, isScanning])

    // Process visible assets with metadata
    useEffect(() => {
        const processAssets = async () => {
            const eventsToProcess = allParsedEvents.slice(0, displayCount)

            // Fix map key to be stable (collectionId-tokenId)
            const existingAssetsMap = new Map(assets.map(a => [`${a.collectionId}-${a.tokenId}`, a]))
            const processedAssets: RecentAsset[] = []
            const itemsToFetch: { event: ParsedEvent, index: number }[] = []

            for (let i = 0; i < eventsToProcess.length; i++) {
                const evt = eventsToProcess[i]

                // Stable lookup key
                const lookupKey = `${evt.collectionId}-${evt.tokenId}`

                const existing = existingAssetsMap.get(lookupKey)

                // Only reuse if we have a valid resolved address (not the ID fallback)
                // ID fallback usually starts with "0x" and is short (< 10 chars usually for small IDs)
                // Real address is 60+ chars.
                const hasValidAddress = existing && existing.collectionAddress && existing.collectionAddress.length > 40

                if (existing && hasValidAddress) {
                    processedAssets[i] = existing
                } else {
                    itemsToFetch.push({ event: evt, index: i })
                }
            }

            if (itemsToFetch.length === 0) {
                // Just update list order if needed
                if (processedAssets.length !== assets.length) {
                    // Filter holes
                    const cleanList = processedAssets.filter(Boolean)
                    if (cleanList.length !== assets.length || cleanList.some((a, idx) => a.id !== assets[idx].id)) {
                        setAssets(cleanList)
                    }
                }
                return
            }

            // Batch fetch metadata for new items
            const batchSize = 5
            for (let i = 0; i < itemsToFetch.length; i += batchSize) {
                const batch = itemsToFetch.slice(i, i + batchSize)

                // Accumulate results from this batch
                const batchResults = await Promise.all(batch.map(async ({ event: parsed, index }) => {
                    let name = `Asset #${parsed.tokenId}`
                    let image = "/placeholder.svg"
                    let description = ""
                    let category = "Digital Asset"
                    let collectionName = `Collection #${parsed.collectionId}`
                    let realCollectionAddress = parsed.collectionAddress; // Default to ID-as-hex

                    // 1. Fetch real collection address
                    try {
                        const colData = await resolveCollectionAddress(parsed.collectionId);
                        if (colData) {
                            collectionName = colData.name;
                            realCollectionAddress = colData.ipNft;
                        } else {
                            console.warn(`Could not resolve address for collection ${parsed.collectionId}`)
                        }
                    } catch (e) {
                        console.warn("Failed to fetch collection details for recent asset", e);
                    }

                    // 2. Fetch metadata
                    if (parsed.metadataUri) {
                        try {
                            const metadata = await fetchIpfsJson(parsed.metadataUri)
                            if (metadata) {
                                name = metadata.name || name
                                image = resolveMediaUrl(metadata.image || "/placeholder.svg") || "/placeholder.svg"
                                description = metadata.description || ""
                                if (metadata.attributes) {
                                    const typeAttr = metadata.attributes.find((a: any) => a.trait_type?.toLowerCase() === "type")
                                    if (typeAttr) category = typeAttr.value
                                }
                            }
                        } catch (e) {
                            // console.warn(`Failed to fetch metadata for ${parsed.metadataUri}`)
                        }
                    }

                    return {
                        index,
                        asset: {
                            id: `${realCollectionAddress}-${parsed.tokenId}`,
                            tokenId: parsed.tokenId,
                            collectionId: parsed.collectionId,
                            name,
                            image,
                            owner: parsed.owner,
                            txHash: parsed.txHash,
                            metadataUri: parsed.metadataUri,
                            blockNumber: parsed.blockNumber,
                            collectionAddress: realCollectionAddress,
                            collectionName,
                            description,
                            category,
                            creator: parsed.owner?.length > 10 ? `${parsed.owner.slice(0, 6)}...${parsed.owner.slice(-4)}` : parsed.owner,
                            creatorId: parsed.owner,
                            creatorAvatar: "/placeholder-avatar.png",
                            price: "Not Listed",
                            isRemix: false
                        }
                    }
                }))

                // Place results into processedAssets
                batchResults.forEach(res => {
                    processedAssets[res.index] = res.asset
                })

                // Update state incrementally
                setAssets([...processedAssets.filter(Boolean)])
            }
        }

        processAssets()
    }, [allParsedEvents, displayCount])

    const loadMore = async () => {
        if (loadingMore) return
        setLoadingMore(true)

        const newDisplayCount = displayCount + pageSize

        // Check if we need more events
        if (allParsedEvents.length < newDisplayCount && hasMoreBlocks) {
            await fetchMoreEvents(pageSize)
        }

        setDisplayCount(newDisplayCount)
        setLoadingMore(false)
    }

    const refresh = () => {
        setDisplayCount(pageSize)
        setAllParsedEvents([])
        setAssets([])
        setLastScannedBlock(null)
        setHasMoreBlocks(true)
    }

    const hasMore = hasMoreBlocks || allParsedEvents.length > displayCount

    return {
        assets,
        loading: loading || (allParsedEvents.length > 0 && assets.length < Math.min(allParsedEvents.length, displayCount)),
        loadingMore,
        error,
        hasMore,
        totalCount: allParsedEvents.length,
        loadMore,
        refresh
    }
}
