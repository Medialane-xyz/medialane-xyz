"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Users,
  Grid3X3,
  Clock,
  Filter,
  Search,
  SlidersHorizontal,
  Share2,
  ExternalLink,
  Info,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import AssetCard from "@/src/components/asset-card"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import { Card, CardContent } from "@/src/components/ui/card"
import { motion } from "framer-motion"

// Loading fallback
const LoadingFallback = () => (
  <div className="w-full h-40 flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
  </div>
)

// Empty state component
const EmptyState = ({ title, description, action }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
    <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
      <Info className="h-8 w-8 text-primary" />
    </div>
    <h3 className="text-xl font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
    {action && <Button onClick={action.onClick}>{action.label}</Button>}
  </motion.div>
)

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { collections, assets } = useMockData()
  const [collection, setCollection] = useState(null)
  const [collectionAssets, setCollectionAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState("grid")

  // Simulated loading of collection data
  useEffect(() => {
    const collectionId = params.id
    // Find the collection in mock data
    const foundCollection = collections.find((c) => c.id === collectionId)

    if (foundCollection) {
      setCollection(foundCollection)

      // Generate some assets for this collection
      const collectionAssets = assets.slice(0, foundCollection.items).map((asset) => ({
        ...asset,
        collectionId: collectionId,
      }))

      setCollectionAssets(collectionAssets)
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [params.id, collections, assets])

  const handleBack = () => {
    router.back()
  }

  // Filter and sort assets
  const filteredAssets = collectionAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.creator.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === "price-high") return Number.parseFloat(b.price) - Number.parseFloat(a.price)
    if (sortBy === "price-low") return Number.parseFloat(a.price) - Number.parseFloat(b.price)
    if (sortBy === "oldest") return Number.parseInt(a.id) - Number.parseInt(b.id)
    // Default: recent
    return Number.parseInt(b.id) - Number.parseInt(a.id)
  })

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `MediaLane: ${collection?.name}`,
        text: `Check out ${collection?.name} on MediaLane - Zero-fee IP licensing`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8 flex items-center justify-center">
        <LoadingFallback />
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
          <p className="mb-6">The collection you're looking for doesn't exist or has been removed.</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      label: "Items",
      value: collection?.items || collection?.totalItems || 0,
    },
    {
      label: "Owners",
      value: collection?.owners || Math.floor((collection?.items || collection?.totalItems || 0) * 0.7),
    },
    {
      label: "Floor Price",
      value: collection?.floorPrice || "0.5 STRK",
    },
    {
      label: "Volume",
      value: collection?.volume || collection?.totalVolume || "0 STRK",
    },
  ]

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">
      {/* Back button */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share collection</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
      </div>

      {/* Collection Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-8"
      >
        <img
          src={collection.banner || "/placeholder.svg?height=400&width=1200"}
          alt={collection.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Avatar className="h-16 w-16 border-2 border-background">
                <AvatarImage src={collection.image || "/placeholder.svg?height=100&width=100"} alt={collection.name} />
                <AvatarFallback>{collection.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <div className="flex items-center">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">{collection.name}</h1>
                  {collection.verified && <CheckCircle2 className="h-5 w-5 ml-2 text-primary" />}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-sm text-zinc-300">by {collection.creator}</span>
                  <Badge className="ml-3 bg-primary/20 text-primary border-none">{collection.items} items</Badge>
                  <Badge className="ml-2 bg-green-500/20 text-green-500 border-none">Zero Fees</Badge>
                </div>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
             
            </div>
          </div>
        </div>
      </motion.div>

      {/* Collection Description */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-3xl mb-8"
      >
        <p className="text-muted-foreground">{collection.description}</p>
      </motion.div>

      {/* Collection Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {statsData.map((stat) => (
          <Card
            key={stat.label}
            className="overflow-hidden border-primary/10 hover:border-primary/30 transition-colors"
          >
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-2xl font-bold">
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs and Content */}
      <Tabs defaultValue="assets" className="w-full">
        <TabsList className="w-full md:w-auto mb-6">
          <TabsTrigger value="assets" className="flex items-center">
            <Grid3X3 className="h-4 w-4 mr-2" />
            Items
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="owners" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Owners
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-0">
          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-auto flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search by name or creator..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                    </SelectContent>
                  </Select>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>All Items</DropdownMenuItem>
                      <DropdownMenuItem>Available for License</DropdownMenuItem>
                      <DropdownMenuItem>Recently Added</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assets Grid */}
          {sortedAssets.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {sortedAssets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AssetCard asset={asset} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              title="No items found"
              description="Try adjusting your search criteria or check back later for new additions to this collection."
              action={{
                label: "Reset Search",
                onClick: () => setSearchQuery(""),
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card className="border border-primary/10">
            <CardContent className="p-8">
              <EmptyState
                title="Activity Coming Soon"
                description="We're working on adding detailed activity tracking for this collection. Check back soon to see licensing history, transfers, and more."
                action={null}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="mt-0">
          <Card className="border border-primary/10">
            <CardContent className="p-8">
              <EmptyState
                title="Owners List Coming Soon"
                description="We're working on adding a detailed owners list for this collection. Soon you'll be able to see who owns which assets and their licensing status."
                action={null}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
