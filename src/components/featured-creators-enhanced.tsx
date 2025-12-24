"use client"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, TrendingUp } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useRouter } from "next/navigation"

interface FeaturedCreatorsProps {
  creators: any[]
}

export default function FeaturedCreatorsEnhanced({ creators }: FeaturedCreatorsProps) {
  const router = useRouter()
  
  const featuredCreators = creators.slice(6, 9)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="py-12 md:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Creators</h2>
              <p className="text-base text-muted-foreground mt-2">Discover talented creators shaping the future</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/creators")} className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCreators.map((creator, index) => (
            <motion.div
              key={creator.id}
              variants={itemVariants}
              className="group relative overflow-hidden rounded-xl border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer h-full"
              onClick={() => router.push(`/users/${creator.id}`)}
            >
              {/* Banner Image */}
              <div className="relative h-32 overflow-hidden bg-muted/20">
                <img
                  src={creator.banner || "/placeholder.svg?height=200&width=600&query=creator-banner"}
                  alt={creator.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Creator Info */}
              <div className="px-4 pb-4 relative">
                {/* Avatar overlapping banner */}
                <div className="flex items-end gap-3 -mt-6 mb-4">
                  <Avatar className="h-14 w-14 border-2 border-background">
                    <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
                    <AvatarFallback>{creator.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  {creator.verified && <CheckCircle2 className="h-5 w-5 text-green flex-shrink-0 mb-1" />}
                </div>

                {/* Creator Details */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{creator.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{creator.specialties?.[0] || "Creator"}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Assets</p>
                      <p className="text-sm font-semibold">{creator.totalAssets}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sales</p>
                      <p className="text-sm font-semibold">{creator.totalSales.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Volume</p>
                      <p className="text-sm font-semibold text-primary">{creator.volumeTraded}</p>
                    </div>
                    <div className="flex items-end gap-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <p className="text-xs font-semibold text-green-500">Active</p>
                    </div>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  size="sm"
                  className="w-full mt-4 h-9 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/users/${creator.id}`)
                  }}
                >
                  Visit Profile
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
