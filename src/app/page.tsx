"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import { useRouter } from "next/navigation"
import AssetCard from "@/src/components/asset-card"
import { HeroSlider } from "@/src/components/hero-slider"
import FeaturedCreatorsEnhanced from "@/src/components/featured-creators-enhanced"
import LatestActivities from "@/src/components/latest-activities"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const isMobile = useMobile()
  const { assets, collections, creators, activities } = useMockData()
  const router = useRouter()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])

  const featuredCollections = collections.slice(0, 5)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true)
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
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
    <div className="relative w-full overflow-hidden pb-20">
      {/* Hero Slider */}
      <HeroSlider collections={featuredCollections} />

      {/* Main Content - Optimized & Simplified */}
      <div className="px-4 md:px-6">
        <motion.section initial="hidden" animate="visible" variants={containerVariants} className="py-12 md:py-16">
          <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trending Assets</h2>
                <p className="text-base text-muted-foreground mt-2">Discover what's popular in our marketplace</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/assets")} className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {assets.slice(12, 24).map((asset, index) => (
                <motion.div key={asset.id} variants={itemVariants}>
                  <AssetCard asset={asset} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* Featured Creators - Enhanced */}
        <FeaturedCreatorsEnhanced creators={creators} />

        <LatestActivities activities={activities} />
      </div>
    </div>
  )
}
