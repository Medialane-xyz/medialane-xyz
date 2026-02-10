"use client"

import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react" // Added Loader2
import { Button } from "@/src/components/ui/button"
import { useRouter } from "next/navigation"
import AssetCard from "@/src/components/asset-card"
import { FeaturedSlider } from "@/src/components/featured-slider"
import { Skeleton } from "@/src/components/ui/skeleton"
import { useRecentAssets } from "@/src/lib/hooks/use-recent-assets" // Use new hook
import { FEATURED_DATA } from "@/src/lib/featured-data"

export default function Home() {
  const router = useRouter()

  // Optimized data fetching
  const { assets: recentAssets, loading: isLoading } = useRecentAssets(12)

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

          {isLoading && recentAssets.length === 0 ? (
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

              {/* Fallback if no assets found */}
              {!isLoading && recentAssets.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No assets found onchain yet.</p>
                </div>
              )}
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
