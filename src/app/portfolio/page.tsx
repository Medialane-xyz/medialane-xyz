"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  TrendingUp,
  Eye,
  Heart,
  Share2,
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  BarChart3,
  DollarSign,
  ImageIcon,
  Music,
  FileText,
  Palette,
  Film,
  Lightbulb,
  X,
  ChevronDown,
  Zap,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/src/components/ui/drawer"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import { useAuth } from "@clerk/nextjs"
import { useGetWallet } from "@chipi-stack/nextjs"
import { useUserCollections } from "@/src/lib/hooks/use-all-collections"
import { useUserAssets } from "@/src/lib/hooks/use-collection-tokens"
import { useMobile } from "@/src/hooks/use-mobile"

export default function PortfolioPage() {
  const { userId, getToken } = useAuth()
  const { data: walletData } = useGetWallet({
    getBearerToken: () => getToken({ template: "chipipay" }).then((t) => t || ""),
    params: { externalUserId: userId || "" },
    queryOptions: { enabled: !!userId },
  })
  // Cast to any to avoid strict type checks on wallet property
  const address = (walletData as any)?.wallet?.publicKey
  const isMobile = useMobile()

  const CATEGORIES = [
    { id: "all", name: "All Categories", icon: <Grid3X3 className="h-4 w-4" />, count: 0 },
    { id: "digital-art", name: "Digital Art", icon: <ImageIcon className="h-4 w-4" />, count: 0 },
    { id: "music", name: "Music", icon: <Music className="h-4 w-4" />, count: 0 },
    { id: "literature", name: "Literature", icon: <FileText className="h-4 w-4" />, count: 0 },
    { id: "branding", name: "Branding", icon: <Palette className="h-4 w-4" />, count: 0 },
    { id: "film-video", name: "Film & Video", icon: <Film className="h-4 w-4" />, count: 0 },
    { id: "patents", name: "Patents", icon: <Lightbulb className="h-4 w-4" />, count: 0 },
  ]

  const SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "most-liked", label: "Most Liked" },
    { value: "most-viewed", label: "Most Viewed" },
  ]
  const { collections: userCollections, isLoading: isLoadingCollections } = useUserCollections(address)
  const { assets: rawAssets, isLoading: isLoadingAssets } = useUserAssets(address)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  // Map raw assets to UI model
  const userAssets = useMemo(() => {
    return rawAssets.map(token => ({
      id: token.identifier,
      name: token.name || `Token #${token.token_id}`,
      image: token.image || "/placeholder.svg",
      category: "Digital Art", // TODO: fetch from metadata
      price: "Not Listed",
      views: 0,
      likes: 0,
      createdAt: new Date().toISOString(), // Mock date as blockchain doesn't give timestamp easily without events
      status: "Owned"
    }))
  }, [rawAssets])

  // Context: userCollections is OnChainCollection[]
  // UI expects: id, name, image, itemCount, floorPrice, volume
  // OnChainCollection has: id, name, image, items, volume

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = userAssets

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((asset) => asset.category === selectedCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
        case "oldest":
          return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
        case "price-high":
          return 0 // No price data yet
        case "price-low":
          return 0
        case "most-liked":
          return (b.likes || 0) - (a.likes || 0)
        case "most-viewed":
          return (b.views || 0) - (a.views || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [userAssets, searchQuery, selectedCategory, sortBy])

  // Update category counts
  const categoriesWithCounts = useMemo(() => {
    return CATEGORIES.map((category) => ({
      ...category,
      count:
        category.id === "all" ? userAssets.length : userAssets.filter((asset) => asset.category === category.id).length,
    }))
  }, [userAssets])

  // Portfolio statistics
  const portfolioStats = useMemo(() => {
    const totalValue = userAssets.reduce((sum, asset) => sum + Number.parseFloat(asset.price.replace(/[^\d.]/g, "")), 0)
    const totalViews = userAssets.reduce((sum, asset) => sum + (asset.views || 0), 0)
    const totalLikes = userAssets.reduce((sum, asset) => sum + (asset.likes || 0), 0)

    return {
      totalAssets: userAssets.length,
      totalCollections: userCollections.length,
      totalValue: totalValue.toFixed(2),
      totalViews,
      totalLikes,
      avgPrice: userAssets.length > 0 ? (totalValue / userAssets.length).toFixed(2) : "0",
    }
  }, [userAssets, userCollections])

  const FilterDrawer = ({ children }: { children: React.ReactNode }) => {
    if (isMobile) {
      return (
        <Drawer open={showFilters} onOpenChange={setShowFilters}>
          <DrawerTrigger asChild>{children}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Filters</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">Categories</Label>
                <div className="space-y-2">
                  {categoriesWithCounts.map((category) => (
                    <div key={category.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`mobile-${category.id}`}
                        checked={selectedCategory === category.id}
                        onCheckedChange={() => setSelectedCategory(category.id)}
                      />
                      <Label htmlFor={`mobile-${category.id}`} className="flex items-center gap-2 cursor-pointer">
                        {category.icon}
                        <span>{category.name}</span>
                        <Badge variant="outline" className="ml-auto">
                          {category.count}
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-base font-medium mb-3 block">Sort By</Label>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={`sort-${option.value}`}
                        checked={sortBy === option.value}
                        onCheckedChange={() => setSortBy(option.value)}
                      />
                      <Label htmlFor={`sort-${option.value}`} className="cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )
    }

    return <>{children}</>
  }

  return (
    <div className="min-h-screen pt-20 pb-24 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Portfolio
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => (window.location.href = "/create")} className="gap-2">
                <Plus className="h-4 w-4" />
                {isMobile ? "Create" : "Create Asset"}
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/create/collection")} className="gap-2">
                <Plus className="h-4 w-4" />
                {isMobile ? "Collection" : "New Collection"}
              </Button>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {!isMobile && "Overview"}
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              {!isMobile && "My Assets"}
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              {!isMobile && "Collections"}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              {!isMobile && "Analytics"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{portfolioStats.totalAssets}</p>
                      <p className="text-sm text-muted-foreground">Assets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Grid3X3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{portfolioStats.totalCollections}</p>
                      <p className="text-sm text-muted-foreground">Collections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">${portfolioStats.totalValue}</p>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Eye className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{portfolioStats.totalViews.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Views</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Heart className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{portfolioStats.totalLikes.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Likes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">${portfolioStats.avgPrice}</p>
                      <p className="text-sm text-muted-foreground">Avg Price</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => (window.location.href = "/create")}
                  >
                    <Plus className="h-6 w-6" />
                    <span>Create Asset</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => (window.location.href = "/create/collection")}
                  >
                    <Grid3X3 className="h-6 w-6" />
                    <span>New Collection</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => (window.location.href = "/explore")}
                  >
                    <Search className="h-6 w-6" />
                    <span>Explore</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 bg-transparent"
                    onClick={() => (window.location.href = "/portfolio/analytics")}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span>Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Collections */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="h-5 w-5" />
                    My Collections
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/create/collection")}>
                    <Plus className="h-4 w-4 mr-2" />
                    New
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userCollections.slice(0, 3).map((collection) => (
                    <Card key={collection.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={collection.image || "/placeholder.svg"}
                              alt={collection.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{collection.name}</h3>
                            <p className="text-sm text-muted-foreground">{collection.items} items</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Floor: 0 ETH</span>
                          <span>Volume: {collection.volume}</span>
                        </div>
                        <Badge variant="outline">{collection.symbol || "NFT"}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Assets Tab */}
          <TabsContent value="assets" className="space-y-6">
            {/* Search and Filters */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search your assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FilterDrawer>
                      <Button variant="outline" className="gap-2 h-12 bg-transparent">
                        <Filter className="h-4 w-4" />
                        Filters
                        {selectedFilters.length > 0 && (
                          <Badge variant="secondary" className="ml-1">
                            {selectedFilters.length}
                          </Badge>
                        )}
                      </Button>
                    </FilterDrawer>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 h-12 bg-transparent">
                          <span className="hidden sm:inline">Sort:</span>
                          {SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {SORT_OPTIONS.map((option) => (
                          <DropdownMenuItem key={option.value} onClick={() => setSortBy(option.value)}>
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex border rounded-lg">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedCategory !== "all" || selectedFilters.length > 0) && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
                    {selectedCategory !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        {categoriesWithCounts.find((c) => c.id === selectedCategory)?.name}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                      </Badge>
                    )}
                    {selectedFilters.map((filter) => (
                      <Badge key={filter} variant="secondary" className="gap-1">
                        {filter}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setSelectedFilters((prev) => prev.filter((f) => f !== filter))}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {categoriesWithCounts.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="gap-2"
                >
                  {category.icon}
                  <span>{category.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Assets Grid/List */}
            {filteredAssets.length === 0 ? (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No assets found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || selectedCategory !== "all"
                      ? "Try adjusting your search or filters"
                      : "Start building your portfolio by creating your first asset"}
                  </p>
                  <div className="flex justify-center gap-3">
                    {searchQuery || selectedCategory !== "all" ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("")
                          setSelectedCategory("all")
                          setSelectedFilters([])
                        }}
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      <Button onClick={() => (window.location.href = "/create")} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Asset
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "space-y-4"
                }
              >
                {filteredAssets.map((asset, index) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {viewMode === "grid" ? (
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden rounded-t-lg">
                            <img
                              src={asset.image || "/placeholder.svg"}
                              alt={asset.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Share2 className="h-4 w-4 mr-2" />
                                    Share
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-black/50 text-white border-0">{asset.category}</Badge>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2 truncate">{asset.name}</h3>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl font-bold text-primary">{asset.price}</span>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{asset.views || 0}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{asset.likes || 0}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {asset.status || "Available"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : "Recently"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 hover:shadow-xl transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={asset.image || "/placeholder.svg"}
                                alt={asset.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-1 truncate">{asset.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {asset.category}
                                </Badge>
                                <span>
                                  {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString() : "Recently"}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{asset.views || 0} views</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{asset.likes || 0} likes</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary mb-2">{asset.price}</div>
                              <Badge variant="outline" className="text-xs">
                                {asset.status || "Available"}
                              </Badge>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Share2 className="h-4 w-4 mr-2" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Collections</h2>
                <p className="text-muted-foreground">Organize your assets into collections</p>
              </div>
              <Button onClick={() => (window.location.href = "/create/collection")} className="gap-2">
                <Plus className="h-4 w-4" />
                New Collection
              </Button>
            </div>

            {userCollections.length === 0 ? (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Grid3X3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create collections to organize your assets and make them easier to discover
                  </p>
                  <Button onClick={() => (window.location.href = "/create/collection")} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Your First Collection
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userCollections.map((collection, index) => (
                  <motion.div
                    key={collection.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-0">
                        <div className="relative aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={collection.image || "/placeholder.svg"}
                            alt={collection.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Settings className="h-4 w-4 mr-2" />
                                  Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg mb-2 truncate">{collection.name}</h3>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {collection.description || "No description available"}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-muted-foreground">{collection.items} items</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Floor: 0 ETH</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {collection.symbol || "Mixed"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Volume: {collection.volume}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Portfolio Analytics</h2>
                <p className="text-muted-foreground">Track your performance and insights</p>
              </div>
              <Button variant="outline" onClick={() => (window.location.href = "/portfolio/analytics")}>
                View Full Analytics
              </Button>
            </div>

            {/* Analytics Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Portfolio Value</span>
                      <span className="font-bold text-2xl">${portfolioStats.totalValue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Average Asset Price</span>
                      <span className="font-semibold">${portfolioStats.avgPrice}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Engagement</span>
                      <span className="font-semibold">
                        {(portfolioStats.totalViews + portfolioStats.totalLikes).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                    <p className="text-muted-foreground mb-4">
                      Detailed charts, performance metrics, and insights are coming soon
                    </p>
                    <Button variant="outline">Get Notified</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed charts, performance metrics, and insights are coming soon
                  </p>
                  <Button variant="outline">Get Notified</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
