"use client"

import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { MakeOfferComponent } from "@/src/components/make-offer-component"

export default function MakeOfferPage() {
  const params = useParams()
  const router = useRouter()
  const assetId = params.id as string

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-20 md:pb-24">
      <div className="container mx-auto px-3 md:px-6 lg:px-8">
        {/* Mobile Header */}
        <div className="sticky top-16 md:top-20 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-white/10 -mx-3 md:-mx-6 lg:-mx-8 px-3 md:px-6 lg:px-8 py-3 mb-4 md:mb-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Asset</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <h1 className="text-lg md:text-xl font-semibold">Make Offer</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          <MakeOfferComponent assetId={assetId} />
        </motion.div>
      </div>
    </div>
  )
}
