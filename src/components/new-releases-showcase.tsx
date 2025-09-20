"use client"
import { motion } from "framer-motion"
import Link from "next/link"
import { Eye, Heart, Clock, Zap, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useMobile } from "@/src/hooks/use-mobile"

interface Asset {
  id: string
  title: string
  description: string
  image: string
  price: number
  creator: {
    id: string
    name: string
    avatar: string
    verified: boolean
  }
  category: string
  views: number
  likes: number
  createdAt: string
  isNew?: boolean
  isTrending?: boolean
}

interface NewReleasesShowcaseProps {
  assets: Asset[]
  viewMode: "grid" | "list"
  searchQuery?: string
}

export function NewReleasesShowcase({ assets, viewMode, searchQuery }: NewReleasesShowcaseProps) {
  const isMobile = useMobile()

  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Unknown"
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

      if (diffInHours < 1) return "Just now"
      if (diffInHours < 24) return `${diffInHours}h ago`
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
      return `${Math.floor(diffInHours / 168)}w ago`
    } catch {
      return "Unknown"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      "digital-art": "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      music: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      patents: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
      literature: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      branding: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
      "film-video": "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
  }

  const getCreatorInitial = (creator: Asset["creator"]) => {
    if (!creator || !creator.name) return "?"
    return creator.name.charAt(0).toUpperCase()
  }

  const formatNumber = (num: number) => {
    if (!num || isNaN(num)) return "0"
    if (num > 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num > 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-3 md:space-y-4">
        {assets.map((asset, index) => {
          if (!asset || !asset.id) return null

          return (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-3 md:p-4">
                  <div className="flex gap-3 md:gap-4">
                    {/* Image */}
                    <Link href={`/assets/${asset.id}`} className="flex-shrink-0">
                      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={asset.image || "/placeholder.svg?height=80&width=80&query=digital+asset"}
                          alt={asset.title || "Asset"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {asset.isNew && (
                          <Badge className="absolute -top-1 -right-1 text-xs px-1 py-0 bg-green-500">New</Badge>
                        )}
                        {asset.isTrending && (
                          <Badge className="absolute -top-1 -left-1 text-xs px-1 py-0 bg-orange-500">
                            <TrendingUp className="w-2 h-2 mr-1" />
                            Hot
                          </Badge>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Link href={`/assets/${asset.id}`}>
                            <h3 className="font-semibold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                              {asset.title || "Untitled Asset"}
                            </h3>
                          </Link>
                          {asset.creator && (
                            <Link href={`/users/${asset.creator.id}`} className="flex items-center gap-2 mt-1">
                              <Avatar className="w-4 h-4 md:w-5 md:h-5">
                                <AvatarImage
                                  src={asset.creator.avatar || "/placeholder.svg?height=20&width=20&query=user+avatar"}
                                />
                                <AvatarFallback className="text-xs">{getCreatorInitial(asset.creator)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors">
                                {asset.creator.name || "Unknown Creator"}
                              </span>
                              {asset.creator.verified && (
                                <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                </div>
                              )}
                            </Link>
                          )}
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-sm md:text-base">{formatPrice(asset.price)}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(asset.createdAt)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(asset.category)}`}>
                            {asset.category?.replace("-", " ") || "Unknown"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {formatNumber(asset.views)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {formatNumber(asset.likes)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={`grid gap-3 md:gap-6 ${
        isMobile ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }`}
    >
      {assets.map((asset, index) => {
        if (!asset || !asset.id) return null

        return (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-0">
                {/* Image */}
                <Link href={`/assets/${asset.id}`}>
                  <div className="relative aspect-square bg-muted">
                    <img
                      src={asset.image || "/placeholder.svg?height=300&width=300&query=digital+asset"}
                      alt={asset.title || "Asset"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {asset.isNew && (
                        <Badge className="text-xs px-2 py-1 bg-green-500">
                          <Zap className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      )}
                      {asset.isTrending && (
                        <Badge className="text-xs px-2 py-1 bg-orange-500">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>

                    {/* Time Badge */}
                    <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                      {formatTimeAgo(asset.createdAt)}
                    </Badge>

                    {/* Price */}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-semibold">
                      {formatPrice(asset.price)}
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-3 md:p-4">
                  <Link href={`/assets/${asset.id}`}>
                    <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors mb-2">
                      {asset.title || "Untitled Asset"}
                    </h3>
                  </Link>

                  {/* Creator */}
                  {asset.creator && (
                    <Link href={`/users/${asset.creator.id}`} className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage
                          src={asset.creator.avatar || "/placeholder.svg?height=24&width=24&query=user+avatar"}
                        />
                        <AvatarFallback className="text-xs">{getCreatorInitial(asset.creator)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                        {asset.creator.name || "Unknown Creator"}
                      </span>
                      {asset.creator.verified && (
                        <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                      )}
                    </Link>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={`text-xs ${getCategoryColor(asset.category)}`}>
                      {asset.category?.replace("-", " ") || "Unknown"}
                    </Badge>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(asset.views)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(asset.likes)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
