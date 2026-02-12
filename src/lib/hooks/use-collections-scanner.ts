"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { RpcProvider, shortString, Contract } from "starknet"
import { ipCollectionAbi } from "@/src/abis/ip_collection"
import { fetchIpfsJson, resolveMediaUrl } from "@/src/lib/ipfs"
import { num } from "starknet"

// Helper to handle u256 from Starknet (can be BigInt or struct {low, high})
function toBigInt(val: any): bigint {
    if (typeof val === 'bigint') return val;
    if (val && typeof val === 'object' && 'low' in val && 'high' in val) {
        return BigInt(val.low) + (BigInt(val.high) * BigInt("340282366920938463463374607431768211456"));
    }
    return BigInt(0);
}

const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS
// Start block where the registry was deployed (or reasonable recent block)
const REGISTRY_START_BLOCK = Number(process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_START_BLOCK) || 0
const COLLECTION_CREATED_SELECTOR = "0xfca650bfd622aeae91aa1471499a054e4c7d3f0d75fbcb98bdb3bbb0358b0c"
const BLOCK_WINDOW_SIZE = 50000

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

interface ParsedEvent {
    collectionId: string
    owner: string
    name: string
    symbol: string
    baseUri: string
    blockNumber: number
    txHash: string
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

export function useCollectionsScanner(pageSize: number = 12): UseCollectionsScannerReturn {
    const [allParsedEvents, setAllParsedEvents] = useState<ParsedEvent[]>([])
    const [collections, setCollections] = useState<ScannedCollection[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [displayCount, setDisplayCount] = useState(pageSize)

    // Scanning state
    const [lastScannedBlock, setLastScannedBlock] = useState<number | null>(null)
    const [hasMoreBlocks, setHasMoreBlocks] = useState(true)
    const [isScanning, setIsScanning] = useState(false)
    const hasInitialized = useRef(false)

    // Removed useContract hook call

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
                    keys: [[COLLECTION_CREATED_SELECTOR]],
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

                        // Parse owner
                        const owner = dataIter.next().value || "0x0"

                        // Parse name (ByteArray)
                        const name = parseByteArray(dataIter)

                        // Parse symbol (ByteArray)
                        const symbol = parseByteArray(dataIter)

                        // Parse base_uri (ByteArray)
                        const baseUri = parseByteArray(dataIter)

                        rangeEvents.push({
                            collectionId,
                            owner,
                            name,
                            symbol,
                            baseUri,
                            blockNumber: event.block_number || 0,
                            txHash: event.transaction_hash,
                        })
                    } catch (e) {
                        console.error("Error parsing CollectionCreated event:", e)
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
        if (isScanning || !hasMoreBlocks) {
            // If scanning or no more blocks, but we have events in buffer we haven't shown, we should probably check if we need to load more?
            // Actually this check is fine.
            return
        }

        setIsScanning(true)
        if (allParsedEvents.length === 0) setLoading(true)

        try {
            const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || ""
            const provider = new RpcProvider({ nodeUrl: rpcUrl })

            let currentToBlock = lastScannedBlock

            // If starting fresh, get latest block
            if (currentToBlock === null) {
                try {
                    const block = await provider.getBlock("latest")
                    currentToBlock = block.block_number
                } catch (e) {
                    console.error("Failed to get latest block", e)
                    // Fallback to a high number or error out?
                    // Let's assume we can't proceed without latest block
                    setIsScanning(false)
                    setLoading(false)
                    return
                }
            }

            const newEvents: ParsedEvent[] = []
            let attempts = 0
            const maxAttempts = 10

            // Scan backwards until we find enough events or hit start block
            while (newEvents.length < targetCount && attempts < maxAttempts && currentToBlock > REGISTRY_START_BLOCK) {
                const currentFromBlock = Math.max(REGISTRY_START_BLOCK, currentToBlock - BLOCK_WINDOW_SIZE)

                console.log(`Scanner: Fetching collections from ${currentFromBlock} to ${currentToBlock}`)
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
                // Sort by block number descending (newest first)
                newEvents.sort((a, b) => b.blockNumber - a.blockNumber)

                setAllParsedEvents(prev => {
                    const combined = [...prev, ...newEvents]
                    // Deduplicate
                    const uniqueMap = new Map()
                    for (const event of combined) {
                        if (!uniqueMap.has(event.collectionId)) {
                            uniqueMap.set(event.collectionId, event)
                        }
                    }
                    return Array.from(uniqueMap.values()).sort((a, b) => b.blockNumber - a.blockNumber)
                })
            } else if (currentToBlock <= REGISTRY_START_BLOCK) {
                // If no events found and we hit start block
                setHasMoreBlocks(false)
            }

        } catch (err: any) {
            console.error("Error fetching more events:", err)
            setError(err.message || "Failed to load collections")
        } finally {
            setLoading(false)
            setIsScanning(false)
        }
    }, [isScanning, hasMoreBlocks, lastScannedBlock, fetchEventsInRange, allParsedEvents.length, pageSize])

