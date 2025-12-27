"use client"

import { motion } from "framer-motion"
import { CheckCircle2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { useRouter } from "next/navigation"

interface CollectionCardProps {
  collection: any
  index?: number
}

export function CollectionCard({ collection, index }: CollectionCardProps) {
  const router = useRouter()

  const handleCollectionClick = () => {
    router.push(`/collections/${collection.id}`)
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl border bg-background transition-all hover:shadow-md"
      variants={item}
      onClick={handleCollectionClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={collection.banner || "/placeholder.svg"}
          alt={collection.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="relative -mt-10 px-4 pb-4">
        <Avatar className="h-16 w-16 border-2 border-background">
          <AvatarImage src={collection.image || "/placeholder.svg"} alt={collection.name} />
          <AvatarFallback>{collection.name.substring(0, 2)}</AvatarFallback>
        </Avatar>

        <div className="mt-2">
          <div className="flex items-center">
            <h4 className="font-medium truncate">{collection.name}</h4>
            {collection.verified && <CheckCircle2 className="h-4 w-4 ml-1 text-green-500 fill-background" />}
          </div>

          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{collection.creator}</p>

          <div className="flex items-center justify-between mt-3">
            <div className="text-sm">
              <div className="font-medium">{collection.items || collection.totalItems || 0}</div>
              <div className="text-xs text-muted-foreground">Items</div>
            </div>

            <div className="text-sm">
              <div className="font-medium">{collection.volume || collection.totalVolume || "0 ETH"}</div>
              <div className="text-xs text-muted-foreground">Volume</div>
            </div>

            <Button variant="outline" size="sm">Open</Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CollectionCard
