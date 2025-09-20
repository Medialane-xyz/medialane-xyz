"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell,
  Heart,
  ShoppingCart,
  Tag,
  MessageCircle,
  Zap,
  Users,
  Briefcase,
  CalendarClock,
  FileCheck,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import type React from "react"

// Expanded notification types
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

interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  time: string
  read: boolean
  user?: {
    name: string
    avatar: string
  }
  asset?: string
  price?: string
  event?: {
    name: string
    time: string
  }
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "bid",
    title: "New bid on your asset",
    description: "Someone placed a bid of 2.5 STRK on Digital Masterpiece #1",
    time: "2 min ago",
    read: false,
    user: {
      name: "CryptoArtist",
      avatar: "/placeholder.svg?height=36&width=36",
    },
  },
  {
    id: "2",
    type: "sale",
    title: "Asset sold",
    description: "Your Music Rights Token was sold for 1.2 STRK",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    type: "follow",
    title: "New follower",
    description: "CryptoArtist started following you",
    time: "3 hours ago",
    read: true,
    user: {
      name: "CryptoArtist",
      avatar: "/placeholder.svg?height=36&width=36",
    },
  },
  {
    id: "4",
    type: "mention",
    title: "Mentioned in a comment",
    description: "SoundWave mentioned you in a comment",
    time: "1 day ago",
    read: true,
  },
  {
    id: "5",
    type: "mint",
    title: "New collection minted",
    description: "Patent Portfolio Alpha was just minted by InnovationLabs",
    time: "3 hours ago",
    read: false,
    user: {
      name: "InnovationLabs",
      avatar: "/placeholder.svg?height=36&width=36",
    },
  },
  {
    id: "6",
    type: "license",
    title: "License agreement",
    description: "AuthorPrime licensed Novel Rights to you for 12 months",
    time: "4 hours ago",
    read: false,
  },
  {
    id: "7",
    type: "event",
    title: "Upcoming event",
    description: "IP Creators Roundtable happening tomorrow at 3 PM UTC",
    time: "5 hours ago",
    read: true,
    event: {
      name: "IP Creators Roundtable",
      time: "Tomorrow, 3 PM UTC",
    },
  },
  {
    id: "8",
    type: "trade",
    title: "Trade offer",
    description: "DesignStudio offered to trade Brand Logo License for your Digital Masterpiece",
    time: "6 hours ago",
    read: false,
    user: {
      name: "DesignStudio",
      avatar: "/placeholder.svg?height=36&width=36",
    },
  },
  {
    id: "9",
    type: "collection",
    title: "Featured in collection",
    description: "Your Patent #45892 was added to Top Innovations collection",
    time: "1 day ago",
    read: true,
  },
  {
    id: "10",
    type: "platform",
    title: "Platform update",
    description: "TokenizeIP just released new trade features. Check them out!",
    time: "2 days ago",
    read: true,
  },
]

// Helper to get the icon for each notification type
const getNotificationIcon = (type: NotificationType): React.JSX.Element => {
  const iconMap: Record<NotificationType, LucideIcon> = {
    bid: ShoppingCart,
    sale: Tag,
    follow: Users,
    mention: MessageCircle,
    mint: Zap,
    license: FileCheck,
    event: CalendarClock,
    trade: Briefcase,
    collection: Heart,
    platform: Bell,
  }

  const Icon = iconMap[type] || Bell
  return <Icon className="h-4 w-4" />
}

export default function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(notifications.filter((n) => !n.read).length)

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  const getTabCount = (tabValue: string): number => {
    if (tabValue === "all") return notifications.length
    if (tabValue === "unread") return notifications.filter((n) => !n.read).length
    if (tabValue === "mentions") return notifications.filter((n) => n.type === "mention").length
    if (tabValue === "transactions")
      return notifications.filter((n) => ["bid", "sale", "trade", "license"].includes(n.type)).length
    if (tabValue === "community")
      return notifications.filter((n) => ["follow", "collection", "mint", "event"].includes(n.type)).length
    return 0
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">
              All{" "}
              <Badge variant="outline" className="ml-1">
                {getTabCount("all")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread{" "}
              <Badge variant="outline" className="ml-1">
                {getTabCount("unread")}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="mentions">@You</TabsTrigger>
            <TabsTrigger value="transactions">Trades</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="max-h-[350px] overflow-auto">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-3 border-b last:border-0 hover:bg-muted/50 ${!notification.read ? "bg-muted/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-full p-2 bg-primary/20">{getNotificationIcon(notification.type)}</div>
                    <div className="grid gap-1 flex-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.description}</p>
                      <p className="text-xs text-muted-foreground">{notification.time}</p>
                    </div>
                    {!notification.read && <Badge className="ml-auto h-1.5 w-1.5 rounded-full p-0 bg-primary" />}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="unread" className="max-h-[350px] overflow-auto">
            <AnimatePresence>
              {notifications
                .filter((n) => !n.read)
                .map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 border-b last:border-0 hover:bg-muted/50 bg-muted/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-primary/20">{getNotificationIcon(notification.type)}</div>
                      <div className="grid gap-1 flex-1">
                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      <Badge className="ml-auto h-1.5 w-1.5 rounded-full p-0 bg-primary" />
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="mentions" className="max-h-[350px] overflow-auto">
            <AnimatePresence>
              {notifications
                .filter((n) => n.type === "mention")
                .map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3 border-b last:border-0 hover:bg-muted/50 ${
                      !notification.read ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-primary/20">{getNotificationIcon(notification.type)}</div>
                      <div className="grid gap-1 flex-1">
                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      {!notification.read && <Badge className="ml-auto h-1.5 w-1.5 rounded-full p-0 bg-primary" />}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="transactions" className="max-h-[350px] overflow-auto">
            <AnimatePresence>
              {notifications
                .filter((n) => ["bid", "sale", "trade", "license"].includes(n.type))
                .map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3 border-b last:border-0 hover:bg-muted/50 ${
                      !notification.read ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-primary/20">{getNotificationIcon(notification.type)}</div>
                      <div className="grid gap-1 flex-1">
                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      {!notification.read && <Badge className="ml-auto h-1.5 w-1.5 rounded-full p-0 bg-primary" />}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="community" className="max-h-[350px] overflow-auto">
            <AnimatePresence>
              {notifications
                .filter((n) => ["follow", "collection", "mint", "event"].includes(n.type))
                .map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3 border-b last:border-0 hover:bg-muted/50 ${
                      !notification.read ? "bg-muted/30" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full p-2 bg-primary/20">{getNotificationIcon(notification.type)}</div>
                      <div className="grid gap-1 flex-1">
                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                      {!notification.read && <Badge className="ml-auto h-1.5 w-1.5 rounded-full p-0 bg-primary" />}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
