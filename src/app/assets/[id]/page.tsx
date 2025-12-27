"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Heart, Share2, Copy, Flag, ShoppingCart, HandshakeIcon, GitBranch, Zap, Eye } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import { RemixGenealogyTree } from "@/src/components/remix-genealogy-tree"
import { mockAssets } from "@/src/lib/data/mock-data"

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const assets = mockAssets
  const asset = assets.find((a) => a.id === params.id)
  const [isFavorited, setIsFavorited] = useState(false)

  if (!asset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Asset Not Found</h2>
            <p className="text-muted-foreground mb-6">The asset you're looking for doesn't exist.</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div
        className="absolute inset-x-0 top-0 h-96 md:h-[500px] -z-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.4) 100%), url('${asset.image || "/placeholder.svg"}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(80px)",
        }}
      ></div>

      
      






      <div className="container mx-auto px-3 md:px-6 py-6 md:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6">
            

            
            
            
            {/* Asset image - single display only */}
            <div className="rounded-2xl overflow-hidden bg-muted border border-white/10 shadow-2xl">
              <div className="relative aspect-square">
                <Image
                  src={asset.image || "/placeholder.svg?height=600&width=600&query=digital+asset"}
                  alt={asset.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {asset.verified && <Badge className="bg-green-500/90 text-white text-xs">Verified</Badge>}
                  {asset.rarity && (
                    <Badge variant="secondary" className="text-xs bg-blue-500/90 text-white">
                      {asset.rarity}
                    </Badge>
                  )}
                  {asset.isRemix && <Badge className="bg-purple-500/90 text-white text-xs">Remix</Badge>}
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                    Zero Fees
                  </Badge>
                  <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full">
                    <Eye className="h-3.5 w-3.5 text-white" />
                    <span className="text-white text-xs font-medium">{asset.views || 1200}</span>
                  </div>
                </div>
              </div>
            </div>

            

            
            
            
            
            
            
            
            




          </div>

          {/* Right column - Marketplace & Actions - NO sticky positioning */}
          <div className="space-y-5 lg:max-h-fit">


                  {/* Asset header and description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {asset.category}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{asset.name}</h1>
              <p className="text-base text-muted-foreground leading-relaxed">{asset.description}</p>
            </div>



            <Card className="border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5">
              <CardContent className="p-6 md:p-5 space-y-5">
                

                {/* Auction Timer */}
                <div className="p-4 bg-black/20 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 text-xs md:text-sm mb-2.5">
                    <Zap className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                    <span className="text-muted-foreground">Auction</span>
                  </div>
                  <div className="font-mono text-sm md:text-base font-semibold text-white">
                    {asset.timeLeft?.days || 0}d {asset.timeLeft?.hours || 0}h {asset.timeLeft?.minutes || 0}m{" "}
                    {asset.timeLeft?.seconds || 0}s
                  </div>
                </div>

                <div className="space-y-3 pt-3">
                  {/* Buy Now - Full Property Rights */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => router.push(`/checkout/${asset.id}`)}
                      className="w-full h-12 text-base font-semibold bg-green-600 hover:bg-green-700"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2 flex-shrink-0" />
                      Buy Now - {asset.price}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center px-1">
                      Acquire complete property rights and ownership
                    </p>
                  </div>

                  {/* Make Offer - Property Rights */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/make-offer/${asset.id}`)}
                      className="w-full h-11 text-sm font-medium bg-transparent"
                    >
                      <HandshakeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                      Make an Offer
                    </Button>
                    <p className="text-xs text-muted-foreground text-center px-1">
                      Propose a price to acquire property rights
                    </p>
                  </div>

                  {/* Remix - Create Derivative */}
                  <div className="space-y-2 pt-2 border-t border-white/10 bg-purple-500/10 rounded-lg p-3 -mx-6 px-3">
                    <Button
                      onClick={() => router.push(`/remix/${asset.id}`)}
                      className="w-full h-11 text-sm font-medium bg-purple-600 hover:bg-purple-700"
                    >
                      <GitBranch className="h-4 w-4 mr-2 flex-shrink-0" />
                      Remix This Asset
                    </Button>
                    <p className="text-xs text-muted-foreground text-center px-1">
                      Create a derivative work with new license. Price auto-calculated with {asset.royalty}% royalty to
                      creator.
                    </p>
                    <div className="bg-purple-500/20 rounded p-2 mt-2">
                      <p className="text-xs text-purple-200">
                        <span className="font-semibold">💡 Monetization:</span> Earn from your creations while
                        supporting original creators
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>






            

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-white/10 bg-muted/30">
                <CardContent className="p-4 text-center">
                  <div className="font-bold text-xl">{asset.remixCount || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">Remixes</div>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-muted/30">
                <CardContent className="p-4 text-center">
                  <div className="font-bold text-xl">{asset.holders || 24}</div>
                  <div className="text-xs text-muted-foreground mt-1">Holders</div>
                </CardContent>
              </Card>
            </div>

            {/* Licensing Info */}
            <Card className="border-white/10">
              <CardContent className="space-y-3 pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0">✓</div>
                  <div className="text-sm">
                    <div className="font-medium">Commercial Use</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Yes, with attribution</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0">✓</div>
                  <div className="text-sm">
                    <div className="font-medium">Remix Rights</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Create derivatives</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0">✓</div>
                  <div className="text-sm">
                    <div className="font-medium">Royalty Rate</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{asset.royalty || 10}% on resale</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>





        </div>





      {/* Creator card */}
            <Card className="border-white/10 bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur">
              <CardContent className="p-5 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-14 w-14 md:h-16 md:w-16 flex-shrink-0 rounded-full border-2 border-primary/30 bg-muted"></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold hover:underline text-base md:text-lg block truncate">
                        {asset.creator?.name || asset.creator}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        Creator {asset.creator?.verified && <span className="text-blue-500">Verified</span>}
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => router.push(`/creators/${asset.creator?.id || asset.creator}`)}
                  className="w-full mt-4 text-sm bg-transparent"
                >
                  View Creator
                </Button>
              </CardContent>
            </Card>

            {/* Tabs - no sticky elements */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 h-11 md:h-10">
                <TabsTrigger value="details" className="text-xs md:text-sm">
                  Details
                </TabsTrigger>
                <TabsTrigger value="lineage" className="text-xs md:text-sm">
                  Provenance
                </TabsTrigger>
                <TabsTrigger value="collection" className="text-xs md:text-sm">
                  Collection
                </TabsTrigger>

              </TabsList>

              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardContent className="space-y-6 pt-6">
                    <div>
                      <h4 className="font-semibold mb-4 text-sm md:text-base">Asset Information & Attributes</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground text-sm">Token ID</span>
                          <span className="font-mono text-xs md:text-sm text-right truncate ml-2">
                            {asset.tokenId || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground text-sm">Blockchain</span>
                          <span className="text-sm text-right">{asset.blockchain || "Starknet"}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground text-sm">Royalty</span>
                          <span className="text-sm text-right">{asset.royalty || 0}%</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground text-sm">Created</span>
                          <span className="text-sm text-right">{new Date(asset.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-4 text-sm md:text-base">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {asset.tags?.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        )) || <span className="text-muted-foreground text-xs">No tags</span>}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-4 text-sm md:text-base">Metadata & Attributes</h4>
                      {asset.attributes && asset.attributes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {asset.attributes.map((attr, index) => (
                            <div key={index} className="p-3 md:p-4 bg-muted/30 rounded-lg border border-white/10">
                              <div className="text-xs text-muted-foreground">{attr.trait_type}</div>
                              <div className="font-semibold text-sm md:text-base mt-1">{attr.value}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-muted-foreground">No additional attributes defined</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="lineage" className="space-y-6">
                <Card>
                  <CardContent className="py-6">
                    <h4 className="font-semibold mb-4 text-sm md:text-base">Transaction History</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <div className="text-sm">Sale to Owner</div>
                        <div className="text-xs text-muted-foreground">2 days ago</div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded">
                        <div className="text-sm">Minted</div>
                        <div className="text-xs text-muted-foreground">5 days ago</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Remix Genealogy Tree - scrolls naturally */}
                <RemixGenealogyTree assetId={asset.id} />
              </TabsContent>
            </Tabs>











      </div>


                      {/* Sticky header - kept at top for navigation */}
      <div className="flex bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-3 md:px-6 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-10 w-10 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-1">
              
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <Copy className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-red-600">
                <Flag className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>



    </div>
  )
}
