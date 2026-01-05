"use client"

import { ArrowRight, CheckCircle2, TrendingUp, Star, Package, Layers } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface FeaturedCreatorsProps {
  creators: any[]
}

export default function FeaturedCreatorsCards({ creators }: FeaturedCreatorsProps) {
  const router = useRouter()
  const featuredCreators = creators.slice(10, 14)

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Creators</h2>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Featured creators driving creativity and innovation.
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={() => router.push("/creators")} className="gap-1 hidden sm:flex">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {featuredCreators.map((creator, index) => (
            <Link key={creator.id} href={`/users/${creator.id}`} className="group block">
              <div className="relative rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 h-[400px] md:h-[420px]">
                {/* Background image with gradient overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${creator.banner || creator.cover || "/placeholder.svg?height=400&width=300"})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90" />

                {/* Subtle gradient border animation */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 via-purple-500/5 to-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-6 space-y-4">
                  {/* Top badge */}
                  {index === 0 && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary/90 text-primary-foreground border-0 gap-1 backdrop-blur-sm">
                        <TrendingUp className="h-3 w-3" />
                        Top Creator
                      </Badge>
                    </div>
                  )}

                  {/* Creator info */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-3 border-white/20 ring-2 ring-primary/30 shadow-xl">
                        <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
                        <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary/30 to-primary/10">
                          {creator.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {creator.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-secondary rounded-full p-1 shadow-lg">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="font-bold text-lg leading-tight text-white group-hover:text-primary transition-colors">
                        {creator.name}
                      </h3>
                      <p className="text-sm text-white/70">{creator.specialties?.[0] || "Creator"}</p>
                    </div>
                  </div>

                  {/* Stats - Collections, Assets, Volume */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <p className="text-lg font-bold text-white">
                          {creator.totalCollections || Math.floor(creator.totalAssets / 5)}
                        </p>
                      </div>
                      <p className="text-xm text-white/60">Collections</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Package className="h-3.5 w-3.5 text-purple-400" />
                        <p className="text-lg font-bold text-white">{creator.totalAssets}</p>
                      </div>
                      <p className="text-xm text-white/60">Assets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xm font-bold mb-1  text-white">{creator.volumeTraded}</p>
                      <p className="text-xs text-white/60">Volume</p>
                    </div>
                  </div>

                  {/* View Profile CTA */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-white/80 group-hover:text-primary transition-colors">
                      Open
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Button variant="outline" onClick={() => router.push("/creators")} className="w-full mt-6 sm:hidden">
          View All Creators
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </section>
  )
}
