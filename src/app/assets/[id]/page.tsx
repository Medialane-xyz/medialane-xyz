"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  Clock,
  Zap,
  ShoppingCart,
  Gavel,
  Info,
  CheckCircle2,
  Copy,
  Download,
  Flag,
  MoreHorizontal,
  Timer,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Progress } from "@/src/components/ui/progress"
import { Separator } from "@/src/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { toast } from "@/src/hooks/use-toast"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import { RemixIndicator } from "@/src/components/remix-indicator"
import { RemixGenealogyTree } from "@/src/components/remix-genealogy-tree"
import { PurchaseModal } from "@/src/components/trading/purchase-modal"
import { IPTypeTemplate } from "@/src/components/ip-type-template"
import Link from "next/link"

export default function AssetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { assets, creators, activities } = useMockData()
  const [asset, setAsset] = useState(null)
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45,
  })

  useEffect(() => {
    if (!assets || !creators) return

    const assetId = params.id as string
    const foundAsset = assets.find((a) => a.id === assetId)

    if (foundAsset) {
      setAsset(foundAsset)
      const foundCreator = creators.find((c) => c.id === foundAsset.creatorId)
      setCreator(foundCreator)
    }

    setLoading(false)
  }, [params.id, assets, creators])

  // Auction timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="container mx-auto px-3 md:px-4 py-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6 md:p-8">
            <Info className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg md:text-xl font-semibold mb-2">Asset Not Found</h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              The asset you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${asset.name} - MediaLane`,
          text: `Check out this amazing IP asset: ${asset.name}`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "Asset link has been copied to your clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  const handlePurchase = () => {
    router.push(`/checkout/${asset.id}`)
  }

  const handleQuickPurchase = () => {
    setShowPurchaseModal(true)
  }

  const handleMakeOffer = () => {
    router.push(`/make-offer/${asset.id}`)
  }

  const handlePurchaseComplete = (transactionHash: string) => {
    toast({
      title: "Purchase Successful!",
      description: `Transaction: ${transactionHash}`,
    })
  }

  const assetActivities =
    activities?.filter((activity) => activity.asset?.id === asset.id || activity.originalAsset?.id === asset.id) || []

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-20 md:pb-24">
      <div className="container mx-auto px-3 md:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-white/10 -mx-3 md:-mx-6 lg:-mx-8 px-3 md:px-6 lg:px-8 py-3 mb-4 md:mb-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Asset Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={asset.image || "/placeholder.svg?height=600&width=600"}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 md:top-4 right-3 md:right-4 flex gap-2">
                  {asset.verified && (
                    <Badge className="bg-green-500/90 text-white text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {asset.rarity && (
                    <Badge variant="secondary" className="text-xs">
                      {asset.rarity}
                    </Badge>
                  )}
                  {asset.isRemix && <Badge className="bg-purple-500/90 text-white text-xs">Remix</Badge>}
                </div>
                <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 flex gap-2">
                  <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
                    Zero Fees
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Asset Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 md:space-y-6"
          >
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-3">{asset.name}</h1>
              <Badge variant="outline" className="mb-3 md:mb-4 text-xs">
                {asset.category}
              </Badge>

              {/* Creator Info */}
              <div className="flex items-center gap-3 mb-4 md:mb-6">
                <Avatar className="h-10 w-10 md:h-12 md:w-12">
                  <AvatarImage src={creator?.avatar || "/placeholder.svg"} alt={creator?.name} />
                  <AvatarFallback>{creator?.name?.substring(0, 2) || "CR"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/users/${creator?.id}`} className="font-medium hover:underline text-sm md:text-base">
                      {creator?.name || asset.creator}
                    </Link>
                    {creator?.verified && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">{creator?.totalAssets || 0} assets</p>
                </div>
              </div>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6">
                {asset.description}
              </p>
            </div>

            {/* Stats - Simplified */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="font-semibold text-sm md:text-base">{asset.remixCount || 0}</div>
                <div className="text-xs text-muted-foreground">Remixes</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="font-semibold text-sm md:text-base">
                  {new Date(asset.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-muted-foreground">Created</div>
              </div>
            </div>

            <Separator />

            {/* Price and Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                  <div className="text-2xl md:text-3xl font-bold">{asset.price}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Auction ends in</div>
                  <div className="flex items-center gap-1 text-sm font-mono">
                    <Timer className="h-4 w-4" />
                    {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handlePurchase} className="flex-1">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Now
                </Button>
                <Button variant="outline" onClick={handleMakeOffer} className="flex-1 bg-transparent">
                  <Gavel className="h-4 w-4 mr-2" />
                  Make Offer
                </Button>
              </div>

              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Share asset</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" asChild>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View on Starknet</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="outline" size="sm" onClick={handleQuickPurchase}>
                  Quick Buy
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Remix Indicator */}
        {asset.isRemix && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 md:mt-8"
          >
            <RemixIndicator
              isRemix={asset.isRemix}
              originalAssetId={asset.originalAssetId}
              remixGeneration={asset.remixGeneration}
              remixRoyalty={asset.remixRoyalty}
            />
          </motion.div>
        )}

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 md:mt-12"
        >
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4 md:mb-6">
              <TabsTrigger value="details" className="text-xs md:text-sm">
                Details
              </TabsTrigger>
              <TabsTrigger value="attributes" className="text-xs md:text-sm">
                Attributes
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs md:text-sm">
                History
              </TabsTrigger>
              <TabsTrigger value="remix-tree" className="text-xs md:text-sm">
                Remix Tree
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Asset Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <h4 className="font-medium mb-3 text-sm md:text-base">Blockchain Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Token ID</span>
                          <span className="font-mono text-xs md:text-sm">{asset.tokenId || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Blockchain</span>
                          <span>{asset.blockchain || "Starknet"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Royalty</span>
                          <span>{asset.royalty || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created</span>
                          <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3 text-sm md:text-base">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {asset.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        )) || <span className="text-muted-foreground text-sm">No tags</span>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attributes">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  {asset.attributes && asset.attributes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {asset.attributes.map((attr, index) => (
                        <div key={index} className="border rounded-lg p-3 md:p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm text-muted-foreground">{attr.trait_type}</span>
                            <span className="text-xs text-muted-foreground">
                              {Math.floor(Math.random() * 100)}% rare
                            </span>
                          </div>
                          <div className="font-medium mb-2 text-sm md:text-base">{attr.value}</div>
                          <Progress value={Math.floor(Math.random() * 100)} className="h-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8">
                      <Info className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2 text-sm md:text-base">No Attributes</h3>
                      <p className="text-muted-foreground text-sm">This asset doesn't have any defined attributes.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  {assetActivities.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {assetActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg"
                        >
                          <Avatar className="h-8 w-8 md:h-10 md:w-10">
                            <AvatarImage src={activity.user?.avatar || "/placeholder.svg"} alt={activity.user?.name} />
                            <AvatarFallback className="text-xs">
                              {activity.user?.name?.substring(0, 2) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm md:text-base">{activity.user?.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {activity.type}
                              </Badge>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              {activity.price && `for ${activity.price}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-xs md:text-sm text-muted-foreground">
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </div>
                            {activity.transactionHash && (
                              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                                <Copy className="h-3 w-3 mr-1" />
                                {activity.transactionHash.substring(0, 8)}...
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8">
                      <Clock className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2 text-sm md:text-base">No History</h3>
                      <p className="text-muted-foreground text-sm">No transaction history available for this asset.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="remix-tree">
              <RemixGenealogyTree assetId={asset.id} />
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* IP Type Template Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 md:mt-12"
        >
          <IPTypeTemplate ipType={asset.category} assetData={asset} creatorData={creator} />
        </motion.div>
      </div>

      {/* Fixed Bottom Action Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-6xl px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] grid grid-cols-2 gap-2">
          <Button onClick={handlePurchase} className="flex-1">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Buy Now
          </Button>
          <Button variant="outline" onClick={handleMakeOffer} className="flex-1 bg-transparent">
            <Gavel className="h-4 w-4 mr-2" />
            Make Offer
          </Button>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        asset={asset}
        creator={creator}
        onPurchaseComplete={handlePurchaseComplete}
      />
    </div>
  )
}
