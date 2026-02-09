"use client"

import { useState, Suspense, useEffect } from "react"
import { motion } from "framer-motion"
import { Grid3X3, Search, Filter, SortAsc, Plus, Loader2 } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Button } from "@/src/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet"
import { Badge } from "@/src/components/ui/badge"
import { useAllCollections } from "@/src/lib/hooks/use-all-collections"
import CollectionCard from "@/src/components/collection-card"
import PageTransition from "@/src/components/page-transition"
import { useMobile } from "@/src/hooks/use-mobile"
import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination"
import { Skeleton } from "@/src/components/ui/skeleton"

// Constants
const ITEMS_PER_PAGE = 12

// Improved Loading Skeleton
const LoadingFallback = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex flex-col space-y-3">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
)

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
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </SheetContent>
  </Sheet>
)

export default function CollectionsPage() {
  const { collections, isLoading, error } = useAllCollections()
  const isMobile = useMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("items")
  const [filterBy, setFilterBy] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

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
    filteredCollections = filteredCollections.filter((col) => col.items > 10)
  }

  // Sort collections
  const sortedCollections = [...filteredCollections].sort((a, b) => {
    if (sortBy === "items") return b.items - a.items
    if (sortBy === "volume") return Number.parseFloat(b.volume || "0") - Number.parseFloat(a.volume || "0")
    if (sortBy === "verified") return (b.verified ? 1 : 0) - (a.verified ? 1 : 0)
    return a.name.localeCompare(b.name)
  })

  // Pagination Logic
  const totalPages = Math.ceil(sortedCollections.length / ITEMS_PER_PAGE)
  const paginatedCollections = sortedCollections.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterBy, sortBy])

  // Scroll to top on page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <PageTransition>
      <div className="min-h-screen py-20">
        <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Grid3X3 className="w-5 h-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
              </div>
              <p className="text-zinc-400 text-sm">
                Discover and explore unique digital collections
              </p>
            </div>

            <Link href="/create/collection">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Collection
              </Button>
            </Link>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="mb-8 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="search"
                  placeholder="Search collections..."
                  className="pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {!isMobile ? (
                <div className="flex items-center gap-3">
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-[180px] bg-zinc-900/50 border-zinc-800">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Collections</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="trending">Trending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-zinc-900/50 border-zinc-800">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sort By" />
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
              ) : (
                <FilterSheet sortBy={sortBy} setSortBy={setSortBy} filterBy={filterBy} setFilterBy={setFilterBy} />
              )}
            </div>

            {/* Results count */}
            {!isLoading && (
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <p>
                  Showing {paginatedCollections.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, sortedCollections.length)} of {sortedCollections.length} collections
                </p>
                {(searchQuery || filterBy !== 'all') && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setFilterBy("all")
                    }}
                    className="text-primary hover:text-primary/80 px-0"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          {/* Collections Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="min-h-[400px]"
          >
            {isLoading ? (
              <LoadingFallback />
            ) : paginatedCollections.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {paginatedCollections.map((collection, index) => (
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {/* Simplified pagination logic for demonstration - can be enhanced for many pages */}
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            isActive={currentPage === i + 1}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(i + 1);
                            }}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
                  <Grid3X3 className="w-10 h-10 text-zinc-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">No collections found</h3>
                <p className="text-zinc-400 max-w-sm mx-auto mb-6">
                  We couldn't find any collections matching your criteria. Try adjusting your filters or search query.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterBy("all")
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition >
  )
}
