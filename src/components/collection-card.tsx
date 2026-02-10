"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import Image from "next/image"
import { Badge } from "@/src/components/ui/badge"
import { useRouter } from "next/navigation"

interface CollectionCardProps {
  collection: any
  index?: number
}

export function CollectionCard({ collection, index }: CollectionCardProps) {
  const router = useRouter()

  const handleCollectionClick = () => {
    router.push(`/collections/${collection.ipNft || collection.id}`)
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const [imageError, setImageError] = useState(false)
  const [imgSrc, setImgSrc] = useState(collection.banner || collection.image)

  // Generate deterministic gradient based on collection ID
  const getGradient = (id: string) => {
    const gradients = [
      "from-pink-500 via-purple-500 to-indigo-500",
      "from-cyan-500 via-blue-500 to-indigo-500",
      "from-green-400 via-teal-500 to-blue-500",
      "from-orange-400 via-red-500 to-pink-500",
      "from-purple-500 via-indigo-500 to-blue-500"
    ]
    const index = Number(id) % gradients.length || 0
    return gradients[index]
  }

  return (
    <motion.div
      className="group flex flex-col overflow-hidden rounded-xl border bg-background/50 backdrop-blur-xl text-foreground shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      variants={item}
      onClick={handleCollectionClick}
    >
      {/* Header Image */}
      <div className="relative aspect-video overflow-hidden bg-transparent">
        {imageError || !imgSrc ? (
          <div className={`h-full w-full bg-gradient-to-br ${getGradient(collection.id)}`} />
        ) : (
          <Image
            src={imgSrc}
            alt={collection.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            onError={() => {
              // If we failed on banner and have an image, try that next
              if (imgSrc === collection.banner && collection.image) {
                setImgSrc(collection.image)
              } else {
                setImageError(true)
              }
            }}
          />
        )}
        {/* Subtle overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-semibold truncate text-lg leading-tight">{collection.name}</h3>
            {collection.verified && (
              <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10 leading-relaxed">
          {collection.description || "No description available for this collection."}
        </p>

        <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
          {/* Items Count */}
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Items</p>
            <p className="font-semibold">{collection.items || 0}</p>
          </div>

          {/* Collection Type - Replacing Volume */}
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Type</p>
            <p className="font-semibold truncate max-w-[120px]">{collection.type || "IP Collection"}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CollectionCard
