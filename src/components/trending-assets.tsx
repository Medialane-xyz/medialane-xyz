"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Heart } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"

const trendingAssets = [
  {
    id: "1",
    name: "Digital Masterpiece #1",
    creator: "CryptoArtist",
    price: "2.5 ETH",
    image: "/placeholder.svg?height=400&width=400",
    likes: 128,
    category: "Art",
  },
  {
    id: "2",
    name: "Music Rights Token",
    creator: "SoundWave",
    price: "1.2 ETH",
    image: "/placeholder.svg?height=400&width=400",
    likes: 85,
    category: "Music",
  },
  {
    id: "3",
    name: "Patent #45892",
    creator: "InnovatorX",
    price: "5.0 ETH",
    image: "/placeholder.svg?height=400&width=400",
    likes: 210,
    category: "Patent",
  },
  {
    id: "4",
    name: "Novel Rights",
    creator: "AuthorPrime",
    price: "3.7 ETH",
    image: "/placeholder.svg?height=400&width=400",
    likes: 156,
    category: "Literature",
  },
]

export default function TrendingAssets() {
  const [hoveredAsset, setHoveredAsset] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Trending Assets</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/assets" className="flex items-center">
            View all assets
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {trendingAssets.map((asset) => (
          <motion.div
            key={asset.id}
            className="group relative overflow-hidden rounded-xl border bg-background transition-all hover:shadow-md"
            whileHover={{ y: -5 }}
            onMouseEnter={() => setHoveredAsset(asset.id)}
            onMouseLeave={() => setHoveredAsset(null)}
          >
            <Link href={`/assets/${asset.id}`} className="block">
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={asset.image || "/placeholder.svg"}
                  alt={asset.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <Badge className="absolute top-2 right-2 bg-black/50 hover:bg-black/70">{asset.category}</Badge>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">{asset.name}</h4>
                  <div className="flex items-center text-muted-foreground">
                    <Heart className="h-3.5 w-3.5 mr-1 fill-current" />
                    <span className="text-xs">{asset.likes}</span>
                  </div>
                </div>

                <div className="flex items-center mt-2">
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarImage src="/placeholder.svg?height=20&width=20" alt={asset.creator} />
                    <AvatarFallback>{asset.creator.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{asset.creator}</span>
                  <div className="ml-auto font-medium text-sm">{asset.price}</div>
                </div>
              </div>
            </Link>

            {hoveredAsset === asset.id && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button>View Details</Button>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
