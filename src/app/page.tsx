"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { useRouter } from "next/navigation"
import AssetCard from "@/src/components/asset-card"
import { FeaturedSlider } from "@/src/components/featured-slider"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useAllAssets } from "@/src/lib/hooks/use-all-assets"
import { FEATURED_DATA } from "@/src/lib/featured-data"

export default function Home() {
  const isMobile = useMobile()
  const router = useRouter()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])

  // Real data fetching
  const { assets, isLoading } = useAllAssets()

  // Get recent assets (first 12)
  const recentAssets = assets.slice(0, 12)

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

  return (
    <div className="relative w-full overflow-hidden pb-20">
      {/* Featured Slider - Faster Load with Static Data */}
      <FeaturedSlider items={FEATURED_DATA} />

      {/* Main Content - Optimized & Simplified */}
      <div className="px-4 md:px-6">
        <div className="py-12 md:py-16 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Recent Assets</h2>
              {/* <p className="text-base text-muted-foreground mt-2">Discover the latest drops in our marketplace</p> */}
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/assets")} className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {isLoading ? (
            <RecentAssetsSkeleton />
          ) : (
            <motion.section
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentAssets.map((asset: any) => (
                  <motion.div key={asset.id} variants={itemVariants}>
                    <AssetCard asset={asset} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  )
}

function RecentAssetsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
