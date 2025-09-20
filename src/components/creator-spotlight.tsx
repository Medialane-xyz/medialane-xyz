"use client"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Users, CheckCircle2, ArrowUpRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { useToast } from "@/src/components/ui/use-toast"

export default function CreatorSpotlight({ creators }) {
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef(null)
  const { toast } = useToast()

  const filteredCreators = creators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleFollow = (e, creatorName) => {
    e.preventDefault()
    e.stopPropagation()

    toast({
      title: "Creator Followed",
      description: `You are now following ${creatorName}`,
      duration: 2000,
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
          <Users className="w-4 h-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Meet the Creators</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Creative Visionaries</h1>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Connect with the brilliant minds behind the most innovative intellectual property assets
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
            placeholder="Search creators..."
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
          {filteredCreators.map((creator, index) => (
            <CreatorCard key={creator.id} creator={creator} index={index} onFollow={handleFollow} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function CreatorCard({ creator, index, onFollow }) {
  const cardRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6])

  return (
    <motion.div
      ref={cardRef}
      className="creator-card rounded-xl overflow-hidden glass-effect border border-white/10"
      style={{ y, opacity }}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={creator.banner || "/placeholder.svg"}
          alt={creator.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>

      <div className="relative -mt-10 px-4 pb-4">
        <Avatar className="h-16 w-16 border-4 border-background glow-effect">
          <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
          <AvatarFallback>{creator.name.substring(0, 2)}</AvatarFallback>
        </Avatar>

        <div className="mt-2">
          <div className="flex items-center">
            <h4 className="font-medium truncate">{creator.name}</h4>
            {creator.verified && <CheckCircle2 className="h-4 w-4 ml-1 text-primary fill-background" />}
          </div>

          <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{creator.bio}</p>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm">
              <div className="font-medium">{creator.followers.toLocaleString()}</div>
              <div className="text-xs text-zinc-500">Followers</div>
            </div>

            <div className="text-sm">
              <div className="font-medium">{creator.collections}</div>
              <div className="text-xs text-zinc-500">Collections</div>
            </div>

            <Button
              size="sm"
              variant={creator.following ? "default" : "outline"}
              className="rounded-full"
              onClick={(e) => onFollow(e, creator.name)}
            >
              {creator.following ? "Following" : "Follow"}
            </Button>
          </div>

          <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
            View Profile
            <ArrowUpRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
