"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Shuffle, Info, Shield, DollarSign, Users, Zap } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useRouter } from "next/navigation"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import RemixCreator from "@/src/components/remix-creator"

interface RemixPageProps {
  params: {
    id: string
  }
}

export default function RemixPage({ params }: RemixPageProps) {
  const router = useRouter()
  const { assets } = useMockData()
  const [originalAsset, setOriginalAsset] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Find the original asset
    const asset = assets.find((a) => a.id === params.id)
    if (asset) {
      setOriginalAsset(asset)
    }
    setIsLoading(false)
  }, [params.id, assets])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!originalAsset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Asset not found</h1>
          <p className="text-muted-foreground mb-4">The asset you're trying to remix doesn't exist.</p>
          <Button onClick={() => router.push("/assets")}>Browse Assets</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">
      {/* Header */}
      <motion.div
        className="max-w-7xl mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="inline-flex items-center justify-center p-1.5 bg-purple-500/10 rounded-full mb-2">
              <Shuffle className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
              <span className="text-xs font-medium">Create Remix</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Remix: <span className="text-primary">{originalAsset.name}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Create a derivative work and start earning from your creativity
            </p>
          </div>
        </div>

        {/* Original Asset Preview */}
        <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Original Asset Information</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Asset Preview */}
              <div className="lg:col-span-1">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted/30 border border-white/10">
                  <img
                    src={originalAsset.image || "/placeholder.svg?height=300&width=300"}
                    alt={originalAsset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Asset Details */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{originalAsset.name}</h3>
                  <p className="text-muted-foreground">
                    {originalAsset.description || "A unique intellectual property asset ready for creative remixing."}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={originalAsset.creatorAvatar || "/placeholder.svg"}
                        alt={originalAsset.creator}
                      />
                      <AvatarFallback>{originalAsset.creator?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{originalAsset.creator}</p>
                      <p className="text-xs text-muted-foreground">Original Creator</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {originalAsset.category}
                  </Badge>
                </div>

                {/* License Terms */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-lg border border-green-500/20">
                  <div className="text-center">
                    <Shield className="h-5 w-5 text-green-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">License Type</p>
                    <p className="text-xs text-muted-foreground">Standard</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">License Fee</p>
                    <p className="text-xs text-muted-foreground">{originalAsset.price}</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">Royalties</p>
                    <p className="text-xs text-muted-foreground">15% to creator</p>
                  </div>
                  <div className="text-center">
                    <Zap className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                    <p className="text-xs font-medium">Usage</p>
                    <p className="text-xs text-muted-foreground">Commercial OK</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Remix Creator Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <RemixCreator originalAsset={originalAsset} />
      </motion.div>
    </div>
  )
}
