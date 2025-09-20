"use client"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import CreatorCard from "@/src/components/creator-card"
import { Button } from "@/src/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TrendingCreators() {
  const { creators } = useMockData()
  const router = useRouter()

  // Get 3 trending creators
  const trendingCreators = creators.sort((a, b) => b.followers - a.followers).slice(0, 3)

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {trendingCreators.map((creator, index) => (
          <CreatorCard key={creator.id} creator={creator} index={index} />
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="rounded-full px-6" onClick={() => router.push("/creators")}>
          View All Creators
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
