"use client"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Grid3X3, CheckCircle2, ArrowUpRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"

export default function CollectionGallery({ collections }) {
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef(null)

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.creator.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="w-full h-full flex flex-col pt-24 px-4 md:px-8">
      <motion.div
        className="flex flex-col items-center text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <Grid3X3 className="w-4 h-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Curated Collections</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">IP Asset Collections</h1>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Explore thematic collections of intellectual property assets curated by leading creators
        </p>
      </motion.div>

      <motion.div
        className="mb-8 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative w-full max-w-md">
          <Input
            type="search"
            placeholder="Search collections..."
            className="glass-effect border-white/10 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div
        className="flex-1 overflow-y-auto pb-8 px-2"
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection, index) => (
            <CollectionCard key={collection.id} collection={collection} index={index} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function CollectionCard({ collection, index }) {
  const cardRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [30, -30])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6])

  return (
    <motion.div
      ref={cardRef}
      className="collection-card rounded-xl overflow-hidden glass-effect border border-white/10"
      style={{ y, opacity }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={collection.banner || "/placeholder.svg"}
          alt={collection.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full p-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 border-2 border-background">
              <AvatarImage src={collection.image || "/placeholder.svg"} alt={collection.name} />
              <AvatarFallback>{collection.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <div className="flex items-center">
                <h4 className="font-medium text-white">{collection.name}</h4>
                {collection.verified && <CheckCircle2 className="h-4 w-4 ml-1 text-primary fill-background" />}
              </div>
              <p className="text-xs text-zinc-300">by {collection.creator}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {collection.items} items
          </Badge>
          <span className="text-xs text-zinc-400">{collection.volume} volume</span>
        </div>

        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{collection.description}</p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {collection.preview.map((item, i) => (
            <div key={i} className="aspect-square rounded-md overflow-hidden">
              <img
                src={item || "/placeholder.svg?height=80&width=80"}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>

        <Button className="w-full rounded-lg">
          View Collection
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  )
}
