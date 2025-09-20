"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Filter, Grid3X3, List, Users, TrendingUp, Star, MapPin, ArrowUpDown, X } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/src/components/ui/drawer"
import { Skeleton } from "@/src/components/ui/skeleton"
import CreatorCard from "@/src/components/creator-card"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import { useMobile } from "@/src/hooks/use-mobile"

type SortKey = "popular" | "volume" | "assets" | "collections" | "joined" | "alphabetical"
type ViewMode = "grid" | "list"
type CreatorFilter = "all" | "verified" | "trending" | "new"

export default function CreatorsPage() {
  const { creators } = useMockData()
  const isMobile = useMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("popular")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [creatorFilter, setCreatorFilter] = useState<CreatorFilter>("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Enhanced creator data
  const enhancedCreators = useMemo(() => {
    return creators.map((creator) => ({
      ...creator,
      joinedRecently: new Date(creator.joinedDate).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000,
      trending: Math.random() > 0.7,
      volumeEth: Number.parseFloat((Math.random() * 1000).toFixed(1)),
      assets: Math.floor(Math.random() * 200) + 10,
      collections: Math.floor(Math.random() * 50) + 1,
      topCategories: ["Digital Art", "Music", "Patents"].slice(0, Math.floor(Math.random() * 3) + 1),
    }))
  }, [creators])

  // Get unique locations
  const locations = useMemo(() => {
    const locs = enhancedCreators
      .map((creator) => creator.location)
      .filter(Boolean)
      .filter((loc, index, arr) => arr.indexOf(loc) === index)
    return ["all", ...locs]
  }, [enhancedCreators])

  // Filter creators
  const filteredCreators = useMemo(() => {
    let result = enhancedCreators

    // Search filter
    const query = searchQuery.trim().toLowerCase()
    if (query) {
      result = result.filter((creator) => {
        const name = creator.name?.toLowerCase() || ""
        const bio = creator.bio?.toLowerCase() || ""
        const location = creator.location?.toLowerCase() || ""
        return name.includes(query) || bio.includes(query) || location.includes(query)
      })
    }

    // Creator type filter
    if (creatorFilter !== "all") {
      if (creatorFilter === "verified") {
        result = result.filter((creator) => creator.verified)
      } else if (creatorFilter === "trending") {
        result = result.filter((creator) => creator.trending)
      } else if (creatorFilter === "new") {
        result = result.filter((creator) => creator.joinedRecently)
      }
    }

    // Location filter
    if (locationFilter !== "all") {
      result = result.filter((creator) => creator.location === locationFilter)
    }

    // Verified filter
    if (verifiedOnly) {
      result = result.filter((creator) => creator.verified)
    }

    return result
  }, [searchQuery, creatorFilter, locationFilter, verifiedOnly, enhancedCreators])

  // Sort creators
  const sortedCreators = useMemo(() => {
    const result = [...filteredCreators]

    switch (sortBy) {
      case "popular":
        return result.sort((a, b) => (b.assets || 0) - (a.assets || 0))
      case "volume":
        return result.sort((a, b) => (b.volumeEth || 0) - (a.volumeEth || 0))
      case "assets":
        return result.sort((a, b) => (b.assets || 0) - (a.assets || 0))
      case "collections":
        return result.sort((a, b) => (b.collections || 0) - (a.collections || 0))
      case "joined":
        return result.sort((a, b) => new Date(b.joinedDate || 0).getTime() - new Date(a.joinedDate || 0).getTime())
      case "alphabetical":
        return result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      default:
        return result
    }
  }, [filteredCreators, sortBy])

  // Stats
  const stats = useMemo(() => {
    const totalCreators = enhancedCreators.length
    const verifiedCreators = enhancedCreators.filter((c) => c.verified).length
    const newCreators = enhancedCreators.filter((c) => c.joinedRecently).length

    return { totalCreators, verifiedCreators, newCreators }
  }, [enhancedCreators])

  const clearAllFilters = () => {
    setSearchQuery("")
    setCreatorFilter("all")
    setLocationFilter("all")
    setVerifiedOnly(false)
    setIsDrawerOpen(false)
  }

  const hasActiveFilters = searchQuery || creatorFilter !== "all" || locationFilter !== "all" || verifiedOnly

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div
      className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4" : "space-y-3"}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="relative h-20 md:h-24">
            <Skeleton className="h-full w-full" />
          </div>
          <CardContent className="p-3">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-12" />
              </div>
            </div>
            <Skeleton className="h-2 w-full mb-1" />
            <Skeleton className="h-2 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Streamlined Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="px-3 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold">Creators</h1>
              <p className="text-xs text-muted-foreground">{sortedCreators.length} creators</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search & Filter Button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search creators..."
                className="pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader className="pb-4">
                  <DrawerTitle>Filter Creators</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6 space-y-6 overflow-y-auto">
                  {/* Creator Type Tabs */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Creator Type</Label>
                    <Tabs value={creatorFilter} onValueChange={(value) => setCreatorFilter(value as CreatorFilter)}>
                      <TabsList className="grid w-full grid-cols-4 h-9">
                        <TabsTrigger value="all" className="text-xs">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="verified" className="text-xs">
                          Verified
                        </TabsTrigger>
                        <TabsTrigger value="trending" className="text-xs">
                          Trending
                        </TabsTrigger>
                        <TabsTrigger value="new" className="text-xs">
                          New
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Location Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Location</Label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="h-9">
                        <MapPin className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location === "all" ? "All Locations" : location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Sort By</Label>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortKey)}>
                      <SelectTrigger className="h-9">
                        <ArrowUpDown className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="volume">Highest Volume</SelectItem>
                        <SelectItem value="assets">Most Assets</SelectItem>
                        <SelectItem value="collections">Most Collections</SelectItem>
                        <SelectItem value="joined">Recently Joined</SelectItem>
                        <SelectItem value="alphabetical">Alphabetical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Verified Only Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="verified-only" className="text-sm font-medium">
                      Verified Only
                    </Label>
                    <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
                  </div>

                  {/* Active Filters */}
                  {hasActiveFilters && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Active Filters</Label>
                      <div className="flex flex-wrap gap-2">
                        {searchQuery && (
                          <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                            Search: {searchQuery} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        )}
                        {creatorFilter !== "all" && (
                          <Badge variant="secondary" className="cursor-pointer" onClick={() => setCreatorFilter("all")}>
                            Type: {creatorFilter} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        )}
                        {locationFilter !== "all" && (
                          <Badge
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => setLocationFilter("all")}
                          >
                            Location: {locationFilter} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        )}
                        {verifiedOnly && (
                          <Badge variant="secondary" className="cursor-pointer" onClick={() => setVerifiedOnly(false)}>
                            Verified Only <X className="h-3 w-3 ml-1" />
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Clear Filters */}
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={clearAllFilters} className="w-full bg-transparent">
                      Clear All Filters
                    </Button>
                  )}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>

      {/* Compact Mobile Stats */}
      <div className="px-3 py-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-sm font-semibold">{stats.totalCreators}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold">{stats.verifiedCreators}</div>
            <div className="text-xs text-muted-foreground">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold">{stats.newCreators}</div>
            <div className="text-xs text-muted-foreground">New</div>
          </div>
        </div>
      </div>

      {/* Creators Grid/List */}
      <div className="px-3 pb-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : sortedCreators.length > 0 ? (
          <motion.div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6"
                : "space-y-3 md:space-y-4"
            }
            variants={container}
            initial="hidden"
            animate="show"
          >
            {sortedCreators.map((creator, index) => (
              <motion.div key={creator.id} variants={item} className="relative">
                {/* Trending Badge */}
                {creator.trending && (
                  <div className="absolute top-2 right-2 z-10">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                )}

                {/* New Creator Badge */}
                {creator.joinedRecently && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      New
                    </Badge>
                  </div>
                )}

                <CreatorCard creator={creator} index={index} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <div className="text-lg font-medium text-muted-foreground mb-2">No creators found</div>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "Try adjusting your filters"}
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Load More */}
        {sortedCreators.length > 0 && sortedCreators.length >= 12 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Creators
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
