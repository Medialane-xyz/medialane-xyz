"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Box, Loader2, RefreshCw, AlertCircle, LayoutGrid, List } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
import AssetCard from "@/src/components/asset-card"
import { useRecentAssets, RecentAsset } from "@/src/lib/hooks/use-recent-assets"
import { Card } from "@/src/components/ui/card"
import { useMobile } from "@/src/hooks/use-mobile"
import { useRouter } from "next/navigation"

type ViewMode = "grid" | "list"

export default function AssetsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState<ViewMode>("grid")

  // Optimized hook
  const { assets, loading, loadingMore, error, hasMore, totalCount, loadMore, refresh } = useRecentAssets(40)
  const isMobile = useMobile()

  // Client-side filtering of loaded assets
  // Note: In a real production app with millions of assets, search should be server-side/indexer-based.
  // For now, this filters what we have loaded from the event scan.
  const filteredAssets = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return assets

    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(q) ||
        (asset.collectionName || "").toLowerCase().includes(q) ||
        (asset.creator || "").toLowerCase().includes(q)
    )
  }, [assets, searchQuery])

  // Infinite scroll intersection observer
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const onIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const entry = entries[0]
    if (entry.isIntersecting && hasMore && !loadingMore && !searchQuery) {
      loadMore()
    }
  }, [hasMore, loadingMore, searchQuery, loadMore])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [onIntersect])

  const clearSearch = () => setSearchQuery("")

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">
      <main className="max-w-7xl mx-auto">

        <div className="relative mb-8 md:mb-12">
          <div className="relative flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="tracking-tight text-foreground text-3xl font-bold">
                IP Assets
              </h1>
              <p className="text-muted-foreground">
                Discover and collect intellectual property assets
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={loading}
                className="h-9 gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading && !loadingMore ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, collection, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 w-full bg-transparent border-white/10"
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5"
                  onClick={clearSearch}
                >
                  <span className="sr-only">Clear</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4 text-zinc-400"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="inline-flex rounded-lg border border-white/10 p-0.5 shrink-0">
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                className={`h-9 w-9 p-0 ${view === "grid" ? "bg-primary/90" : ""}`}
                onClick={() => setView("grid")}
                aria-pressed={view === "grid"}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                className={`h-9 w-9 p-0 ${view === "list" ? "bg-primary/90" : ""}`}
                onClick={() => setView("list")}
                aria-pressed={view === "list"}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
              <Button variant="link" onClick={refresh} className="h-auto p-0 ml-2">Try Again</Button>
            </div>
          )}

          {loading && !loadingMore && assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-muted-foreground">Scanning blockchain for assets...</p>
            </div>
          ) : filteredAssets.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border border-dashed border-white/10 rounded-xl bg-white/5">
              <Box className="h-10 w-10 text-muted-foreground/50" />
              <div className="space-y-1">
                <h3 className="font-medium">No assets found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "No assets have been minted yet"}
                </p>
              </div>
            </div>
          ) : (
            <>
              {view === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredAssets.map((asset) => (
                    <div key={asset.id} className="contents">
                      <AssetCard asset={asset} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 divide-y divide-white/10 overflow-hidden">
                  {filteredAssets.map((asset) => (
                    <AssetListItem key={asset.id} asset={asset} />
                  ))}
                </div>
              )}

              {/* Load More Trigger */}
              <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-8">
                {loadingMore && (
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more…
                  </div>
                )}
                {!hasMore && assets.length > 0 && !searchQuery && (
                  <p className="text-center text-muted-foreground text-sm">
                    End of collection.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function AssetListItem({ asset }: { asset: RecentAsset }) {
  const router = useRouter()
  const onCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // router.push(`/users/${asset.creatorId || "1"}`) 
  }
  const onOpen = () => router.push(`/assets/${asset.id}`)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" ? onOpen() : null)}
      className="flex items-stretch gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer content-visibility-auto bg-black/20"
    >
      <div className="relative w-24 h-24 rounded-md overflow-hidden border border-white/10 shrink-0 bg-muted/30">
        <img
          src={asset.image || "/placeholder.svg?height=96&width=96&query=asset-preview"}
          alt={asset.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute bottom-1 left-1">
          <Badge variant="outline" className="bg-black/50 text-white border-white/20 text-[10px]">
            {asset.category || "Asset"}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0 justify-center">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium truncate text-lg">{asset.name}</h3>
          <div className="text-sm font-semibold">{asset.price}</div>
        </div>
        <div className="text-sm text-muted-foreground truncate mb-2">
          {asset.collectionName}
        </div>

        <div className="flex items-center gap-2 mt-auto">
          <div
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
            onClick={onCreatorClick}
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] uppercase">
              {String(asset.creator || "NA").slice(0, 2)}
            </span>
            <span className="truncate max-w-[100px]">{asset.creator}</span>
          </div>

          <Button size="sm" variant="outline" className="h-7 px-3 ml-auto rounded-full bg-transparent hover:bg-white/10">
            View Details
          </Button>
        </div>
      </div>
    </div>
  )
}
