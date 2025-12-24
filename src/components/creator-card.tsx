"use client"

import type React from "react"

import { CheckCircle2, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface CreatorCardProps {
  creator: {
    id: string
    name: string
    bio?: string
    avatar?: string
    banner?: string
    verified?: boolean
    location?: string
    collections?: number
    assets?: number
    topCategories?: string[]
  }
  index: number
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  const router = useRouter()

  const handleViewProfile = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/users/${creator.id}`)
  }

  return (
    <Card className="group overflow-hidden border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg bg-card/50 backdrop-blur-sm">
      {/* Banner Section */}
      <div className="relative h-20 md:h-24 overflow-hidden">
        <img
          src={creator.banner || "/placeholder.svg?height=96&width=400&text=Creator+Banner"}
          alt={`${creator.name} banner`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Location Badge */}
        {creator.location && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs bg-black/50 text-white border-0">
              {creator.location}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Avatar & Name Section */}
        <div className="flex items-start gap-3">
          <Link href={`/users/${creator.id}`} className="flex-shrink-0">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm hover:shadow-md transition-shadow">
              <AvatarImage
                src={creator.avatar || "/placeholder.svg?height=48&width=48&text=Avatar"}
                alt={creator.name}
              />
              <AvatarFallback className="text-sm font-medium bg-primary/10">
                {creator.name?.substring(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <Link href={`/users/${creator.id}`} className="block hover:text-primary transition-colors">
              <div className="flex items-center gap-1 mb-1">
                <h3 className="font-semibold text-sm truncate">{creator.name}</h3>
                {creator.verified && <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/20 flex-shrink-0" />}
              </div>
            </Link>

            {creator.bio && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{creator.bio}</p>}
          </div>
        </div>

        {/* Categories */}
        {creator.topCategories && creator.topCategories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {creator.topCategories.slice(0, 2).map((category) => (
              <Badge key={category} variant="outline" className="text-xs px-2 py-0.5">
                {category}
              </Badge>
            ))}
            {creator.topCategories.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                +{creator.topCategories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="text-center">
            <div className="text-sm font-semibold">{creator.collections || 0}</div>
            <div className="text-xs text-muted-foreground">Collections</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold">{creator.assets || 0}</div>
            <div className="text-xs text-muted-foreground">Assets</div>
          </div>
        </div>

        {/* View Profile Button */}
        <Button onClick={handleViewProfile} className="w-full h-9 text-sm font-medium bg-transparent" variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          View Profile
        </Button>
      </CardContent>
    </Card>
  )
}
