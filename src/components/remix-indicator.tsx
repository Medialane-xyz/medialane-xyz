"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { GitBranch, ExternalLink, Info, Zap } from "lucide-react"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import Link from "next/link"

interface RemixIndicatorProps {
  isRemix?: boolean
  originalAssetId?: string | null
  remixGeneration?: number
  remixRoyalty?: number | null
  className?: string
}

export function RemixIndicator({
  isRemix = false,
  originalAssetId = null,
  remixGeneration = 0,
  remixRoyalty = null,
  className = "",
}: RemixIndicatorProps) {
  const { assets } = useMockData()
  const [originalAsset, setOriginalAsset] = useState(null)

  useEffect(() => {
    if (isRemix && originalAssetId && assets) {
      const found = assets.find((asset) => asset.id === originalAssetId)
      setOriginalAsset(found || null)
    }
  }, [isRemix, originalAssetId, assets])

  if (!isRemix) {
    return (
      <Card className={`border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-green-900 dark:text-green-100">Original Creation</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                This is an original work that can be remixed by others
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Remix Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Remix Creation</h4>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Gen {remixGeneration || 1}
                </Badge>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">This work is derived from an original creation</p>
            </div>
          </div>

          {/* Royalty Information */}
          {remixRoyalty && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-100 p-3 dark:bg-blue-900">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {remixRoyalty}% royalty goes to original creator
              </span>
            </div>
          )}

          {/* Original Asset Information */}
          {originalAsset ? (
            <div className="rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-700 dark:bg-blue-950">
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
                Original Asset
              </div>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={originalAsset.image || "/placeholder.svg"} alt={originalAsset.name} />
                  <AvatarFallback>{originalAsset.name?.substring(0, 2) || "OA"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-blue-900 dark:text-blue-100">{originalAsset.name}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">by {originalAsset.creator}</p>
                </div>
                <Link href={`/assets/${originalAsset.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900 bg-transparent"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : originalAssetId ? (
            <div className="rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-700 dark:bg-blue-950">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">Original asset information unavailable</span>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export default RemixIndicator
