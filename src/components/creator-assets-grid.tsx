"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Grid, List, ChevronRight, Eye, Heart } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { mockAssets } from "@/src/lib/data/mock-data"

interface CreatorAssetsGridProps {
  creatorName: string
  currentAssetId: string | number
  limit?: number
}

export function CreatorAssetsGrid({ creatorName, currentAssetId, limit = 8 }: CreatorAssetsGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()

  const creatorAssets = useMemo(() => {
    return mockAssets.filter((asset) => asset.creator === creatorName && String(asset.id) !== String(currentAssetId))
  }, [creatorName, currentAssetId])

  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * limit
    return creatorAssets.slice(startIndex, startIndex + limit)
  }, [creatorAssets, currentPage, limit])

  const totalPages = Math.ceil(creatorAssets.length / limit)
  const hasMore = creatorAssets.length > limit

  if (creatorAssets.length === 0) {
    return null
  }

  const handleAssetClick = (assetId: string | number) => {
    router.push(`/assets/${assetId}`)
  }

  const handleViewAll = () => {
    // Navigate to creator's profile or assets page
    router.push(`/creators/${creatorName}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">More from {creatorName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {creatorAssets.length} asset{creatorAssets.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center border border-white/10 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {hasMore && (
            <Button variant="outline" onClick={handleViewAll} className="bg-transparent">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {paginatedAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="group cursor-pointer overflow-hidden border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                onClick={() => handleAssetClick(asset.id)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={asset.image || "/placeholder.svg?height=300&width=300&query=creator-asset"}
                    alt={asset.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-black/50 text-white text-xs">{asset.category}</Badge>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-black/50 rounded-full p-1">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                    {asset.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{asset.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{asset.likes}</span>
                      </div>
                      <span className="text-xs font-medium text-primary">{asset.price}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card
                className="group cursor-pointer border-white/10 hover:border-primary/50 transition-all duration-300 hover:shadow-md"
                onClick={() => handleAssetClick(asset.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={asset.image || "/placeholder.svg?height=64&width=64&query=list-asset"}
                        alt={asset.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate group-hover:text-primary transition-colors">{asset.name}</h4>
                      <p className="text-sm text-muted-foreground truncate mt-1">{asset.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {asset.category}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{asset.likes}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold text-primary">{asset.price}</div>
                      <div className="text-xs text-muted-foreground">Current Price</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "" : "bg-transparent"}
            >
              {page}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
