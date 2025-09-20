"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp, Clock, Filter, Grid3X3, List, Search } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/src/components/ui/drawer"
import { NewReleasesShowcase } from "@/src/components/new-releases-showcase"
import { useMobile } from "@/src/hooks/use-mobile"
import { useMockData } from "@/src/lib/hooks/use-mock-data"

const timeFilters = [
  { id: "all", label: "All Time", value: "all" },
  { id: "today", label: "Today", value: "today" },
  { id: "week", label: "This Week", value: "week" },
  { id: "month", label: "This Month", value: "month" },
]

const categoryFilters = [
  { id: "all", label: "All Categories", value: "all" },
  { id: "digital-art", label: "Digital Art", value: "digital-art" },
  { id: "music", label: "Music", value: "music" },
  { id: "patents", label: "Patents", value: "patents" },
  { id: "literature", label: "Literature", value: "literature" },
  { id: "branding", label: "Branding", value: "branding" },
  { id: "film-video", label: "Film & Video", value: "film-video" },
]

const sortOptions = [
  { id: "newest", label: "Newest First", value: "newest" },
  { id: "trending", label: "Trending", value: "trending" },
  { id: "price-high", label: "Price: High to Low", value: "price-high" },
  { id: "price-low", label: "Price: Low to High", value: "price-low" },
  { id: "popular", label: "Most Popular", value: "popular" },
]

export default function NewReleasesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("week")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const isMobile = useMobile()
  const { assets } = useMockData()

  // Filter and sort assets based on current filters
  const filteredAssets = assets
    .filter((asset) => {
      const matchesSearch =
        searchQuery === "" ||
        asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.creator.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter

      // Mock time filtering (in real app, you'd use actual timestamps)
      const matchesTime = timeFilter === "all" || true

      return matchesSearch && matchesCategory && matchesTime
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "price-high":
          return b.price - a.price
        case "price-low":
          return a.price - b.price
        case "trending":
          return b.views - a.views
        case "popular":
          return b.likes - a.likes
        default:
          return 0
      }
    })

  const activeFilters = [
    timeFilter !== "all" && timeFilters.find((f) => f.value === timeFilter)?.label,
    categoryFilter !== "all" && categoryFilters.find((f) => f.value === categoryFilter)?.label,
  ].filter(Boolean)

  const clearAllFilters = () => {
    setTimeFilter("all")
    setCategoryFilter("all")
    setSortBy("newest")
    setSearchQuery("")
  }

  const removeFilter = (filterType: string) => {
    if (filterType === "time") setTimeFilter("all")
    if (filterType === "category") setCategoryFilter("all")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b">
          <div className="px-3 py-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search new releases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>
              </div>
              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 px-3 bg-transparent">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="h-[85vh]">
                  <DrawerHeader className="text-left pb-4">
                    <DrawerTitle>Filter & Sort</DrawerTitle>
                    <DrawerDescription>Customize your new releases view</DrawerDescription>
                  </DrawerHeader>
                  <div className="px-4 pb-4 space-y-6 overflow-y-auto">
                    {/* Time Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Time Period</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {timeFilters.map((filter) => (
                          <Button
                            key={filter.id}
                            variant={timeFilter === filter.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTimeFilter(filter.value)}
                            className="justify-start"
                          >
                            {filter.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <h3 className="font-medium mb-3">Category</h3>
                      <div className="space-y-2">
                        {categoryFilters.map((filter) => (
                          <Button
                            key={filter.id}
                            variant={categoryFilter === filter.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCategoryFilter(filter.value)}
                            className="w-full justify-start"
                          >
                            {filter.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <h3 className="font-medium mb-3">Sort By</h3>
                      <div className="space-y-2">
                        {sortOptions.map((option) => (
                          <Button
                            key={option.id}
                            variant={sortBy === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSortBy(option.value)}
                            className="w-full justify-start"
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {activeFilters.length > 0 && (
                      <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </DrawerContent>
              </Drawer>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="h-9 px-3"
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {timeFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {timeFilters.find((f) => f.value === timeFilter)?.label}
                    <button onClick={() => removeFilter("time")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary" className="text-xs">
                    {categoryFilters.find((f) => f.value === categoryFilter)?.label}
                    <button onClick={() => removeFilter("category")} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <div className="border-b bg-background/95 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                  New Releases
                </h1>
                <p className="text-muted-foreground mt-1">Discover the latest IP assets on MediaLane</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
                  {viewMode === "grid" ? <List className="h-4 w-4 mr-2" /> : <Grid3X3 className="h-4 w-4 mr-2" />}
                  {viewMode === "grid" ? "List View" : "Grid View"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search new releases..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Time Filter */}
                <div className="flex gap-2">
                  {timeFilters.map((filter) => (
                    <Button
                      key={filter.id}
                      variant={timeFilter === filter.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTimeFilter(filter.value)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {filter.label}
                    </Button>
                  ))}
                </div>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 text-sm border rounded-md bg-background"
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {timeFilter !== "all" && (
                  <Badge variant="secondary">
                    {timeFilters.find((f) => f.value === timeFilter)?.label}
                    <button onClick={() => removeFilter("time")} className="ml-2 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                {categoryFilter !== "all" && (
                  <Badge variant="secondary">
                    {categoryFilters.find((f) => f.value === categoryFilter)?.label}
                    <button onClick={() => removeFilter("category")} className="ml-2 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-3 md:px-6">
        <div className="py-4 md:py-6">
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-primary">{filteredAssets.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">New Releases</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-primary">
                {filteredAssets.filter((a) => a.category === "digital-art").length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Digital Art</div>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-primary">
                {filteredAssets.filter((a) => a.category === "music").length}
              </div>
              <div className="text-xs md:text-sm text-muted-foreground">Music</div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-3 md:px-6 pb-6">
        {filteredAssets.length > 0 ? (
          <NewReleasesShowcase assets={filteredAssets} viewMode={viewMode} searchQuery={searchQuery} />
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No new releases found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
            <Button onClick={clearAllFilters}>Clear All Filters</Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
