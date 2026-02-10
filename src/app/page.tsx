"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { useMobile } from "@/src/hooks/use-mobile"
import { useRouter } from "next/navigation"
import AssetCard from "@/src/components/asset-card"
import { HeroSlider } from "@/src/components/hero-slider"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useAllCollections } from "@/src/lib/hooks/use-all-collections"
import { useAllAssets } from "@/src/lib/hooks/use-all-assets"

export default function Home() {
  const isMobile = useMobile()
  const router = useRouter()
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])

  // Real data fetching
  const { collections, isLoading: isCollectionsLoading } = useAllCollections()
  const { assets, isLoading: isAssetsLoading } = useAllAssets()

  const isLoading = isCollectionsLoading || isAssetsLoading

  // Map collections for HeroSlider
  const heroCollections = collections.map(c => ({
    id: c.id,
    name: c.name,
    description: c.description || `Collection #${c.id}`,
    image: c.image || "/placeholder.svg", // Fallback
    banner: c.banner || c.image || "/placeholder.svg", // Fallback
    items: c.items || 0,
    volume: 0, // Not available on-chain yet
    category: "Art" // Default category
  })).slice(0, 5) // Show top 5

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

  if (isLoading) {
    return <HomeSkeleton />
  }

  return (
    <div className="relative w-full overflow-hidden pb-20">
      {/* Hero Slider */}
      <HeroSlider collections={heroCollections} />

      {/* Main Content - Optimized & Simplified */}
      <div className="px-4 md:px-6">
        <motion.section initial="hidden" animate="visible" variants={containerVariants} className="py-12 md:py-16">
          <motion.div variants={itemVariants} className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Recent Assets</h2>
                <p className="text-base text-muted-foreground mt-2">Discover the latest drops in our marketplace</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/assets")} className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentAssets.map((asset: any) => (
                <motion.div key={asset.id} variants={itemVariants}>
                  <AssetCard asset={asset} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="relative w-full overflow-hidden pb-20">
      {/* Hero Skeleton */}
      <div className="relative min-h-screen h-screen w-full bg-zinc-900/20 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl space-y-6">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <div className="flex gap-4">
                <Skeleton className="h-12 w-40" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
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
        </div>
      </div>
    </div>
  )
}
