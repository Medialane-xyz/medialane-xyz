"use client"

import { useState, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Heart, Sparkles, ArrowUpRight, Wallet } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useToast } from "@/src/components/ui/use-toast"

export default function AssetShowcase({ assets }) {
  const [category, setCategory] = useState("all")
  const [hoveredAsset, setHoveredAsset] = useState(null)
  const containerRef = useRef(null)
  const { toast } = useToast()

  const filteredAssets =
    category === "all" ? assets : assets.filter((asset) => asset.category.toLowerCase() === category.toLowerCase())

  const handleLike = (e, assetId) => {
    e.preventDefault()
    e.stopPropagation()

    toast({
      title: "Asset Liked",
      description: "You've liked this asset!",
      duration: 2000,
    })
  }

  const handlePurchase = (e, asset) => {
    e.preventDefault()
    e.stopPropagation()

    toast({
      title: "Purchase Initiated",
      description: `Attempting to purchase ${asset.name} for ${asset.price}`,
      duration: 3000,
    })
  }

  return (
    <div className="w-full h-full flex flex-col pt-24 px-4 md:px-8">
      <motion.div
        className="flex flex-col items-center text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <Sparkles className="w-4 h-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Discover Unique IP Assets</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Tokenized Intellectual Property</h1>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Explore and collect unique digital assets representing intellectual property rights on the blockchain
        </p>
      </motion.div>

      <motion.div
        className="mb-8 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="all" className="w-full max-w-md" onValueChange={setCategory}>
          <TabsList className="grid grid-cols-4 w-full glass-effect">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="art">Art</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="patent">Patents</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div
        className="flex-1 overflow-y-auto pb-8 px-2"
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset, index) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              index={index}
              onHover={setHoveredAsset}
              isHovered={hoveredAsset === asset.id}
              onLike={handleLike}
              onPurchase={handlePurchase}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function AssetCard({ asset, index, onHover, isHovered, onLike, onPurchase }) {
  const cardRef = useRef(null)

  // Mouse position for 3D effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Smooth spring physics for rotation
  const rotateX = useSpring(useTransform(y, [-100, 100], [10, -10]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-100, 100], [-10, 10]), { stiffness: 300, damping: 30 })

  function handleMouseMove(e) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()

    // Calculate mouse position relative to card center
    x.set(e.clientX - rect.left - rect.width / 2)
    y.set(e.clientY - rect.top - rect.height / 2)
  }

  function handleMouseLeave() {
    // Reset position when mouse leaves
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className="asset-card relative rounded-xl overflow-hidden border border-white/10 glass-effect"
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => onHover(asset.id)}
      whileHover={{ scale: 1.02 }}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={asset.image || "/placeholder.svg"}
          alt={asset.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <Badge className="absolute top-2 right-2 bg-black/50 hover:bg-black/70">{asset.category}</Badge>

        <button
          className="absolute top-2 left-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          onClick={(e) => onLike(e, asset.id)}
        >
          <Heart className={`h-4 w-4 ${asset.liked ? "fill-red-500 text-red-500" : ""}`} />
        </button>
      </div>

      <div className="asset-card-content p-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium truncate">{asset.name}</h4>
          <div className="flex items-center text-muted-foreground">
            <Heart className="h-3.5 w-3.5 mr-1 fill-current" />
            <span className="text-xs">{asset.likes}</span>
          </div>
        </div>

        <div className="flex items-center mt-2">
          <Avatar className="h-5 w-5 mr-1">
            <AvatarImage src={asset.creatorAvatar || "/placeholder.svg?height=20&width=20"} alt={asset.creator} />
            <AvatarFallback>{asset.creator.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{asset.creator}</span>
          <div className="ml-auto font-medium text-sm">{asset.price}</div>
        </div>
      </div>

      {isHovered && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <h3 className="text-lg font-bold mb-1">{asset.name}</h3>
          <p className="text-sm text-center text-zinc-300 mb-4 line-clamp-3">{asset.description}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="rounded-full">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              Details
            </Button>
            <Button size="sm" className="rounded-full" onClick={(e) => onPurchase(e, asset)}>
              <Wallet className="mr-1 h-4 w-4" />
              Buy Now
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
