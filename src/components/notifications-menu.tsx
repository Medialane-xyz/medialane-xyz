"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, X, CheckCheck, Settings, ChevronRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { useMobile } from "@/src/hooks/use-mobile"
import { cn } from "@/src/lib/utils"

// Simplified notification data
const notifications = [
  {
    id: "1",
    type: "activity",
    title: "New Sale",
    message: "Your asset 'Digital Landscape' was sold for 2.5 ETH",
    time: "2 hours ago",
    read: false,
    avatar: "/placeholder.svg?height=40&width=40&text=U1",
  },
  {
    id: "2",
    type: "activity",
    title: "New Comment",
    message: "Jane left a comment on your asset 'Abstract Waves'",
    time: "5 hours ago",
    read: false,
    avatar: "/placeholder.svg?height=40&width=40&text=U2",
  },
  {
    id: "3",
    type: "system",
    title: "Platform Update",
    message: "New licensing features are now available",
    time: "1 day ago",
    read: true,
    avatar: null,
  },
  {
    id: "4",
    type: "system",
    title: "Wallet Connected",
    message: "Your wallet was successfully connected",
    time: "2 days ago",
    read: true,
    avatar: null,
  },
]

const NotificationsMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMobile()
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = activeTab === "all" ? notifications : notifications.filter((n) => n.type === activeTab)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleMarkAllRead = () => {
    // This would update the notifications in a real app
    closeMenu()
  }

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="rounded-full relative" onClick={toggleMenu}>
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary">
            {unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "absolute right-0 mt-2 glass-effect border border-white/10 rounded-xl shadow-lg z-50 overflow-hidden",
                isMobile ? "w-screen max-w-full left-0 -mx-4" : "w-80",
              )}
            >
              <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-medium">Notifications</h3>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={handleMarkAllRead}>
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={closeMenu}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
                <div className="px-3 pt-2">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                </div>

                <div className="max-h-[70vh] overflow-y-auto p-3 space-y-2">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-3 rounded-lg flex items-start gap-3",
                          notification.read ? "bg-transparent" : "bg-primary/10 border border-primary/20",
                        )}
                      >
                        {notification.avatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="rounded-full h-8 w-8 bg-primary/20 flex items-center justify-center">
                            <Bell className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <span className="text-xs text-zinc-400">{notification.time}</span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2">{notification.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-zinc-400">No notifications</p>
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-white/10">
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Notification Settings</span>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Tabs>
            </motion.div>

            {/* Overlay for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                onClick={closeMenu}
              />
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationsMenu
