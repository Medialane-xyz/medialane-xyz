"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Share2,
  ExternalLink,
  Info,
  Sparkles,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import AssetCard from "@/src/components/asset-card"
import { useCollectionByAddress } from "@/src/lib/hooks/use-all-collections"
import { useCollectionTokens } from "@/src/lib/hooks/use-collection-tokens"
import { motion } from "framer-motion"

// Loading fallback with skeleton
const LoadingFallback = () => (
  <div className="min-h-screen bg-background">
    {/* Skeleton Header */}
    <div className="relative w-full h-[40vh] bg-muted/30 animate-pulse" />
    <div className="px-4 md:px-8 -mt-20 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Skeleton Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted/50 animate-pulse" />
          ))}
        </div>
        {/* Skeleton Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
)

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  } | null
}

// Empty state component
const EmptyState = ({ title, description, icon, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-20 bg-gradient-to-b from-muted/20 to-transparent rounded-2xl border border-border/30"
  >
    <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 ring-1 ring-primary/20">
      {icon || <Info className="h-10 w-10 text-primary" />}
    </div>
    <h3 className="text-2xl font-semibold mb-3">{title}</h3>
    <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
    {action && (
      <Button onClick={action.onClick} variant="outline" className="rounded-full px-8">
        {action.label}
      </Button>
    )}
  </motion.div>
)

// Glass Stat Card Component
const GlassStatCard = ({ label, value, icon }: { label: string, value: string | number, icon?: React.ReactNode }) => (
  <div className="relative overflow-hidden rounded-2xl border border-border/30 bg-background/60 backdrop-blur-xl p-5 transition-all hover:border-primary/30 group">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="relative z-10 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
      </div>
      {icon && <div className="text-muted-foreground/50">{icon}</div>}
    </div>
  </div>
)

export default function CollectionDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Parse collection address from params
  const collectionAddress = typeof params.address === "string" ? params.address : undefined

  // Fetch collection data by address
  const { collection, isLoading: isCollectionLoading } = useCollectionByAddress(collectionAddress)

  // Fetch collection tokens using the NUMERIC collection ID (not the address)
  // The hook expects a string representation of the numeric ID
  const { tokens, isLoading: isTokensLoading, error: tokensError } = useCollectionTokens(collection?.id)

  // Debug logging
  console.log("[CollectionPage] collection:", collection?.name, "id:", collection?.id, "tokens:", tokens.length, "tokensLoading:", isTokensLoading, "tokensError:", tokensError)

  const loading = isCollectionLoading

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [activeTab, setActiveTab] = useState("items")

  const handleBack = () => {
    router.back()
  }

  // Map tokens to assets format for display, including on-chain data for linking
  const collectionAssets = tokens.map(token => ({
    id: token.identifier,
    // On-chain identifiers for standard asset links
    collectionAddress: collection?.ipNft || collectionAddress, // The collection contract address (hex)
    tokenId: token.token_id.toString(),
    // Metadata
    name: token.name || `Token #${token.token_id}`,
    image: token.image || "/placeholder.svg",
    description: token.description || "",
    // Creator info
    creator: token.owner === collection?.owner ? collection?.creator : (token.owner.slice(0, 6) + "..." + token.owner.slice(-4)),
    creatorId: token.owner,
    // Marketplace
    price: "Not Listed",
    // Type/Category from attributes or default
    category: token.attributes?.find((a: any) => a.trait_type === "type")?.value ||
      token.attributes?.find((a: any) => a.trait_type === "category")?.value ||
      "Art",
    isRemix: false,
    attributes: token.attributes
  }))

  // Filter and sort assets
  const filteredAssets = collectionAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.creator.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sortBy === "price-high") return 0
    if (sortBy === "price-low") return 0
    if (sortBy === "oldest") {
      const idA = BigInt(a.id.split(":")[1] || 0)
      const idB = BigInt(b.id.split(":")[1] || 0)
      return Number(idA - idB)
    }
    const idA = BigInt(a.id.split(":")[1] || 0)
    const idB = BigInt(b.id.split(":")[1] || 0)
    return Number(idB - idA)
  })

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `MediaLane: ${collection?.name}`,
        text: `Check out ${collection?.name} on MediaLane`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (loading) {
    return <LoadingFallback />
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen pt-24 flex items-center justify-center">
        <EmptyState
          title="Collection Not Found"
          description="The collection you're looking for doesn't exist or has been removed."
          action={{ label: "Go Back", onClick: handleBack }}
        />
      </div>
    )
  }

  const uniqueOwners = tokens.length > 0 ? new Set(tokens.map(t => t.owner)).size : 0
  const backgroundImage = collection.image || collection.banner

  return (
    <div className="min-h-screen bg-background relative">

      {/* Fixed Background Image with Blur Effect */}
      {/* Fixed Background Image with Blur Effect - YouTube Ambient Mode Style */}
      {backgroundImage && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          {/* Ambient Glow */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={backgroundImage}
              alt=""
              className="w-full h-full object-cover scale-150 blur-[100px] opacity-50 saturate-200"
            />
          </div>
          {/* subtle gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
        </div>
      )}

      {/* Main Content - positioned above background */}
      <div className="relative z-10 pb-24 md:pb-32">

        {/* Hero Section */}
        <div className="relative pt-20 md:pt-24 pb-8 md:pb-12">
          <div className="px-4 md:px-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col lg:flex-row gap-8 items-start"
            >
              {/* Collection Image */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-background shadow-2xl ring-1 ring-white/10">
                  <img
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {collection.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1.5 border-2 border-background">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>

              {/* Collection Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
                    {collection.name}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Created by</span>
                      <span className="font-medium text-foreground">{collection.creator}</span>
                    </div>
                    <span className="text-muted-foreground/50">•</span>
                    <div className="text-sm text-muted-foreground">
                      {collection.items} items
                    </div>
                  </div>
                </div>

                {collection.description && (
                  <p className="text-muted-foreground leading-relaxed max-w-2xl line-clamp-3">
                    {collection.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleShare}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Share2 className="h-4 w-4" />
                          Share
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Share this collection</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => window.open(`https://starkscan.co/contract/${collectionAddress}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                          View on Explorer
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Open in Starkscan</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
            >
              <GlassStatCard label="Items" value={collection.items?.toLocaleString() || 0} icon={<ImageIcon className="h-5 w-5" />} />
              <GlassStatCard label="Owners" value={uniqueOwners.toLocaleString()} icon={<Sparkles className="h-5 w-5" />} />
              <GlassStatCard label="Floor Price" value="--" />
              <GlassStatCard label="Total Volume" value={collection.volume || "0 ETH"} />
            </motion.div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="items" className="space-y-8" onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border/30 pb-6">
                <TabsList className="bg-transparent p-0 h-auto gap-6">
                  <TabsTrigger
                    value="items"
                    className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground text-lg font-medium py-0 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
                  >
                    Items
                    <span className="ml-2 text-xs bg-muted/50 text-muted-foreground px-2 py-0.5 rounded-full">{collection.items}</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary text-muted-foreground text-lg font-medium py-0 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all"
                  >
                    Activity
                  </TabsTrigger>
                </TabsList>

                {/* Filter Controls */}
                {activeTab === 'items' && (
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search items..."
                        className="pl-9 w-full sm:w-[250px] bg-background/50 border-border/50 focus:bg-background transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50">
                        <div className="flex items-center gap-2">
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          <SelectValue placeholder="Sort by" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recently Added</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <TabsContent value="items" className="mt-0">
                {isTokensLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="aspect-[3/4] rounded-xl bg-muted/30 animate-pulse" />
                    ))}
                  </div>
                ) : sortedAssets.length > 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    {sortedAssets.map((asset, index) => (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <AssetCard asset={asset} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState
                    title="No items yet"
                    description={tokensError ? "Failed to load items. Please try again." : "This collection doesn't have any items yet."}
                    icon={<ImageIcon className="h-10 w-10 text-primary" />}
                    action={searchQuery ? { label: "Clear Search", onClick: () => setSearchQuery("") } : null}
                  />
                )}
              </TabsContent>

              <TabsContent value="activity">
                <EmptyState
                  title="No Activity"
                  description="There is no recent activity for this collection."
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
