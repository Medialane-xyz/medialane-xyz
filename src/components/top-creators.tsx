"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { CheckCircle2 } from "lucide-react"

const creators = [
  {
    id: "1",
    name: "CryptoArtist",
    avatar: "/placeholder.svg?height=100&width=100",
    followers: 1245,
    verified: true,
  },
  {
    id: "2",
    name: "SoundWave",
    avatar: "/placeholder.svg?height=100&width=100",
    followers: 3782,
    verified: true,
  },
  {
    id: "3",
    name: "InnovatorX",
    avatar: "/placeholder.svg?height=100&width=100",
    followers: 892,
    verified: false,
  },
  {
    id: "4",
    name: "AuthorPrime",
    avatar: "/placeholder.svg?height=100&width=100",
    followers: 2156,
    verified: true,
  },
]

export default function TopCreators() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  }

  return (
    <motion.div className="space-y-4" variants={container} initial="hidden" animate="show">
      {creators.map((creator) => (
        <motion.div
          key={creator.id}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
          variants={item}
        >
          <Link href={`/users/${creator.id}`} className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
              <AvatarFallback>{creator.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <span className="font-medium">{creator.name}</span>
                {creator.verified && <CheckCircle2 className="h-3.5 w-3.5 ml-1 text-blue-500 fill-background" />}
              </div>
              <div className="text-xs text-muted-foreground">{creator.followers.toLocaleString()} followers</div>
            </div>
          </Link>
          <Button variant="outline" size="sm">
            Follow
          </Button>
        </motion.div>
      ))}
    </motion.div>
  )
}