    useEffect(() => {
        if (!hasInitialized.current) {
            hasInitialized.current = true
            fetchMoreEvents(pageSize)
        } else if (lastScannedBlock !== null && !loadingMore && !isScanning && allParsedEvents.length < displayCount && hasMoreBlocks) {
            // Auto fetch more if we don't have enough to fill the page
            fetchMoreEvents(pageSize)
        }
    }, [lastScannedBlock, fetchMoreEvents, pageSize, loadingMore, isScanning, allParsedEvents.length, displayCount])


    // Process visible collections with full metadata
    useEffect(() => {
        const processCollections = async () => {
            const eventsToProcess = allParsedEvents.slice(0, displayCount)

            // Map ID to existing collection to avoid re-fetching
            const existingMap = new Map(collections.map(c => [c.id, c]))
            const processedList: ScannedCollection[] = []
            const itemsToFetch: { event: ParsedEvent, index: number }[] = []

            for (let i = 0; i < eventsToProcess.length; i++) {
                const evt = eventsToProcess[i]
                if (existingMap.has(evt.collectionId)) {
                    processedList[i] = existingMap.get(evt.collectionId)!
                } else {
                    itemsToFetch.push({ event: evt, index: i })
                }
            }

            if (itemsToFetch.length === 0) {
                if (processedList.length !== collections.length) {
                    setCollections(processedList)
                }
                return
            }

            // Batch fetch details
            const batchSize = 5

            // Setup provider and contract
            const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || ""
            const provider = new RpcProvider({ nodeUrl: rpcUrl })
            const contract = new Contract(ipCollectionAbi, COLLECTION_ADDRESS!, provider)

            for (let i = 0; i < itemsToFetch.length; i += batchSize) {
                const batch = itemsToFetch.slice(i, i + batchSize)

                await Promise.all(batch.map(async ({ event: parsed, index }) => {
                    try {
                        let name = parsed.name || `Collection #${parsed.collectionId}`
                        let image = "/placeholder.svg"
                        let headerImage = ""
                        let description = ""

                        // IPFS Metadata
                        if (parsed.baseUri) {
                            try {
                                let uri = parsed.baseUri
                                if (uri.startsWith("ipfs://")) uri = uri.replace("ipfs://", "")

                                let metadata = null
                                if (uri.endsWith('/')) {
                                    metadata = await fetchIpfsJson(`${uri}collection.json`)
                                }

                                if (!metadata) {
                                    metadata = await fetchIpfsJson(uri)
                                }

                                if (metadata) {
                                    name = metadata.name || name
                                    image = resolveMediaUrl(metadata.image || "") || "/placeholder.svg"
                                    headerImage = resolveMediaUrl(metadata.banner || metadata.headerImage || "") || ""
                                    description = metadata.description || ""
                                }
                            } catch (e) {
                                console.warn(`Scanner: Failed to fetch/parse IPFS for ${parsed.collectionId}`, e)
                            }
                        }

                        // Get stats (totalSupply) - we need to call contract for this
                        let totalSupply = 0
                        let ipNft = parsed.collectionId // Default fallback if we can't get address (should fetch from contract)

                        if (contract) {
                            try {
                                const stats: any = await contract.get_collection_stats(parsed.collectionId, { blockIdentifier: "latest" })
                                totalSupply = Number(toBigInt(stats.total_minted) - toBigInt(stats.total_burned))

                                // Ideally we get the address too if we want to be 100% sure, but event doesn't give address directly, 
                                // wait, event gives owner but not ip_nft address. 
                                // Actually we can compute or fetch. 
                                // Let's fetch the struct to be safe and get the real address.
                                const rawData: any = await contract.get_collection(parsed.collectionId, { blockIdentifier: "latest" })
                                ipNft = num.toHex(rawData.ip_nft)

                            } catch (e) { }
                        }

                        processedList[index] = {
                            id: parsed.collectionId,
                            name,
                            symbol: parsed.symbol,
                            image,
                            headerImage,
                            description,
                            owner: parsed.owner,
                            nftAddress: ipNft,
                            baseUri: parsed.baseUri,
                            totalSupply,
                            isValid: true,
                            type: "Standard"
                        }

                    } catch (e) {
                        console.warn(`Failed to process collection ${parsed.collectionId}`, e)
                    }
                }))

                setCollections([...processedList.filter(Boolean)])
            }
        }

        processCollections()
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
        console.log("Scanner: Refreshing...")
        setDisplayCount(pageSize)
        setAllParsedEvents([])
        setCollections([])
        setLastScannedBlock(null)
        setHasMoreBlocks(true)
        hasInitialized.current = false // Allow re-init
        // Trigger re-fetch
        setTimeout(() => fetchMoreEvents(pageSize), 0)
    }

    const hasMore = hasMoreBlocks || allParsedEvents.length > displayCount

    return {
        collections,
        loading: loading || (allParsedEvents.length > 0 && collections.length < Math.min(allParsedEvents.length, displayCount)),
        loadingMore,
        error,
        hasMore,
        loadMore,
        refresh
    }
}
