"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Compass,
  Search,
  Filter,
  ChevronDown,
  Grid,
  Layout,
  Sparkles,
  Tag,
  Clock,
  TrendingUp,
  X,
  FileCheck,
} from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"
import { useToast } from "@/src/components/ui/use-toast"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import AssetCard from "@/src/components/asset-card"
import CollectionCard from "@/src/components/collection-card"
import CreatorCard from "@/src/components/creator-card"
import PageTransition from "@/src/components/page-transition"
import { useRouter } from "next/navigation"
import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar"

export default function ExplorePage() {
  const { assets, collections, creators } = useMockData()
  const { toast } = useToast()
  const router = useRouter()

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState("grid")
  const [priceRange, setPriceRange] = useState([0, 10])
  const [selectedFilters, setSelectedFilters] = useState([])
  const [showFilters, setShowFilters] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  // Categories derived from mock data
  const categories = ["art", "music", "patent", "literature", "brand", "film"]

  // Reset initial load state after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoad(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Handler for the search form submission
  const handleSearch = (e) => {
    e.preventDefault()
    setIsSearching(true)

    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
      toast({
        title: "Search complete",
        description: `Found ${filteredAssets.length} assets matching "${searchQuery}"`,
      })
    }, 600)
  }

  // Add a filter tag
  const addFilter = (filter) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter])
    }
  }

  // Remove a filter tag
  const removeFilter = (filter) => {
    setSelectedFilters(selectedFilters.filter((f) => f !== filter))
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters([])
    setCategory("all")
    setSortBy("recent")
    setPriceRange([0, 10])
    setSearchQuery("")
  }

  // Filter assets based on search, category, and custom filters
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = searchQuery
      ? asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    const matchesCategory = category === "all" || asset.category.toLowerCase() === category.toLowerCase()

    // Check if asset matches any of the selected filter tags
    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.some(
        (filter) =>
          asset.category.toLowerCase() === filter.toLowerCase() ||
          asset.creator.toLowerCase().includes(filter.toLowerCase()),
      )

    // Price range check - convert string price (e.g. "2.5 STRK") to number
    const priceValue = Number.parseFloat(asset.price.split(" ")[0])
    const matchesPriceRange = priceValue >= priceRange[0] && priceValue <= priceRange[1]

    return matchesSearch && matchesCategory && matchesFilters && matchesPriceRange
  })

  // Filter collections based on search and custom filters
  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = searchQuery
      ? collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    // Check if collection matches any of the selected filter tags
    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.some((filter) => collection.creator.toLowerCase().includes(filter.toLowerCase()))

    return matchesSearch && matchesFilters
  })

  // Filter creators based on search and custom filters
  const filteredCreators = creators.filter((creator) => {
    const matchesSearch = searchQuery
      ? creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.bio.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    // Check if creator matches any of the selected filter tags
    const matchesFilters =
      selectedFilters.length === 0 ||
      selectedFilters.some((filter) => creator.name.toLowerCase().includes(filter.toLowerCase()))

    return matchesSearch && matchesFilters
  })

  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === "price-high") return Number.parseFloat(b.price) - Number.parseFloat(a.price)
    if (sortBy === "price-low") return Number.parseFloat(a.price) - Number.parseFloat(b.price)
    if (sortBy === "likes") return b.likes - a.likes
    if (sortBy === "name-asc") return a.name.localeCompare(b.name)
    if (sortBy === "name-desc") return b.name.localeCompare(a.name)
    // Default: recent
    return Number.parseInt(b.id) - Number.parseInt(a.id)
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">
        {/* Hero Section */}
        <motion.div
          className="flex flex-col items-center text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Compass className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium">Discover IP</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 gradient-text">Explore Programmable IP</h1>

          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mb-8">
            Discover unique intellectual property assets with zero-fee licensing on Starknet
          </p>

          {/* Featured tags */}
          <div className="flex flex-wrap gap-2 justify-center max-w-3xl mb-6">
            <Badge
              variant="outline"
              className="px-3 py-1 hover:bg-primary/20 cursor-pointer transition-all"
              onClick={() => {
                addFilter("trending")
                toast({ title: "Filter added", description: "Showing trending assets" })
              }}
            >
              <TrendingUp className="w-3 h-3 mr-1" /> Trending
            </Badge>

            {categories.map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                className="px-3 py-1 hover:bg-primary/20 cursor-pointer transition-all capitalize"
                onClick={() => {
                  setCategory(cat)
                  toast({ title: "Category selected", description: `Showing ${cat} assets` })
                }}
              >
                {cat}
              </Badge>
            ))}

            <Badge
              variant="outline"
              className="px-3 py-1 hover:bg-primary/20 cursor-pointer transition-all"
              onClick={() => {
                addFilter("verified")
                toast({ title: "Filter added", description: "Showing verified assets" })
              }}
            >
              <FileCheck className="w-3 h-3 mr-1" /> Verified
            </Badge>
          </div>

          {/* Main search form */}
          <form className="w-full max-w-3xl" onSubmit={handleSearch}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  type="search"
                  placeholder="Search assets, collections, creators..."
                  className="pl-10 pr-4 py-6 bg-zinc-800/40 border-zinc-700 focus-visible:ring-primary w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button type="submit" className="h-12 px-6" disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-12 w-12 p-0 md:block flex items-center justify-center"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Advanced Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto mb-8 overflow-hidden"
            >
              <div className="glass-effect rounded-xl p-4 md:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">Advanced Filters</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Filter by category */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Categories</h4>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="categories">
                        <AccordionTrigger className="text-sm">Select Categories</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {["All", ...categories].map((cat) => (
                              <Badge
                                key={cat}
                                variant={category === cat.toLowerCase() ? "default" : "outline"}
                                className="cursor-pointer capitalize px-3 py-1"
                                onClick={() => setCategory(cat.toLowerCase())}
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  {/* Filter by price */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Price Range (STRK)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Select
                        value={priceRange[0].toString()}
                        onValueChange={(val) => setPriceRange([Number.parseFloat(val), priceRange[1]])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Min" />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 1, 2, 3, 4, 5].map((val) => (
                            <SelectItem key={val} value={val.toString()}>
                              {val}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={priceRange[1].toString()}
                        onValueChange={(val) => setPriceRange([priceRange[0], Number.parseFloat(val)])}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Max" />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 6, 7, 8, 9, 10, 15, 20].map((val) => (
                            <SelectItem key={val} value={val.toString()}>
                              {val}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Sorting options */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Sort By</h4>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Most Recent</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="likes">Most Liked</SelectItem>
                        <SelectItem value="name-asc">Name: A to Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z to A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active filters */}
                {(selectedFilters.length > 0 ||
                  category !== "all" ||
                  JSON.stringify(priceRange) !== JSON.stringify([0, 10])) && (
                  <div className="mt-6 pt-6 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Active Filters</h4>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear All
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {category !== "all" && (
                        <Badge variant="secondary" className="flex items-center gap-1 capitalize">
                          {category}
                          <button className="ml-1 hover:text-zinc-400" onClick={() => setCategory("all")}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}

                      {JSON.stringify(priceRange) !== JSON.stringify([0, 10]) && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          {priceRange[0]} - {priceRange[1]} STRK
                          <button className="ml-1 hover:text-zinc-400" onClick={() => setPriceRange([0, 10])}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}

                      {selectedFilters.map((filter) => (
                        <Badge key={filter} variant="secondary" className="flex items-center gap-1 capitalize">
                          {filter}
                          <button className="ml-1 hover:text-zinc-400" onClick={() => removeFilter(filter)}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content switcher */}
        <motion.div
          className="max-w-7xl mx-auto mb-6 md:mb-8 glass-effect p-4 rounded-xl flex flex-col md:flex-row gap-4 justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex-1">
            <Tabs defaultValue="assets" className="w-full">
              <TabsList className="mb-0 glass-effect bg-zinc-900/50">
                <TabsTrigger value="assets" className="data-[state=active]:gradient-text">
                  <Tag className="w-4 h-4 mr-2" />
                  Assets
                </TabsTrigger>
                <TabsTrigger value="collections" className="data-[state=active]:gradient-text">
                  <Layout className="w-4 h-4 mr-2" />
                  Collections
                </TabsTrigger>
                <TabsTrigger value="creators" className="data-[state=active]:gradient-text">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Creators
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-zinc-400">{sortedAssets.length} results</div>

            <div className="flex h-9 items-center rounded-md border border-zinc-700 bg-zinc-800/40">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 rounded-none rounded-l-md px-3"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 rounded-none rounded-r-md px-3"
                onClick={() => setViewMode("list")}
              >
                <Layout className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Clock className="h-4 w-4 mr-2" />
                  {sortBy === "recent" && "Recent"}
                  {sortBy === "price-high" && "Price: High to Low"}
                  {sortBy === "price-low" && "Price: Low to High"}
                  {sortBy === "likes" && "Most Liked"}
                  {sortBy === "name-asc" && "Name: A to Z"}
                  {sortBy === "name-desc" && "Name: Z to A"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setSortBy("recent")}>
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Most Recent</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-high")}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <span>Price: High to Low</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("price-low")}>
                    <TrendingUp className="h-4 w-4 mr-2 transform rotate-180" />
                    <span>Price: Low to High</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("likes")}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>Most Liked</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-asc")}>
                    <span className="mr-2">A→Z</span>
                    <span>Name: A to Z</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("name-desc")}>
                    <span className="mr-2">Z→A</span>
                    <span>Name: Z to A</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        {/* Main content area */}
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Tabs defaultValue="assets" className="w-full">
            <TabsContent value="assets">
              {/* Loading state */}
              {initialLoad ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {Array(8)
                    .fill()
                    .map((_, i) => (
                      <div key={i} className="glass-effect rounded-xl overflow-hidden h-[400px] animate-pulse">
                        <div className="bg-zinc-800/50 h-[220px] w-full"></div>
                        <div className="p-4">
                          <div className="bg-zinc-800/50 h-5 w-3/4 rounded-md mb-2"></div>
                          <div className="bg-zinc-800/50 h-4 w-1/2 rounded-md mb-4"></div>
                          <div className="bg-zinc-800/50 h-8 w-full rounded-md"></div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <>
                  {/* Grid view */}
                  {viewMode === "grid" && (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {sortedAssets.map((asset, index) => (
                        <motion.div key={asset.id} variants={itemVariants}>
                          <AssetCard asset={asset} index={index} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* List view */}
                  {viewMode === "list" && (
                    <motion.div
                      className="flex flex-col gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {sortedAssets.map((asset, index) => (
                        <motion.div
                          key={asset.id}
                          variants={itemVariants}
                          className="glass-effect rounded-xl overflow-hidden border border-white/10 cursor-pointer hover:border-primary/50 transition-all"
                          onClick={() => router.push(`/assets/${asset.id}`)}
                        >
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-48 h-48 overflow-hidden">
                              <img
                                src={asset.image || "/placeholder.svg?height=192&width=192"}
                                alt={asset.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="p-4 md:p-6 flex-1 flex flex-col">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-medium">{asset.name}</h3>
                                <Badge>{asset.category}</Badge>
                              </div>
                              <p className="text-zinc-400 text-sm mb-3">{asset.description}</p>
                              <div className="mt-auto flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={asset.creatorAvatar || "/placeholder.svg"} alt={asset.creator} />
                                    <AvatarFallback>{asset.creator.substring(0, 2)}</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-zinc-400">{asset.creator}</span>
                                </div>
                                <div className="font-medium">{asset.price}</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Empty state */}
                  {sortedAssets.length === 0 && (
                    <div className="text-center py-20">
                      <h3 className="text-xl font-medium mb-2">No assets found</h3>
                      <p className="text-zinc-400 mb-6">Try adjusting your search or filter criteria</p>
                      <Button onClick={clearFilters}>Clear Filters</Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="collections">
              {/* Collections Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredCollections.map((collection, index) => (
                  <motion.div key={collection.id} variants={itemVariants}>
                    <CollectionCard collection={collection} index={index} />
                  </motion.div>
                ))}
              </motion.div>

              {filteredCollections.length === 0 && (
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium mb-2">No collections found</h3>
                  <p className="text-zinc-400 mb-6">Try adjusting your search criteria</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="creators">
              {/* Creators Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredCreators.map((creator, index) => (
                  <motion.div key={creator.id} variants={itemVariants}>
                    <CreatorCard creator={creator} index={index} />
                  </motion.div>
                ))}
              </motion.div>

              {filteredCreators.length === 0 && (
                <div className="text-center py-20">
                  <h3 className="text-xl font-medium mb-2">No creators found</h3>
                  <p className="text-zinc-400 mb-6">Try adjusting your search criteria</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageTransition>
  )
}
