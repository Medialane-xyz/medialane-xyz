"use client"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import CollectionCard from "@/src/components/collection-card"
import { Button } from "@/src/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PopularCollections() {
  const { collections } = useMockData()
  const router = useRouter()

  // Get 3 popular collections
  const popularCollections = collections.sort((a, b) => b.items - a.items).slice(0, 3)

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {popularCollections.map((collection, index) => (
          <CollectionCard key={collection.id} collection={collection} index={index} />
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="rounded-full px-6" onClick={() => router.push("/collections")}>
          View All Collections
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
