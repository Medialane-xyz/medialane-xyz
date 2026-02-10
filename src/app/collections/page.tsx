"use client"

import { useState, useMemo, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, LayoutGrid, List, SlidersHorizontal, ArrowUpDown, RefreshCw, Loader2, Box } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/src/components/ui/sheet"
import { Label } from "@/src/components/ui/label"
import CollectionCard from "@/src/components/collection-card"
import { useCollectionsScanner, ScannedCollection } from "@/src/lib/hooks/use-collections-scanner"
import { useMobile } from "@/src/hooks/use-mobile"
import { useRouter } from "next/navigation"

export default function CollectionsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("newest")

  // Optimized hook
  const { collections, loading, loadingMore, error, hasMore, loadMore, refresh } = useCollectionsScanner(12)
  const isMobile = useMobile()

  // Client-side filtering/sorting
  const filteredCollections = useMemo(() => {
    let result = [...collections]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
      )
    }

    // Sort
    // Note: Newest is default as hook returns them in that order roughly
    if (sortBy === "oldest") {
      result.sort((a, b) => Number(a.id) - Number(b.id))
    } else if (sortBy === "name_asc") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === "name_desc") {
      result.sort((a, b) => b.name.localeCompare(a.name))
    } else {
      // newest/default - keep hook order (descending ID usually)
      result.sort((a, b) => Number(b.id) - Number(a.id))
    }

    return result
  }, [collections, searchQuery, sortBy])

  // Infinite scroll
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

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Collections</h1>
            <p className="text-muted-foreground max-w-2xl">
              Explore diverse NFT collections on the Medialane protocol.
            </p>
          </div>
          <Button onClick={() => router.push("/create")} className="md:self-end">
            Create Collection
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl glass-effect border border-white/10 backdrop-blur-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-transparent border-white/10 focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
              >
                <Box className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] bg-transparent border-white/10">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                <SelectItem value="name_desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>

            <div className="bg-white/5 border border-white/10 rounded-lg p-1 flex">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              disabled={loading}
              className="h-10 w-10 border-white/10 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 ${loading && !loadingMore ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading && !loadingMore && collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Scanning for collections...</p>
            </div>
          ) : (
            <>
              {filteredCollections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-xl bg-white/5">
                  <Box className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <h3 className="text-lg font-medium">No collections found</h3>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery ? "Try different search terms" : "Be the first to create one!"}
                  </p>
                </div>
              ) : (
                <div className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "flex flex-col gap-4"
                }>
                  {filteredCollections.map(collection => (
                    <div key={collection.id} className="contents">
                      {/* 
                                                Note: CollectionCard expects particular props. 
                                                We map ScannedCollection to what CollectionCard needs.
                                             */}
                      <CollectionCard
                        collection={{
                          ...collection,
                          itemCount: collection.totalSupply || 0,
                          items: collection.totalSupply || 0,
                          image: collection.image,
                          banner: collection.headerImage,
                        } as any}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Load More */}
              <div ref={sentinelRef} className="py-8 flex justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more collections...
                  </div>
                )}
                {!hasMore && collections.length > 0 && !searchQuery && (
                  <p className="text-muted-foreground text-sm">End of collections</p>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
