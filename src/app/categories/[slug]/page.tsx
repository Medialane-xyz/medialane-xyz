"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Search, ArrowUpDown, Grid3X3, List, TrendingUp, ArrowLeft } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import AssetCard from "@/src/components/asset-card"
import { CollectionCard } from "@/src/components/collection-card"
import { useMobile } from "@/src/hooks/use-mobile"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const isMobile = useMobile()
  const { assets, collections } = useMockData()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [subcategoryFilter, setSubcategoryFilter] = useState("all")

  // Mock category data - in real app this would come from API
  const categoryData = {
    "art": {
      name: "Art",
      description: "Original digital artworks, illustrations, and visual creations",
      image: "/art-category.jpg",
      banner: "/art-category.jpg",
      assetCount: 12,
      volume: "2,450 STRK",
      floorPrice: "0.5 STRK",
      owners: 90,
      subcategories: ["Abstract", "Portraits", "Landscapes", "Generative", "3D Art"],
      trending: true,
      growth: "+15.2%",
    },
    audio: {
      name: "Audio",
      description: "Original music compositions, beats, and audio content",
      image: "/diverse-music-genres.jpg",
      banner: "/diverse-music-genres.jpg",
      assetCount: 80,
      volume: "1,890 STRK",
      floorPrice: "0.3 STRK",
      owners: 60,
      subcategories: ["Electronic", "Hip Hop", "Classical", "Ambient", "Sound Effects"],
      trending: true,
      growth: "+22.8%",
    },
    games: {
      name: "games",
      description: "Games and gaming digital assets",
      image: "/games-category.jpg",
      banner: "/games-category.jpg",
      assetCount: 15,
      volume: "890 STRK",
      floorPrice: "5.0 STRK",
      owners: 12,
      subcategories: ["Action", "Sports", "Fight", "Adventure", "RPG"],
      trending: false,
      growth: "+8.1%",
    },
    literature: {
      name: "Literature",
      description: "Books, stories, character rights, and literary works",
      image: "/literature-category.jpg",
      banner: "/literature-category.jpg",
      assetCount: 24,
      volume: "567 STRK",
      floorPrice: "1.2 STRK",
      owners: 18,
      subcategories: ["Fiction", "Non-Fiction", "Poetry", "Scripts", "Character Rights"],
      trending: false,
      growth: "+5.4%",
    },
    photography: {
      name: "Photography",
      description: "Photography assets, logos, and visual identity systems",
      image: "/photography-category.jpg",
      banner: "/photography-category.jpg",
      assetCount: 45,
      volume: "1,234 STRK",
      floorPrice: "0.8 STRK",
      owners: 32,
      subcategories: ["Logos", "Brand Guidelines", "Typography", "Color Palettes", "Icons"],
      trending: true,
      growth: "+18.7%",
    },
    publications: {
      name: "Publications",
      description: "Magazines, journals, newspapers, and periodicals",
      image: "/publications-category.jpg",
      banner: "/publications-category.jpg",
      assetCount: 67,
      volume: "345 STRK",
      floorPrice: "1.0 STRK",
      owners: 9,
      subcategories: ["Magazines", "Journals", "Newspapers", "E-books", "Zines"],
      trending: true,
      growth: "+9.6%",
    },
    video: {
      name: "Video",
      description: "Film rights, video content, and entertainment IP",
      image: "/video-category.jpg",
      banner: "/video-category.jpg",
      assetCount: 17,
      volume: "2,100 STRK",
      floorPrice: "2.5 STRK",
      owners: 14,
      subcategories: ["Film Rights", "Video Content", "Animation", "Documentaries", "Short Films"],
      trending: false,
      growth: "+12.3%",
    },
    nft: {
      name: "NFTs",
      description: "Non-fungible tokens and digital collectibles",
      image: "/nft-category.jpg",
      banner: "/nft-category.jpg",
      assetCount: 56,
      volume: "3,450 STRK",
      floorPrice: "0.9 STRK",
      owners: 41,
      subcategories: ["Collectibles", "Art NFTs", "Music NFTs", "Virtual Real Estate", "Gaming NFTs"],
      trending: true,
      growth: "+25.4%",
    },
  }

  const category = categoryData[params.slug as keyof typeof categoryData]

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Media Not Found</h1>
          <p className="text-muted-foreground mb-4">The category you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/categories")}>Browse Categories</Button>
        </div>
      </div>
    )
  }

  // Filter assets by category
  const categoryAssets = assets.filter(
    (asset) => asset.categorySlug === params.slug || asset.category.toLowerCase().replace(/\s+/g, "-") === params.slug,
  )

  const categoryCollections = collections.filter(
    (collection) =>
      collection.categorySlug === params.slug ||
      collection.category?.toLowerCase().replace(/\s+/g, "-") === params.slug,
  )

  // Apply filters
  const filteredAssets = categoryAssets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubcategory = subcategoryFilter === "all" || asset.subcategory === subcategoryFilter
    return matchesSearch && matchesSubcategory
  })

  // Sort assets
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "price-high":
        return Number.parseFloat(b.price.replace(" STRK", "")) - Number.parseFloat(a.price.replace(" STRK", ""))
      case "price-low":
        return Number.parseFloat(a.price.replace(" STRK", "")) - Number.parseFloat(b.price.replace(" STRK", ""))
      case "popular":
        return b.likes - a.likes
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Category Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-96 bg-gradient-to-r from-primary/20 to-purple-500/20 relative overflow-hidden">
          <img src={category.banner || "/placeholder.svg"} alt={category.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />

          {/* Back Button 
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-20 right-8 text-white hover:bg-white/20"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>*/}

          {/* Category Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h1>
                {category.trending && (
                  <Badge className="bg-primary text-primary-foreground">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending
                  </Badge>
                )}
              </div>
              <p className="text-white/90 text-lg max-w-2xl">{category.description}</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-background border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{category.assetCount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Assets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{category.owners.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Owners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{category.volume}</div>
                <div className="text-sm text-muted-foreground">Volume</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{category.floorPrice}</div>
                <div className="text-sm text-muted-foreground">Floor Price</div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Subcategories */}
        <div className="mb-8">
          
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={subcategoryFilter === "all" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSubcategoryFilter("all")}
            >
              All
            </Badge>
            {category.subcategories.map((sub) => (
              <Badge
                key={sub}
                variant={subcategoryFilter === sub ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSubcategoryFilter(sub)}
              >
                {sub}
              </Badge>
            ))}
          </div>
        </div>

        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="assets">Assets ({sortedAssets.length})</TabsTrigger>
            <TabsTrigger value="collections">Collections ({categoryCollections.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="assets">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Assets Grid */}
            {sortedAssets.length > 0 ? (
              <div
                className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}
              >
                {sortedAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-2">No assets found</div>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections">
            {categoryCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-2">No collections found</div>
                <p className="text-sm text-muted-foreground">No collections in this category yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
