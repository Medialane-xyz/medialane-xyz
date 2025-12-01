"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Grid3X3,
  Clock,
  Filter,
  Search,
  SlidersHorizontal,
  Share2,
  ExternalLink,
  Info,
  Globe,
  Twitter,
  Instagram,
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

export default function CreatorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { creators, assets } = useMockData()
  const [creator, setCreator] = useState(null)
  const [creatorAssets, setCreatorAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState("grid")

  // Simulated loading of creator data
  useEffect(() => {
    const creatorId = params.id
    // Find the creator in mock data
    const foundCreator = creators.find((c) => c.id === creatorId)

    if (foundCreator) {
      setCreator(foundCreator)

      // Generate some assets for this creator
      const creatorAssets = assets.slice(0, foundCreator.totalAssets || 12).map((asset) => ({
        ...asset,
        creatorId: creatorId,
      }))

      setCreatorAssets(creatorAssets)
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [params.id, creators, assets])

  const handleBack = () => {
    router.back()
  }

  // Filter and sort assets
  const filteredAssets = creatorAssets.filter(
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
        title: `MediaLane: ${creator?.name}`,
        text: `Check out ${creator?.name} on MediaLane - Zero-fee IP licensing`,
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

  if (!creator) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <div className="w-full max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Creator Not Found</h1>
          <p className="mb-6">The creator you're looking for doesn't exist or has been removed.</p>
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
      label: "Assets",
      value: creator?.totalAssets || 0,
    },
    {
      label: "Followers",
      value: creator?.followers || 0,
    },
    {
      label: "Volume",
      value: creator?.volumeTraded || "0 STRK",
    },
    {
      label: "Sales",
      value: creator?.totalSales || 0,
    },
  ]

  return (
    <div className="min-h-screen pt-0 md:pt-0 pb-24 md:pb-32">
      {/* Back button - positioned over banner */}
      <div className="fixed top-20 left-4 z-40 md:absolute md:top-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-2 bg-black/30 hover:bg-black/50 text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full h-96 md:h-[500px] overflow-hidden"
      >
        <img
          src={creator.banner || "/placeholder.svg?height=500&width=1200&query=creator-banner"}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 w-full px-4 md:px-8 py-6 md:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
              {/* Creator Info */}
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background flex-shrink-0">
                  <AvatarImage src={creator.avatar || "/placeholder.svg?height=100&width=100"} alt={creator.name} />
                  <AvatarFallback>{creator.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-white min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-4xl font-bold">{creator.name}</h1>
                    {creator.verified && <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7 text-primary flex-shrink-0" />}
                  </div>
                  {creator.location && <p className="text-sm md:text-base text-zinc-300 mt-1">{creator.location}</p>}
                  <p className="text-xs md:text-sm text-zinc-400 mt-2 line-clamp-2">{creator.bio}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShare}
                        className="bg-white/10 border-white/20 hover:bg-white/20"
                      >
                        <Share2 className="h-4 w-4 text-white" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share creator</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button className="bg-primary hover:bg-primary/90">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Follow
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="px-4 md:px-8 pt-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Creator Description */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mb-8">
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{creator.bio}</p>

            {/* Social Links & Info */}
            {creator.specialties && creator.specialties.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {creator.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-4">
              {creator.website && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href={creator.website} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Globe className="h-4 w-4" />
                        </Button>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visit website</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {creator.twitter && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://twitter.com/${creator.twitter.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Twitter className="h-4 w-4" />
                        </Button>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Twitter</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {creator.instagram && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://instagram.com/${creator.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Instagram className="h-4 w-4" />
                        </Button>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Instagram</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </motion.div>

          {/* Creator Stats */}
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
                  <div className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-xl md:text-2xl font-bold">
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
                Assets
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Activity
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
                        placeholder="Search assets..."
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
                          <DropdownMenuItem>All Assets</DropdownMenuItem>
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
                  title="No assets found"
                  description="Try adjusting your search criteria or check back later for new additions from this creator."
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
                    description="We're working on adding detailed activity tracking for this creator. Check back soon to see licensing history, transfers, and more."
                    action={null}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
