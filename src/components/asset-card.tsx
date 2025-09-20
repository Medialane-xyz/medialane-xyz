"use client"

import type React from "react"
import { ExternalLink, Shuffle, Heart, Eye } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardFooter } from "@/src/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import { useRouter } from "next/navigation"

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

  return (
    <Card
      className="overflow-hidden group cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
      onClick={handleCardClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <img
          src={asset.image || "/placeholder.svg?height=400&width=400&query=asset-card"}
          alt={asset.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />

        {/* Top badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {asset.category && (
            <Badge variant="secondary" className="text-xs font-normal opacity-90">
              {asset.category}
            </Badge>
          )}
          {asset.isRemix && <Badge className="bg-purple-500/90 hover:bg-purple-500 text-white text-xs">Remix</Badge>}
        </div>

        {/* Bottom badges */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30 text-xs">
            Zero Fees
          </Badge>
          {asset.programmable && (
            <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs">
              Programmable
            </Badge>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-black"
                    onClick={handleCardClick}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white" onClick={handleRemixClick}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create Remix</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm truncate">{asset.name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Heart className="h-3 w-3" />
            <span className="text-xs">{asset.likes || 0}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <div
            className="flex items-center cursor-pointer hover:text-primary transition-colors"
            onClick={handleCreatorClick}
          >
            <Avatar className="h-4 w-4 mr-1">
              <AvatarImage src={asset.creatorAvatar || "/placeholder.svg?height=20&width=20"} alt={asset.creator} />
              <AvatarFallback className="text-[8px]">{String(asset.creator || "NA").slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{asset.creator}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="font-medium text-xs">{asset.price}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zero-fee licensing available</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Remix info */}
        {asset.isRemix && asset.originalAsset && (
          <div className="mt-2 p-2 bg-purple-500/10 rounded-md">
            <p className="text-xs text-purple-400">
              Remix of <span className="font-medium">{asset.originalAsset}</span>
            </p>
          </div>
        )}
      </CardContent>

      {!minimal && (
        <CardFooter className="p-3 pt-0">
          <div className="flex gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs rounded-full bg-transparent"
              onClick={handleCardClick}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              className="flex-1 h-7 text-xs rounded-full bg-purple-500 hover:bg-purple-600"
              onClick={handleRemixClick}
            >
              <Shuffle className="h-3 w-3 mr-1" />
              Remix
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
