"use client"

import { useState, Suspense } from "react"
import { motion } from "framer-motion"
import { Grid3X3, Search, Filter, SortAsc, Eye, TrendingUp, Plus } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet"
import { Badge } from "@/src/components/ui/badge"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import CollectionCard from "@/src/components/collection-card"
import PageTransition from "@/src/components/page-transition"
import { useMobile } from "@/src/hooks/use-mobile"
import Link from "next/link"

// Mobile-optimized loading fallback
const LoadingFallback = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-64 sm:h-72 bg-zinc-800/20 rounded-xl animate-pulse" />
    ))}
  </div>
)

// Mobile-first stats component
const CollectionStats = ({ collections }: { collections: any[] }) => {
  const totalItems = collections.reduce((sum, col) => sum + (col.items || 0), 0)
  const totalVolume = collections.reduce((sum, col) => sum + Number.parseFloat(col.volume || "0"), 0)

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div className="glass-effect rounded-lg p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center mb-1">
          <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-1" />
        </div>
        <div className="text-lg sm:text-xl font-bold">{collections.length}</div>
        <div className="text-xs sm:text-sm text-zinc-400">Collections</div>
      </div>
      <div className="glass-effect rounded-lg p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center mb-1">
          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-1" />
        </div>
        <div className="text-lg sm:text-xl font-bold">{totalItems.toLocaleString()}</div>
        <div className="text-xs sm:text-sm text-zinc-400">Assets</div>
      </div>
      <div className="glass-effect rounded-lg p-3 sm:p-4 text-center">
        <div className="flex items-center justify-center mb-1">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary mr-1" />
        </div>
        <div className="text-lg sm:text-xl font-bold">{totalVolume.toFixed(1)}</div>
        <div className="text-xs sm:text-sm text-zinc-400">Volume</div>
      </div>
    </div>
  )
}

// Mobile-optimized filter sheet
const FilterSheet = ({ sortBy, setSortBy, filterBy, setFilterBy }: any) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="sm" className="h-9 px-3 bg-transparent">
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom" className="h-[60vh]">
      <SheetHeader>
        <SheetTitle>Filter & Sort Collections</SheetTitle>
      </SheetHeader>
      <div className="space-y-6 mt-6">
        <div>
          <label className="text-sm font-medium mb-3 block">Sort By</label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="items">Most Items</SelectItem>
              <SelectItem value="volume">Highest Volume</SelectItem>
              <SelectItem value="verified">Verified First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block">Filter By</label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filterBy === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterBy("all")}
            >
              All
            </Badge>
            <Badge
              variant={filterBy === "verified" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterBy("verified")}
            >
              Verified
            </Badge>
            <Badge
              variant={filterBy === "trending" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilterBy("trending")}
            >
              Trending
            </Badge>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
)

export default function CollectionsPage() {
  const { collections } = useMockData()
  const isMobile = useMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("items")
  const [filterBy, setFilterBy] = useState("all")

  // Filter collections
  let filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.creator.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Apply filters
  if (filterBy === "verified") {
    filteredCollections = filteredCollections.filter((col) => col.verified)
  } else if (filterBy === "trending") {
    filteredCollections = filteredCollections.filter((col) => Number.parseFloat(col.volume || "0") > 10)
  }

  // Sort collections
  const sortedCollections = [...filteredCollections].sort((a, b) => {
    if (sortBy === "items") return b.items - a.items
    if (sortBy === "volume") return Number.parseFloat(b.volume || "0") - Number.parseFloat(a.volume || "0")
    if (sortBy === "verified") return (b.verified ? 1 : 0) - (a.verified ? 1 : 0)
    if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    return a.name.localeCompare(b.name)
  })

  return (
    <PageTransition>
      <div className="min-h-screen pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-24 md:pb-32">
        {/* Mobile-first header */}
        <div className="px-3 sm:px-4 md:px-8">
          <motion.div
            className="text-center lg:text-left mb-4 sm:mb-6 md:mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex-1">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-3 sm:mb-4">
                <Grid3X3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-primary" />
                <h1 className="font-medium">Collections</h1>
              </div>
              
              
            </div>
            <Link href="/create/collection">
              <Button className="whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Create Collection
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CollectionStats collections={collections} />
          </motion.div>

          {/* Mobile-optimized search and filters */}
          <motion.div
            className="mb-4 sm:mb-6 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="glass-effect p-3 sm:p-4 rounded-xl space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="search"
                  placeholder="Search collections..."
                  className="pl-10 h-9 sm:h-10 bg-transparent border-white/10 focus-visible:ring-primary text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Desktop filters */}
              {!isMobile && (
                <div className="flex items-center gap-3">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px] h-10 bg-transparent border-white/10">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="items">Most Items</SelectItem>
                      <SelectItem value="volume">Highest Volume</SelectItem>
                      <SelectItem value="verified">Verified First</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={filterBy === "all" ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setFilterBy("all")}
                    >
                      All
                    </Badge>
                    <Badge
                      variant={filterBy === "verified" ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setFilterBy("verified")}
                    >
                      Verified
                    </Badge>
                    <Badge
                      variant={filterBy === "trending" ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => setFilterBy("trending")}
                    >
                      Trending
                    </Badge>
                  </div>
                </div>
              )}

              {/* Mobile filter sheet */}
              {isMobile && (
                <FilterSheet sortBy={sortBy} setSortBy={setSortBy} filterBy={filterBy} setFilterBy={setFilterBy} />
              )}
            </div>
          </motion.div>

          {/* Results count */}
          <motion.div
            className="mb-4 sm:mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs sm:text-sm text-zinc-400">
                {sortedCollections.length} collection{sortedCollections.length !== 1 ? "s" : ""} found
              </p>
              {searchQuery && (
                <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="text-xs h-7">
                  Clear search
                </Button>
              )}
            </div>
          </motion.div>

          {/* Collections grid */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Suspense fallback={<LoadingFallback />}>
              {sortedCollections.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {sortedCollections.map((collection, index) => (
                    <motion.div
                      key={collection.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <CollectionCard collection={collection} index={index} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-16">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-zinc-800/50 flex items-center justify-center">
                    <Grid3X3 className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">No collections found</h3>
                  <p className="text-sm sm:text-base text-zinc-400 mb-4">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("")
                      setFilterBy("all")
                    }}
                    className="text-sm"
                  >
                    Reset filters
                  </Button>
                </div>
              )}
            </Suspense>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
