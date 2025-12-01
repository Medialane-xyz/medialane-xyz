"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Search,
  ArrowUpDown,
  MapPin,
  Verified,
  Users,
  TrendingUp,
  Grid3X3,
  List,
  UserPlus,
  Star,
  Zap,
} from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import UserCard, { type MarketplaceUser } from "@/src/components/user-card"
import { useMockData } from "@/src/lib/hooks/use-mock-data"

type SortKey = "relevance" | "volume" | "assets" | "listed" | "collections" | "name" | "followers" | "joined"
type ViewMode = "grid" | "list"
type UserRole = "all" | "creator" | "collector" | "verified"

export default function UsersPage() {
  const { creators } = useMockData()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortKey>("relevance")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [userRole, setUserRole] = useState<UserRole>("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [activeOnly, setActiveOnly] = useState(false)

  // Enhanced user data with additional properties
  const enhancedUsers: MarketplaceUser[] = creators.map((creator) => ({
    ...creator,
    role: creator.verified ? "creator" : Math.random() > 0.5 ? "creator" : "collector",
    isActive: Math.random() > 0.3,
    joinedRecently: new Date(creator.joinedDate).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000,
    trending: Math.random() > 0.7,
  }))

  // Get unique locations for filter
  const locations = useMemo(() => {
    const locs = enhancedUsers
      .map((user) => user.location)
      .filter(Boolean)
      .filter((loc, index, arr) => arr.indexOf(loc) === index)
    return ["all", ...locs]
  }, [enhancedUsers])

  const filtered = useMemo(() => {
    let result = enhancedUsers

    // Search filter
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      result = result.filter((u) => {
        const name = u.name?.toLowerCase() || ""
        const bio = u.bio?.toLowerCase() || ""
        const tags = (u.tags || []).join(" ").toLowerCase()
        const location = u.location?.toLowerCase() || ""
        return name.includes(q) || bio.includes(q) || tags.includes(q) || location.includes(q)
      })
    }

    // Role filter
    if (userRole !== "all") {
      if (userRole === "verified") {
        result = result.filter((u) => u.verified)
      } else {
        result = result.filter((u) => u.role === userRole)
      }
    }

    // Location filter
    if (locationFilter !== "all") {
      result = result.filter((u) => u.location === locationFilter)
    }

    // Verified filter
    if (verifiedOnly) {
      result = result.filter((u) => u.verified)
    }

    // Active filter
    if (activeOnly) {
      result = result.filter((u) => u.isActive)
    }

    return result
  }, [searchQuery, userRole, locationFilter, verifiedOnly, activeOnly, enhancedUsers])

  const sorted = useMemo(() => {
    if (sortBy === "relevance") return filtered
    const arr = [...filtered]
    switch (sortBy) {
      case "volume":
        arr.sort((a, b) => (b.volumeEth || 0) - (a.volumeEth || 0))
        break
      case "assets":
        arr.sort((a, b) => (b.assets || 0) - (a.assets || 0))
        break
      case "listed":
        arr.sort((a, b) => (b.listed || 0) - (a.listed || 0))
        break
      case "collections":
        arr.sort((a, b) => (b.collections || 0) - (a.collections || 0))
        break
      case "followers":
        arr.sort((a, b) => (b.followers || 0) - (a.followers || 0))
        break
      case "joined":
        arr.sort((a, b) => new Date(b.joinedDate || 0).getTime() - new Date(a.joinedDate || 0).getTime())
        break
      case "name":
        arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
    }
    return arr
  }, [filtered, sortBy])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const stats = useMemo(() => {
    const totalUsers = enhancedUsers.length
    const verifiedUsers = enhancedUsers.filter((u) => u.verified).length
    const activeUsers = enhancedUsers.filter((u) => u.isActive).length
    const newUsers = enhancedUsers.filter((u) => u.joinedRecently).length

    return { totalUsers, verifiedUsers, activeUsers, newUsers }
  }, [enhancedUsers])

  return (
    <div className="container px-4 py-12">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Discover Creators</h1>
            <p className="text-muted-foreground">
              Connect with talented creators and collectors in the MediaLane community
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Verified className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold">{stats.newUsers}</div>
              <div className="text-sm text-muted-foreground">New This Month</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search creators, bios, tags, or locations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <Tabs value={userRole} onValueChange={(value) => setUserRole(value as UserRole)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Users</TabsTrigger>
              <TabsTrigger value="creator">Creators</TabsTrigger>
              <TabsTrigger value="collector">Collectors</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location === "all" ? "All Locations" : location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Sort By</Label>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortKey)}>
                <SelectTrigger>
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="volume">Volume (STRK)</SelectItem>
                  <SelectItem value="assets">Assets</SelectItem>
                  <SelectItem value="followers">Followers</SelectItem>
                  <SelectItem value="collections">Collections</SelectItem>
                  <SelectItem value="joined">Recently Joined</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
              <Label htmlFor="verified-only" className="text-sm">
                Verified Only
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="active-only" checked={activeOnly} onCheckedChange={setActiveOnly} />
              <Label htmlFor="active-only" className="text-sm">
                Active Users
              </Label>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || userRole !== "all" || locationFilter !== "all" || verifiedOnly || activeOnly) && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                  Search: {searchQuery} ×
                </Badge>
              )}
              {userRole !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setUserRole("all")}>
                  Role: {userRole} ×
                </Badge>
              )}
              {locationFilter !== "all" && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setLocationFilter("all")}>
                  Location: {locationFilter} ×
                </Badge>
              )}
              {verifiedOnly && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setVerifiedOnly(false)}>
                  Verified Only ×
                </Badge>
              )}
              {activeOnly && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setActiveOnly(false)}>
                  Active Only ×
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-muted-foreground">
          Showing {sorted.length} of {enhancedUsers.length} users
        </div>

        {sorted.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Follow All
            </Button>
          </div>
        )}
      </div>

      {/* Users Grid/List */}
      {sorted.length > 0 ? (
        <motion.div
          className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {sorted.map((user) => (
            <motion.div
              key={user.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
              className="relative"
            >
              {/* Trending Badge */}
              {user.trending && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                </div>
              )}

              {/* New User Badge */}
              {user.joinedRecently && (
                <div className="absolute top-2 left-2 z-10">
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                </div>
              )}

              <UserCard user={user} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-2">No users found</div>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setUserRole("all")
              setLocationFilter("all")
              setVerifiedOnly(false)
              setActiveOnly(false)
            }}
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Load More */}
      {sorted.length > 0 && sorted.length >= 12 && (
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Load More Users
          </Button>
        </div>
      )}
    </div>
  )
}
