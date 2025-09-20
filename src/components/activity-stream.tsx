"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Heart, ShoppingCart, Tag, MessageCircle, Award, Zap, ArrowUpRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Button } from "@/src/components/ui/button"

export default function ActivityStream({ activities }) {
  const [filter, setFilter] = useState("all")
  const containerRef = useRef(null)
  const [newActivities, setNewActivities] = useState([])

  const filteredActivities =
    filter === "all"
      ? [...newActivities, ...activities]
      : [...newActivities, ...activities].filter((activity) => activity.type === filter)

  // Simulate real-time activity updates
  useEffect(() => {
    const activityTypes = ["sale", "like", "listing", "comment", "award", "mint"]
    const creators = ["CryptoArtist", "SoundWave", "InnovatorX", "AuthorPrime", "DesignStudio"]
    const assets = [
      "Digital Masterpiece #1",
      "Music Rights Token",
      "Patent #45892",
      "Novel Rights",
      "Brand Logo License",
    ]

    const interval = setInterval(() => {
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]
      const creator = creators[Math.floor(Math.random() * creators.length)]
      const asset = assets[Math.floor(Math.random() * assets.length)]

      const newActivity = {
        id: `new-${Date.now()}`,
        type,
        user: {
          name: creator,
          avatar: "/placeholder.svg?height=100&width=100",
        },
        asset,
        price: type === "sale" || type === "listing" ? `${(Math.random() * 5 + 0.1).toFixed(2)} ETH` : null,
        time: "Just now",
        icon: getActivityIcon(type),
        color: getActivityColor(type),
        isNew: true,
      }

      setNewActivities((prev) => [newActivity, ...prev.slice(0, 4)])
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  function getActivityIcon(type) {
    switch (type) {
      case "sale":
        return <ShoppingCart className="h-4 w-4" />
      case "like":
        return <Heart className="h-4 w-4" />
      case "listing":
        return <Tag className="h-4 w-4" />
      case "comment":
        return <MessageCircle className="h-4 w-4" />
      case "award":
        return <Award className="h-4 w-4" />
      case "mint":
        return <Zap className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  function getActivityColor(type) {
    switch (type) {
      case "sale":
        return "bg-green-500"
      case "like":
        return "bg-red-500"
      case "listing":
        return "bg-blue-500"
      case "comment":
        return "bg-purple-500"
      case "award":
        return "bg-yellow-500"
      case "mint":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
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
          <Activity className="w-4 h-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Live Updates</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Community Activity</h1>
        <p className="text-lg text-zinc-400 max-w-2xl">
          Watch real-time transactions and interactions happening in the TokenizeIP ecosystem
        </p>
      </motion.div>

      <motion.div
        className="mb-8 flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="all" className="w-full max-w-2xl" onValueChange={setFilter}>
          <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full glass-effect">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sale">Sales</TabsTrigger>
            <TabsTrigger value="listing">Listings</TabsTrigger>
            <TabsTrigger value="like">Likes</TabsTrigger>
            <TabsTrigger value="comment">Comments</TabsTrigger>
            <TabsTrigger value="award">Awards</TabsTrigger>
            <TabsTrigger value="mint">Mints</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div
        className="flex-1 overflow-y-auto pb-8 px-2 max-w-4xl mx-auto w-full"
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <AnimatePresence>
          {filteredActivities.map((activity) => (
            <motion.div
              key={activity.id}
              className={`activity-item flex items-center p-4 mb-3 rounded-lg glass-effect border border-white/10 ${
                activity.isNew ? "border-primary/30 glow-effect" : ""
              }`}
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`${activity.color} p-2 rounded-full mr-4`}>{activity.icon}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center flex-wrap">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                    <AvatarFallback>{activity.user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <Button variant="link" className="p-0 h-auto font-medium text-white hover:text-primary">
                    {activity.user.name}
                  </Button>

                  {activity.type === "sale" && (
                    <span className="text-sm ml-1">
                      sold{" "}
                      <Button variant="link" className="p-0 h-auto font-medium text-white hover:text-primary">
                        {activity.asset}
                      </Button>{" "}
                      for {activity.price}
                    </span>
                  )}

                  {activity.type === "like" && (
                    <span className="text-sm ml-1">
                      liked{" "}
                      <Button variant="link" className="p-0 h-auto font-medium text-white hover:text-primary">
                        {activity.asset}
                      </Button>
                    </span>
                  )}

                  {activity.type === "listing" && (
                    <span className="text-sm ml-1">
                      listed{" "}
                      <Button variant="link" className="p-0 h-auto font-medium text-white hover:text-primary">
                        {activity.asset}
                      </Button>{" "}
                      for {activity.price}
                    </span>
                  )}

                  {activity.type === "comment" && (
                    <span className="text-sm ml-1">
                      commented on{" "}
                      <Button variant="link" className="p-0 h-auto font-medium text-white hover:text-primary">
                        {activity.asset}
                      </Button>
                      {activity.comment && `: "${activity.comment}"`}
                    </span>
                  )}

                  {activity.type === "award" && (
                    <span className="text-sm ml-1">
                      received{" "}
                      <Badge
                        variant="outline"
                        className="ml-1 mr-1 bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      >
                        {activity.award || "Featured Collection"}
                      </Badge>{" "}
                      for{" "}
                      <Button variant="link" className="p-0 h-auto font-medium text-white hover:text-primary">
                        {activity.asset}
                      </Button>
                    </span>
                  )}

                  {activity.type === "mint" && (
                    <span className="text-sm ml-1">
                      minted{" "}
                      <Button variant="link" className="p-0 h-auto font-medium text-white hover:text-primary">
                        {activity.asset}
                      </Button>
                    </span>
                  )}

                  {activity.isNew && (
                    <Badge className="ml-2 bg-primary/20 text-primary border-primary/30 text-[10px]">New</Badge>
                  )}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{activity.time}</div>
              </div>

              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 ml-2">
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
