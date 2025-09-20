"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import AssetCard from "@/src/components/asset-card"
import { Button } from "@/src/components/ui/button"

interface FeaturedAssetsProps {
  assets: any[]
  limit?: number
  title?: string
  subtitle?: string
}

export function FeaturedAssets({ assets, limit = 8, title, subtitle }: FeaturedAssetsProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = limit
  const totalPages = Math.ceil(assets.length / itemsPerPage)

  const currentAssets = assets.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage)

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages)
  }

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
  }

  return (
    <div className="w-full">
      {(title || subtitle) && (
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={prevPage}
                disabled={totalPages <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={nextPage}
                disabled={totalPages <= 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {currentAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  )
}
