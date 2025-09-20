"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  ShoppingCart,
  Tag,
  MessageCircle,
  Award,
  Zap,
  Users,
  Briefcase,
  CalendarClock,
  FileCheck,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useMobile } from "@/src/hooks/use-mobile"
import { Button } from "@/src/components/ui/button"
import { useRouter } from "next/navigation"
import type { JSX } from "react"

type NotificationType =
  | "bid"
  | "sale"
  | "follow"
  | "mention"
  | "mint"
  | "license"
  | "event"
  | "trade"
  | "collection"
  | "platform"

interface LiveNotification {
  id: string
  type: NotificationType
  message: string
  user?: {
    name: string
    avatar: string
  }
  asset?: string
  price?: string
  timestamp: number
}

// Generator for random notifications
const generateRandomNotification = (): LiveNotification => {
  const types: NotificationType[] = [
    "bid",
    "sale",
    "follow",
    "mention",
    "mint",
    "license",
    "event",
    "trade",
    "collection",
    "platform",
  ]
  const users = [
    { name: "CryptoArtist", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "SoundWave", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "InnovatorX", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "AuthorPrime", avatar: "/placeholder.svg?height=32&width=32" },
    { name: "DesignStudio", avatar: "/placeholder.svg?height=32&width=32" },
  ]
  const assets = ["Digital Masterpiece #1", "Music Rights Token", "Patent #45892", "Novel Rights", "Brand Logo License"]

  const type = types[Math.floor(Math.random() * types.length)]
  const user = users[Math.floor(Math.random() * users.length)]
  const asset = assets[Math.floor(Math.random() * assets.length)]
  const price = (Math.random() * 5 + 0.1).toFixed(2) + " STRK"

  let message = ""

  switch (type) {
    case "bid":
      message = `${user.name} placed a bid of ${price} on ${asset}`
      break
    case "sale":
      message = `${asset} was sold for ${price}!`
      break
    case "follow":
      message = `${user.name} started following you`
      break
    case "mention":
      message = `${user.name} mentioned you in a comment`
      break
    case "mint":
      message = `${user.name} just minted a new collection`
      break
    case "license":
      message = `${user.name} licensed ${asset} for 12 months`
      break
    case "event":
      message = `Community event starting in 1 hour: IP Creator Roundtable`
      break
    case "trade":
      message = `${user.name} offered to trade for your ${asset}`
      break
    case "collection":
      message = `Your ${asset} was added to Featured Collections`
      break
    case "platform":
      message = `Platform update: New licensing features are now live!`
      break
  }

  return {
    id: `live-${Date.now()}`,
    type,
    message,
    user,
    asset,
    price: type === "bid" || type === "sale" ? price : undefined,
    timestamp: Date.now(),
  }
}

// Helper to get the icon for each notification type
const getNotificationIcon = (type: NotificationType): JSX.Element => {
  const iconMap: Record<NotificationType, React.ElementType> = {
    bid: ShoppingCart,
    sale: Tag,
    follow: Users,
    mention: MessageCircle,
    mint: Zap,
    license: FileCheck,
    event: CalendarClock,
    trade: Briefcase,
    collection: Heart,
    platform: Award,
  }

  const Icon = iconMap[type] || Award
  return <Icon className="h-4 w-4" />
}

// Helper to get notification background color
const getNotificationColor = (type: NotificationType): string => {
  const colorMap: Record<NotificationType, string> = {
    bid: "bg-blue-500/20 border-blue-500/30",
    sale: "bg-green-500/20 border-green-500/30",
    follow: "bg-purple-500/20 border-purple-500/30",
    mention: "bg-orange-500/20 border-orange-500/30",
    mint: "bg-yellow-500/20 border-yellow-500/30",
    license: "bg-teal-500/20 border-teal-500/30",
    event: "bg-indigo-500/20 border-indigo-500/30",
    trade: "bg-cyan-500/20 border-cyan-500/30",
    collection: "bg-pink-500/20 border-pink-500/30",
    platform: "bg-primary/20 border-primary/30",
  }

  return colorMap[type] || "bg-primary/20 border-primary/30"
}

export default function LiveNotifications() {
  const [notifications, setNotifications] = useState<LiveNotification[]>([])
  const [showIndex, setShowIndex] = useState<number | null>(null)
  const isMobile = useMobile()
  const router = useRouter()

  useEffect(() => {
    // Initial notification after a delay
    const initialTimer = setTimeout(() => {
      const initialNotification = generateRandomNotification()
      setNotifications([initialNotification])
      setShowIndex(0)
    }, 10000) // Delay first notification to avoid overwhelming the user

    // Generate notifications periodically
    const interval = setInterval(() => {
      const newNotification = generateRandomNotification()
      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, 5)
        setShowIndex(0)
        return updated
      })

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShowIndex(null)
      }, 5000)
    }, 60000) // Show a new notification every 60 seconds (reduced frequency)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])

  const handleDismiss = () => {
    setShowIndex(null)
  }

  const handleClick = (notification: LiveNotification) => {
    // Navigate based on notification type
    if (notification.type === "bid" || notification.type === "sale") {
      router.push("/portfolio")
    } else if (notification.type === "follow") {
      router.push("/creators")
    } else if (notification.type === "mint" || notification.type === "collection") {
      router.push("/collections")
    } else if (notification.type === "event") {
      router.push("/community/events")
    } else {
      router.push("/activity")
    }
    setShowIndex(null)
  }

  if (notifications.length === 0 || showIndex === null) return null

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed ${isMobile ? "bottom-20 left-4 right-4" : "bottom-6 right-6 max-w-sm"} z-40`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <motion.div
          className={`glass-effect border rounded-lg shadow-lg p-3 flex items-start gap-3 ${getNotificationColor(
            notifications[showIndex].type,
          )}`}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleClick(notifications[showIndex])}
          style={{ cursor: "pointer" }}
        >
          <div className="rounded-full p-2 bg-background/50 flex-shrink-0">
            {getNotificationIcon(notifications[showIndex].type)}
          </div>

          <div className="flex-1 min-w-0">
            {notifications[showIndex].user && (
              <div className="flex items-center mb-1">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage src={notifications[showIndex].user.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{notifications[showIndex].user.name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">{notifications[showIndex].user.name}</span>
              </div>
            )}
            <p className="text-sm line-clamp-2">{notifications[showIndex].message}</p>
            <p className="text-xs text-muted-foreground">Just now</p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full -mt-1 -mr-1"
            onClick={(e) => {
              e.stopPropagation()
              handleDismiss()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
