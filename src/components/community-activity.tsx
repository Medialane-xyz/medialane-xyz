"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Heart, MessageCircle, ShoppingCart, Tag } from "lucide-react"

const activities = [
  {
    id: "1",
    type: "sale",
    user: {
      name: "CryptoArtist",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    asset: "Digital Masterpiece #1",
    price: "2.5 ETH",
    time: "2 hours ago",
    icon: <ShoppingCart className="h-4 w-4" />,
    color: "bg-green-500",
  },
  {
    id: "2",
    type: "like",
    user: {
      name: "SoundWave",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    asset: "Music Rights Token",
    time: "3 hours ago",
    icon: <Heart className="h-4 w-4" />,
    color: "bg-red-500",
  },
  {
    id: "3",
    type: "listing",
    user: {
      name: "InnovatorX",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    asset: "Patent #45892",
    price: "5.0 ETH",
    time: "5 hours ago",
    icon: <Tag className="h-4 w-4" />,
    color: "bg-blue-500",
  },
  {
    id: "4",
    type: "comment",
    user: {
      name: "AuthorPrime",
      avatar: "/placeholder.svg?height=100&width=100",
    },
    asset: "Novel Rights",
    time: "8 hours ago",
    icon: <MessageCircle className="h-4 w-4" />,
    color: "bg-purple-500",
  },
]

export default function CommunityActivity() {
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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div className="space-y-3" variants={container} initial="hidden" animate="show">
      {activities.map((activity) => (
        <motion.div
          key={activity.id}
          className="flex items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
          variants={item}
        >
          <div className={`${activity.color} p-1.5 rounded-full mr-3`}>{activity.icon}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center text-sm">
              <Link href={`/users/${activity.user.name}`} className="font-medium truncate hover:underline">
                {activity.user.name}
              </Link>

              {activity.type === "sale" && (
                <span className="truncate ml-1">
                  sold{" "}
                  <Link href="#" className="font-medium hover:underline">
                    {activity.asset}
                  </Link>
                </span>
              )}

              {activity.type === "like" && (
                <span className="truncate ml-1">
                  liked{" "}
                  <Link href="#" className="font-medium hover:underline">
                    {activity.asset}
                  </Link>
                </span>
              )}

              {activity.type === "listing" && (
                <span className="truncate ml-1">
                  listed{" "}
                  <Link href="#" className="font-medium hover:underline">
                    {activity.asset}
                  </Link>
                </span>
              )}

              {activity.type === "comment" && (
                <span className="truncate ml-1">
                  commented on{" "}
                  <Link href="#" className="font-medium hover:underline">
                    {activity.asset}
                  </Link>
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">{activity.time}</div>
          </div>

          <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>{activity.user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </motion.div>
      ))}
    </motion.div>
  )
}
