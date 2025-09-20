"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  DollarSign,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Eye,
  Heart,
  Share2,
  Download,
  Grid3X3,
  List,
  Search,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import PageTransition from "@/src/components/page-transition"
import Link from "next/link"

export default function CreatorDashboardPage() {
  const { assets, collections } = useMockData()
  const [period, setPeriod] = useState("month")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock statistics with enhanced data
  const stats = {
    revenue: {
      day: "0.8 STRK",
      week: "5.2 STRK",
      month: "18.7 STRK",
      year: "124.5 STRK",
    },
    sales: {
      day: 2,
      week: 8,
      month: 24,
      year: 156,
    },
    views: {
      day: 45,
      week: 320,
      month: 1250,
      year: 15400,
    },
    assets: {
      day: 0,
      week: 1,
      month: 3,
      year: 28,
    },
  }

  // Mock portfolio assets
  const portfolioAssets = [
    {
      id: "1",
      title: "Digital Masterpiece #1",
      image: "/digital-art-masterpiece.png",
      price: "2.5 STRK",
      views: 1240,
      likes: 89,
      status: "listed",
      category: "Digital Art",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Music Rights Token",
      image: "/music-rights-token.png",
      price: "1.8 STRK",
      views: 856,
      likes: 67,
      status: "sold",
      category: "Music",
      createdAt: "2024-01-10",
    },
    {
      id: "3",
      title: "Patent #45892",
      image: "/patent-document.png",
      price: "5.0 STRK",
      views: 432,
      likes: 23,
      status: "draft",
      category: "Patent",
      createdAt: "2024-01-08",
    },
    {
      id: "4",
      title: "Brand Logo Design",
      image: "/generic-brand-logo.png",
      price: "0.9 STRK",
      views: 678,
      likes: 45,
      status: "listed",
      category: "Brand",
      createdAt: "2024-01-05",
    },
  ]

  // Mock recent activities
  const recentActivities = [
    {
      id: "1",
      type: "sale",
      description: "Digital Masterpiece #1 was sold for 2.5 STRK",
      time: "2 hours ago",
      amount: "+2.5 STRK",
    },
    {
      id: "2",
      type: "license",
      description: "Music Rights Token was licensed for 12 months",
      time: "5 hours ago",
      amount: "+0.8 STRK",
    },
    {
      id: "3",
      type: "view",
      description: "Your Patent #45892 received 24 new views",
      time: "1 day ago",
      amount: "",
    },
    {
      id: "4",
      type: "offer",
      description: "New offer received on Brand Logo Design",
      time: "2 days ago",
      amount: "1.2 STRK",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "listed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "sold":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const filteredAssets = portfolioAssets.filter(
    (asset) =>
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <PageTransition>
      <div className="min-h-screen pt-16 md:pt-20 pb-20 md:pb-24 px-3 md:px-6">
        {/* Mobile-First Header */}
        <motion.div
          className="flex flex-col items-center text-center mb-6 md:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-3">
            <LayoutDashboard className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium">Portfolio Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 gradient-text">Your IP Portfolio</h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-xl">
            Manage your assets, track performance, and grow your IP portfolio
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Compact Stats Grid */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="glass-effect border-white/10">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-green-500/20 p-1.5 mr-2">
                    <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-lg md:text-xl font-bold">{stats.revenue[period]}</div>
                    <p className="text-xs text-zinc-400">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/10">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-blue-500/20 p-1.5 mr-2">
                    <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-lg md:text-xl font-bold">{stats.sales[period]}</div>
                    <p className="text-xs text-zinc-400">Sales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/10">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-purple-500/20 p-1.5 mr-2">
                    <Eye className="h-3 w-3 md:h-4 md:w-4 text-purple-500" />
                  </div>
                  <div>
                    <div className="text-lg md:text-xl font-bold">{stats.views[period]}</div>
                    <p className="text-xs text-zinc-400">Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-white/10">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center">
                  <div className="rounded-full bg-pink-500/20 p-1.5 mr-2">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-pink-500" />
                  </div>
                  <div>
                    <div className="text-lg md:text-xl font-bold">{stats.assets[period]}</div>
                    <p className="text-xs text-zinc-400">New Assets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Time Period Selector */}
          <motion.div
            className="flex justify-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Tabs defaultValue="month" value={period} onValueChange={setPeriod}>
              <TabsList className="glass-effect">
                <TabsTrigger value="day" className="text-xs md:text-sm">
                  Day
                </TabsTrigger>
                <TabsTrigger value="week" className="text-xs md:text-sm">
                  Week
                </TabsTrigger>
                <TabsTrigger value="month" className="text-xs md:text-sm">
                  Month
                </TabsTrigger>
                <TabsTrigger value="year" className="text-xs md:text-sm">
                  Year
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Portfolio Management */}
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Assets Section */}
            <div className="lg:col-span-2">
              <Card className="glass-effect border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">Your Assets</CardTitle>
                      <CardDescription>Manage and track your IP portfolio</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 md:w-48">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                          placeholder="Search assets..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8 h-8 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant={viewMode === "grid" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className="h-8 w-8 p-0"
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className="h-8 w-8 p-0"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredAssets.map((asset, index) => (
                        <motion.div
                          key={asset.id}
                          className="group relative bg-white/5 rounded-lg border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <div className="aspect-video relative overflow-hidden">
                            <img
                              src={asset.image || "/placeholder.svg"}
                              alt={asset.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2">
                              <Badge className={`text-xs ${getStatusColor(asset.status)}`}>{asset.status}</Badge>
                            </div>
                          </div>
                          <div className="p-3">
                            <h3 className="font-medium text-sm mb-1 line-clamp-1">{asset.title}</h3>
                            <p className="text-xs text-zinc-400 mb-2">{asset.category}</p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm">{asset.price}</span>
                              <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  {asset.views}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  {asset.likes}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" className="flex-1 h-7 text-xs">
                                <Link href={`/assets/${asset.id}`} className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  View
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 px-2 bg-transparent">
                                <Share2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredAssets.map((asset, index) => (
                        <motion.div
                          key={asset.id}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-200"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <img
                            src={asset.image || "/placeholder.svg"}
                            alt={asset.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm line-clamp-1">{asset.title}</h3>
                            <p className="text-xs text-zinc-400">{asset.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm">{asset.price}</div>
                            <Badge className={`text-xs ${getStatusColor(asset.status)}`}>{asset.status}</Badge>
                          </div>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <ArrowUpRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {filteredAssets.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-zinc-400 mb-4">No assets found</p>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Asset
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Sidebar */}
            <div>
              <Card className="glass-effect border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Your latest transactions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-2">{activity.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-zinc-400">{activity.time}</p>
                            {activity.amount && (
                              <span className="text-xs font-medium text-green-400">{activity.amount}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-effect border-white/10 mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button className="w-full justify-start h-9" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Asset
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-9 bg-transparent" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Portfolio
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-9 bg-transparent" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
