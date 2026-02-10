"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchAllCollections } from "@/src/lib/hooks/use-all-collections"
import { fetchTokenData, ExtendedTokenData } from "@/src/lib/hooks/use-collection-tokens"

export function useAllAssets() {
    const [assets, setAssets] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchAssets = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            console.log("[useAllAssets] Fetching all collections...")
            const collections = await fetchAllCollections()

            if (collections.length === 0) {
                setAssets([])
                setIsLoading(false)
                return
            }

            const recentCollections = collections.sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 10)
            const allTokens: any[] = []

            // Process collections sequentially to avoid overwhelming the network
            for (const col of recentCollections) {
                console.log(`[useAllAssets] Fetching tokens for collection ${col.id} (${col.name})`)
                const startTokenId = 0
                const endTokenId = Math.min(col.items || 0, 20) // Limit to 20 items per collection

                if (endTokenId === 0) continue

                // Process tokens in small batches within each collection
                const TOKEN_BATCH_SIZE = 5
                for (let i = startTokenId; i < endTokenId; i += TOKEN_BATCH_SIZE) {
                    const batchPromises = []
                    for (let j = 0; j < TOKEN_BATCH_SIZE && (i + j) < endTokenId; j++) {
                        const tokenId = i + j
                        const identifier = `${col.id}:${tokenId}`
                        batchPromises.push(fetchTokenData(identifier, col.baseUri))
                    }

                    const batchResults = await Promise.all(batchPromises)
                    const validTokens = batchResults.filter((t): t is ExtendedTokenData => t !== null)

                    const mappedTokens = validTokens.map(t => ({
                        id: t.identifier,
                        tokenId: t.token_id.toString(),
                        collectionAddress: col.ipNft,
                        collectionName: col.name,
                        name: t.name || `Token #${t.token_id}`,
                        description: t.description,
                        image: t.image || "/placeholder.svg",
                        creator: t.owner ? (t.owner.length > 10 ? `${t.owner.slice(0, 6)}...${t.owner.slice(-4)}` : t.owner) : "Unknown",
                        creatorId: t.owner,
                        creatorAvatar: "/placeholder-avatar.png",
                        price: "Not Listed",
                        likes: 0,
                        views: 0,
                        category: t.attributes?.find((a: any) => a.trait_type === "type")?.value || "Digital Asset",
                        isRemix: false,
                        verified: col.verified,
                        programmable: true
                    }))

                    allTokens.push(...mappedTokens)
                    // Update UI incrementally after each batch for better perceived performance
                    setAssets([...allTokens])
                }
            }

            console.log(`[useAllAssets] Finished loading all tokens`)

        } catch (e) {
            console.error("[useAllAssets] Error:", e)
            setError(e instanceof Error ? e : new Error("Failed to fetch assets"))
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAssets()
    }, [fetchAssets])

    return { assets, isLoading, error, refetch: fetchAssets }
}
