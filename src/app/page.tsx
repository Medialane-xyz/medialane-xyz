"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, TrendingUp, Users, Star, Clock, Activity, Award } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/src/components/ui/card"
import AssetCard from "@/src/components/asset-card"
import { CollectionCard } from "@/src/components/collection-card"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { HeroSlider } from "@/src/components/hero-slider"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useMobile()
  const { assets, collections, activities, stats } = useMockData()
  const router = useRouter()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])

  // Featured collections for hero slider
  const featuredCollections = collections.slice(0, 5)

  // Live activity simulation
  const [liveActivities, setLiveActivities] = useState(activities.slice(0, 3))

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  // Simulate live activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveActivities((prev) => {
        const newActivity = activities[Math.floor(Math.random() * activities.length)]
        return [newActivity, ...prev.slice(0, 2)]
      })
    }, 8000)
    return () => clearInterval(interval)
  }, [activities])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <span className="text-sm font-medium">Loading MediaLane</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Slider - Full Screen */}
      <HeroSlider collections={featuredCollections} />

      {/* Main Content */}
      <div className="px-3 md:px-4">
        {/* Live Activity Feed */}
        <motion.section initial="hidden" animate="visible" variants={containerVariants} className="py-8 md:py-12">
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center justify-center px-2 py-1 bg-orange-500/10 rounded-full mb-2">
                  <Clock className="w-3 h-3 mr-1.5 text-orange-500" />
                  <span className="text-xs font-medium">Live Activity</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Recent Transactions</h2>
                <p className="text-sm text-muted-foreground">Real-time marketplace activity</p>
              </div>
            </div>

            <div className="space-y-3">
              {liveActivities.map((activity, index) => (
                <motion.div
                  key={`${activity.id}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:shadow-md transition-all duration-200"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.user?.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{activity.user?.name?.substring(0, 2) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name || "Unknown User"}</span>
                      <span className="text-muted-foreground ml-1">{activity.action}</span>
                      <span className="font-medium ml-1">{activity.asset?.title || "Unknown Asset"}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{activity.price} STRK</div>
                    <div className="text-xs text-green-500">+{Math.floor(Math.random() * 20 + 5)}%</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        



        {/* Trending Assets */}
        <motion.section initial="hidden" animate="visible" variants={containerVariants} className="py-8 md:py-12">
          <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center justify-center px-2 py-1 bg-primary/10 rounded-full mb-2">
                  <TrendingUp className="w-3 h-3 mr-1.5 text-primary" />
                  <span className="text-xs font-medium">Trending Now</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Popular Assets</h2>
                <p className="text-sm text-muted-foreground">Discover what's trending in the marketplace</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/assets")}>
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {assets.slice(0, 10).map((asset, index) => (
                <motion.div
                  key={asset.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <AssetCard asset={asset} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Featured Collections 
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="py-8 md:py-12 bg-muted/30 -mx-3 md:-mx-4 px-3 md:px-4"
        >
          <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center justify-center px-2 py-1 bg-purple-500/10 rounded-full mb-2">
                  <Star className="w-3 h-3 mr-1.5 text-purple-500" />
                  <span className="text-xs font-medium">Top Collections</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Featured Collections</h2>
                <p className="text-sm text-muted-foreground">Curated IP collections by top creators</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/collections")}>
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {collections.slice(0, 6).map((collection, index) => (
                <motion.div
                  key={collection.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <CollectionCard collection={collection} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>*/}




        {/* Top Creators */}
        <motion.section initial="hidden" animate="visible" variants={containerVariants} className="py-8 md:py-12">
          <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="inline-flex items-center justify-center px-2 py-1 bg-orange-500/10 rounded-full mb-2">
                  <Users className="w-3 h-3 mr-1.5 text-orange-500" />
                  <span className="text-xs font-medium">Top Creators</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold">Featured Creators</h2>
                <p className="text-sm text-muted-foreground">Meet the most successful IP creators</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/creators")}>
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                {
                  name: "CryptoArtist",
                  assets: 42,
                  volume: "156K",
                  color: "from-purple-500 to-pink-500",
                  verified: true,
                  followers: "12.5K",
                  growth: "+15%",
                },
                {
                  name: "SoundWave",
                  assets: 28,
                  volume: "89K",
                  color: "from-blue-500 to-cyan-500",
                  verified: true,
                  followers: "8.2K",
                  growth: "+23%",
                },
                {
                  name: "InnovatorX",
                  assets: 15,
                  volume: "67K",
                  color: "from-green-500 to-emerald-500",
                  verified: false,
                  followers: "5.1K",
                  growth: "+8%",
                },
              ].map((creator, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${creator.color} relative`}>
                          {creator.verified && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Award className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium flex items-center gap-1">
                            {creator.name}
                            {creator.verified && (
                              <Badge variant="secondary" className="text-xs px-1">
                                ✓
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">{creator.followers} followers</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-500 font-medium">{creator.growth}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Assets</span>
                          <div className="font-medium">{creator.assets}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Volume</span>
                          <div className="font-medium">{creator.volume} STRK</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>




        {/* Live Platform Stats */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="py-6 md:py-8 bg-muted/30 -mx-3 md:-mx-4 px-3 md:px-4"
        >
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center px-3 py-1.5 bg-primary/10 rounded-full mb-2">
                <Activity className="w-3 h-3 mr-1.5 text-primary animate-pulse" />
                <span className="text-xs font-medium">Live Platform Stats</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold mb-1">Growing Ecosystem</h2>
              <p className="text-sm text-muted-foreground">Real-time marketplace metrics</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  value: stats?.assets?.toLocaleString() || "12.8K",
                  label: "Total Assets",
                  color: "text-primary",
                  change: "+12%",
                },
                {
                  value: "3.2K",
                  label: "Active Remixes",
                  color: "text-purple-500",
                  change: "+23%",
                },
                {
                  value: stats?.users?.toLocaleString() || "5.6K",
                  label: "Creators",
                  color: "text-green-500",
                  change: "+8%",
                },
                {
                  value: `$${stats?.volume?.toLocaleString() || "8.4"}M`,
                  label: "Trading Volume",
                  color: "text-cyan-500",
                  change: "+15%",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="text-center p-4 bg-background/50 rounded-lg backdrop-blur-sm"
                >
                  <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                  <div className="text-xs text-green-500 font-medium">{stat.change}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>




      </div>
    </div>
  )
}
