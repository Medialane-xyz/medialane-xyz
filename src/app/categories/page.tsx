"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, TrendingUp, Grid3X3, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useMobile } from "@/src/hooks/use-mobile"

import { useMockData } from "@/src/lib/hooks/use-mock-data"

export default function CategoriesPage() {
  const router = useRouter()
  const isMobile = useMobile()
  const { assets, stats } = useMockData()
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    {
      id: "digital-art",
      name: "Digital Art",
      slug: "digital-art",
      description: "Original digital artworks, illustrations, and visual creations",
      image: "/digital-art-category.png",
      assetCount: 1250,
      volume: "2,450 STRK",
      floorPrice: "0.5 STRK",
      trending: true,
      subcategories: ["Abstract", "Portraits", "Landscapes", "Generative", "3D Art"],
      growth: "+15.2%",
    },
    {
      id: "music",
      name: "Music",
      slug: "music",
      description: "Original music compositions, beats, and audio content",
      image: "/diverse-music-genres.png",
      assetCount: 890,
      volume: "1,890 STRK",
      floorPrice: "0.3 STRK",
      trending: true,
      subcategories: ["Electronic", "Hip Hop", "Classical", "Ambient", "Sound Effects"],
      growth: "+22.8%",
    },
    {
      id: "patents",
      name: "Patents",
      slug: "patents",
      description: "Intellectual property patents and technical innovations",
      image: "/patents-category.png",
      assetCount: 156,
      volume: "890 STRK",
      floorPrice: "5.0 STRK",
      trending: false,
      subcategories: ["Technology", "Medical", "Software", "Hardware", "AI/ML"],
      growth: "+8.1%",
    },
    {
      id: "literature",
      name: "Literature",
      slug: "literature",
      description: "Books, stories, character rights, and literary works",
      image: "/literature-category.png",
      assetCount: 234,
      volume: "567 STRK",
      floorPrice: "1.2 STRK",
      trending: false,
      subcategories: ["Fiction", "Non-Fiction", "Poetry", "Scripts", "Character Rights"],
      growth: "+5.4%",
    },
    {
      id: "branding",
      name: "Branding",
      slug: "branding",
      description: "Brand assets, logos, and visual identity systems",
      image: "/branding-category.png",
      assetCount: 445,
      volume: "1,234 STRK",
      floorPrice: "0.8 STRK",
      trending: true,
      subcategories: ["Logos", "Brand Guidelines", "Typography", "Color Palettes", "Icons"],
      growth: "+18.7%",
    },
    {
      id: "film-video",
      name: "Film & Video",
      slug: "film-video",
      description: "Film rights, video content, and entertainment IP",
      image: "/film-video-category.png",
      assetCount: 178,
      volume: "2,100 STRK",
      floorPrice: "2.5 STRK",
      trending: false,
      subcategories: ["Film Rights", "Video Content", "Animation", "Documentaries", "Short Films"],
      growth: "+12.3%",
    },
  ]

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const trendingCategories = categories.filter((cat) => cat.trending)
  const allCategories = categories

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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-40">
      {/* Header */}
      <section className="py-12 px-4 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center space-y-6" initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2"
            >
              <Grid3X3 className="w-4 h-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Categories</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-3xl md:text-4xl font-bold">
              Discover by Media Type
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse creative works in selected formats and media types.
            </motion.p>

            <motion.div variants={itemVariants} className="max-w-md mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11 rounded-full"
                />
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{categories.length}</div>
                  <div className="text-sm text-muted-foreground">Categories</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border-green-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {categories.reduce((sum, cat) => sum + cat.assetCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Assets</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {categories
                      .reduce((sum, cat) => sum + Number.parseFloat(cat.volume.replace(/[^\d.]/g, "")), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Volume</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-red-600/10 border-orange-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{trendingCategories.length}</div>
                  <div className="text-sm text-muted-foreground">Trending</div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Categories Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                    onClick={() => router.push(`/categories/${category.slug}`)}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4">
                        {category.trending && (
                          <Badge className="bg-primary/90 text-primary-foreground">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Trending
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                        <p className="text-white/80 text-sm">{category.description}</p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{category.assetCount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Assets</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{category.volume}</div>
                          <div className="text-xs text-muted-foreground">Volume</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-500">{category.growth}</div>
                          <div className="text-xs text-muted-foreground">Growth</div>
                        </div>
                      </div>

                      {/* Subcategories */}
                      <div className="space-y-2 mb-4">
                        
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories.slice(0, 3).map((sub) => (
                            <Badge key={sub} variant="secondary" className="text-xs">
                              {sub}
                            </Badge>
                          ))}
                          {category.subcategories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{category.subcategories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Floor Price */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Start: <span className="font-medium text-foreground">{category.floorPrice}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="group-hover:bg-primary group-hover:text-primary-foreground"
                        >
                          Visit
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20"
                    onClick={() => router.push(`/categories/${category.slug}`)}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary text-primary-foreground">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Hot
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                        <p className="text-white/80 text-sm">{category.description}</p>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold">{category.assetCount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">Assets</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{category.volume}</div>
                          <div className="text-xs text-muted-foreground">Volume</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-500">{category.growth}</div>
                          <div className="text-xs text-muted-foreground">Growth</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Floor: <span className="font-medium text-foreground">{category.floorPrice}</span>
                        </div>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Explore
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No categories found</div>
            <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  )
}
