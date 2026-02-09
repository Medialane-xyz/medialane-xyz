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

            // For now, let's limit to the last 3 collections to avoid massive loading times
            // and fetch up to 10 tokens from each
            const recentCollections = collections.sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5)

            const allTokens: any[] = []

            for (const col of recentCollections) {
                console.log(`[useAllAssets] Fetching tokens for collection ${col.id} (${col.name})`)
                const startTokenId = 0
                const endTokenId = Math.min(col.items || 0, 10) // Limit to 10 items per collection for demo

                const promises = []
                for (let i = startTokenId; i < endTokenId; i++) {
                    // identifier = collectionId:tokenId
                    const identifier = `${col.id}:${i}`
                    promises.push(fetchTokenData(identifier, col.baseUri))
                }

                const tokens = await Promise.all(promises)
                const validTokens = tokens.filter((t): t is ExtendedTokenData => t !== null)

                // Map to Asset Card format
                const mappedTokens = validTokens.map(t => ({
                    id: t.identifier,
                    tokenId: t.token_id.toString(),
                    collectionAddress: col.ipNft, // Important for addressing
                    collectionName: col.name,
                    name: t.name || `Token #${t.token_id}`,
                    description: t.description,
                    image: t.image || "/placeholder.svg",
                    creator: t.owner ? (t.owner.length > 10 ? `${t.owner.slice(0, 6)}...${t.owner.slice(-4)}` : t.owner) : "Unknown",
                    creatorId: t.owner, // Address as ID
                    creatorAvatar: "/placeholder-avatar.png", // Mock for now
                    price: "Not Listed", // Would need marketplace data
                    likes: 0,
                    views: 0,
                    category: t.attributes?.find((a: any) => a.trait_type === "type")?.value || "Digital Asset",
                    isRemix: false, // Would need remix check
                    verified: col.verified,
                    programmable: true // Default for IP assets
                }))

                allTokens.push(...mappedTokens)
            }

            // Shuffle or sort? Let's sort by "newest" implicitly (by collection ID then token ID)
            // Actually, let's just reverse them so newest collections are first
            setAssets(allTokens)
            console.log(`[useAllAssets] Loaded ${allTokens.length} assets`)

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
