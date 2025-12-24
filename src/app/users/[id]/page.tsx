"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  MapPin,
  Globe,
  Twitter,
  Instagram,
  Calendar,
  Grid3X3,
  Layers,
  Activity,
  Search,
  Filter,
  ArrowUpDown,
  UserPlus,
  UserMinus,
  Verified,
  Share2,
  MoreHorizontal,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import { Input } from "@/src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Separator } from "@/src/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import AssetCard from "@/src/components/asset-card"
import { CollectionCard } from "@/src/components/collection-card"
import { ActivityItem } from "@/src/components/activity-item"
import { useMobile } from "@/src/hooks/use-mobile"

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const isMobile = useMobile()
  const { creators, assets, collections, activities } = useMockData()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterCategory, setFilterCategory] = useState("all")
  const [isFollowing, setIsFollowing] = useState(false)

  const creator = creators.find((c) => c.id === params.id || c.username === params.id)
  const creatorAssets = assets.filter((asset) => asset.creatorId === creator?.id)
  const creatorCollections = collections.filter((collection) => collection.creatorId === creator?.id)
  const creatorActivities = activities.filter((activity) => activity.user.name === creator?.name)

  useEffect(() => {
    if (creator) {
      setIsFollowing(creator.following || false)
    }
  }, [creator])

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Creator Not Found</h1>
          <p className="text-muted-foreground mb-4">The creator you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/creators")}>Browse Creators</Button>
        </div>
      </div>
    )
  }

  const filteredAssets = creatorAssets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || asset.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case "price-high":
        return Number.parseFloat(b.price.replace(" STRK", "")) - Number.parseFloat(a.price.replace(" STRK", ""))
      case "price-low":
        return Number.parseFloat(a.price.replace(" STRK", "")) - Number.parseFloat(b.price.replace(" STRK", ""))
      case "popular":
        return b.likes - a.likes
      default:
        return 0
    }
  })

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    // In a real app, this would make an API call
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${creator.name} - MediaLane`,
        text: `Check out ${creator.name}'s profile on MediaLane`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-40">
      {/* Profile Header */}
      <div className="relative">
        {/* Banner */}
        <div
          className="h-96 md:h-[32rem] relative overflow-hidden bg-gradient-to-r from-primary/20 to-purple-500/20"
          style={{
            backgroundImage: creator.banner ? `url(${creator.banner})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Info */}
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 md:-mt-20">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background">
                <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={creator.name} />
                <AvatarFallback className="text-2xl">{creator.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {creator.verified && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Verified className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Name and Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">{creator.name}</h1>
                    {creator.verified && <Verified className="w-6 h-6 text-primary" />}
                  </div>
                  <p className="text-muted-foreground">@{creator.username}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4" />
                    {!isMobile && <span className="ml-2">Share</span>}
                  </Button>
                  {/* Follow/Unfollow Button 
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="sm"
                    onClick={handleFollow}
                    className="min-w-[100px]"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        {!isMobile && <span className="ml-2">Unfollow</span>}
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        {!isMobile && <span className="ml-2">Follow</span>}
                      </>
                    )}
                  </Button>
                  */}
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Bio and Stats */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bio */}
            <div className="lg:col-span-2 space-y-4">
              <p className="text-muted-foreground">{creator.bio}</p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {creator.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{creator.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(creator.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {creator.website && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={creator.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {creator.twitter && (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`https://twitter.com/${creator.twitter.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {creator.instagram && (
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`https://instagram.com/${creator.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {creator.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-primary/10">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{creator.followers?.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{creator.assets}</div>
                      <div className="text-sm text-muted-foreground">Assets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{creator.collections}</div>
                      <div className="text-sm text-muted-foreground">Collections</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{creator.remixes}</div>
                      <div className="text-sm text-muted-foreground">Remixes</div>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Volume</span>
                      <span className="text-sm font-medium">{creator.volumeEth} STRK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Remix Earnings</span>
                      <span className="text-sm font-medium text-green-500">{creator.remixEarnings} STRK</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Categories */}
              {creator.topCategories && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Top Categories</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {creator.topCategories.map((category) => (
                        <Badge
                          key={category}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => router.push(`/categories/${category.toLowerCase().replace(/\s+/g, "-")}`)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Assets ({creatorAssets.length})
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Collections ({creatorCollections.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Digital Art">Digital Art</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Patents">Patents</SelectItem>
                  <SelectItem value="Literature">Literature</SelectItem>
                  <SelectItem value="Branding">Branding</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Assets Grid */}
            {sortedAssets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-2">No assets found</div>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="collections" className="mt-6">
            {creatorCollections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creatorCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-2">No collections yet</div>
                <p className="text-sm text-muted-foreground">This creator hasn't created any collections</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            {creatorActivities.length > 0 ? (
              <div className="space-y-4">
                {creatorActivities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-2">No recent activity</div>
                <p className="text-sm text-muted-foreground">This creator hasn't been active recently</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
