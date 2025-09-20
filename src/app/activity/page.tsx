"use client"

import { useState, useEffect, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import ActivityItem from "@/src/components/activity-item"
import PageTransition from "@/src/components/page-transition"

// Loading fallback
const LoadingFallback = () => (
  <div className="w-full h-40 flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
  </div>
)

export default function ActivityPage() {
  const { activities } = useMockData()
  const [filter, setFilter] = useState("all")
  const [newActivities, setNewActivities] = useState([])

  const filteredActivities =
    filter === "all"
      ? [...newActivities, ...activities]
      : [...newActivities, ...activities].filter((activity) => activity.type === filter)

  // Simulate real-time activity updates - reduced frequency for better performance
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
        price: type === "sale" || type === "listing" ? `${(Math.random() * 5 + 0.1).toFixed(2)} STRK` : null,
        time: "Just now",
        isNew: true,
      }

      setNewActivities((prev) => [newActivity, ...prev.slice(0, 4)])
    }, 30000) // Reduced frequency to 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">
        <motion.div
          className="flex flex-col items-center text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <Activity className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium">Live Updates</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 gradient-text">Community Activity</h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl">
            Watch real-time transactions and interactions happening in the TokenizeIP ecosystem on Starknet
          </p>
        </motion.div>

        <motion.div
          className="max-w-4xl mx-auto mb-6 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
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
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence>
              {filteredActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </AnimatePresence>
          </Suspense>

          {filteredActivities.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-medium mb-2">No activities found</h3>
              <p className="text-zinc-400">Try selecting a different filter</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  )
}
