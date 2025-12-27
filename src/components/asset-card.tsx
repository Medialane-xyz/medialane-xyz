"use client"

import type React from "react"
import { Shuffle, MoreVertical, ShoppingCart, Share2, Flag, Link, Coins, Scale, Handshake, ZoomIn } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

interface AssetCardProps {
  asset: any
  minimal?: boolean
}

export default function AssetCard({ asset, minimal = false }: AssetCardProps) {
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/assets/${asset.id}`)
  }

  const handleCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/users/${asset.creatorId || "1"}`)
  }

  const handleRemixClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/remix/${asset.id}`)
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/assets/${asset.id}?action=buy`)
  }

  const handleMakeOffer = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/assets/${asset.id}?action=offer`)
  }

  const handleViewAsset = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/assets/${asset.id}`)
  }

  const handleShareLink = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: `${asset.name} on MediaLane`,
        text: `Check out ${asset.name} by ${asset.creator}`,
        url: `${window.location.origin}/assets/${asset.id}`,
      })
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/assets/${asset.id}`)
    }
  }

  const handleReportAsset = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/assets/${asset.id}?action=report`)
  }

  return (
    <div className="group cursor-pointer" onClick={handleCardClick}>
      <div className="gradient-border-animated gradient-border-hover rounded-xl overflow-hidden transition-all duration-300">
        <div className="relative aspect-square overflow-hidden rounded-[10px] bg-muted/10">
          <img
            src={asset.image || "/placeholder.svg?height=400&width=400&query=asset-card"}
            alt={asset.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />

          {asset.category && (
            <div className="absolute top-3 left-3">
              <Badge variant="secondary" className="text-xs font-medium backdrop-blur-sm bg-background/70">
                {asset.category}
              </Badge>
            </div>
          )}

          {asset.isRemix && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary/90 text-primary-foreground text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
                <Shuffle className="h-3 w-3" />
                Remix
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-bold text-base line-clamp-2 text-foreground">{asset.name}</h3>
            <button
              className="flex items-center gap-1.5 mt-2 cursor-pointer group/creator hover:opacity-80 transition-opacity"
              onClick={handleCreatorClick}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={asset.creatorAvatar || "/placeholder.svg?height=24&width=24"} alt={asset.creator} />
                <AvatarFallback className="text-[9px]">{String(asset.creator || "NA").slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground font-medium">{asset.creator}</span>
            </button>
          </div>

          {!minimal && (
            <div className="space-y-2 pt-2 border-t border-border/20">
              
               <div className="flex gap-1">

                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 rounded-lg flex items-center justify-center gap-2 bg-transparent hover:bg-accent/50"
                  onClick={handleBuyNow}
                  title="Buy now property rights"
                >
                  <span className="text-xs">{asset.price}</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  title="View asset"
                  className="h-10 rounded-lg flex items-center justify-center gap-2 bg-transparent hover:bg-accent/50 font-medium"
                  onClick={handleViewAsset}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  title="Remix asset"
                  className="flex-1 h-10 text-sm rounded-lg bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 transition-all duration-200"
                  onClick={handleRemixClick}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  title="Make an offer"
                  className="h-10 rounded-lg flex items-center justify-center gap-2 bg-transparent hover:bg-accent/50 font-medium"
                  onClick={handleMakeOffer}
                >
                  <Handshake className="h-4 w-4" />
                </Button>

                


              

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-9 rounded-lg flex items-center justify-center gap-2 bg-transparent hover:bg-accent/50 font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                    
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={handleViewAsset} className="cursor-pointer flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <span>View Details</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleShareLink} className="cursor-pointer flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleReportAsset}
                    className="cursor-pointer flex items-center gap-2 text-red-500"
                  >
                    <Flag className="h-4 w-4" />
                    <span>Report</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>


            </div>


            </div>
          )}
        </div>
      </div>
    </div>
  )
}
