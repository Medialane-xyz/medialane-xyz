"use client"

import { useSearchParams } from "next/navigation"
import { LicensingOfferFlow } from "@/src/components/licensing-offer-flow"

export default function LicensingIndexPage() {
  const params = useSearchParams()
  const id = params.get("id") || undefined

  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      <div className="w-full max-w-6xl mx-auto">
        <LicensingOfferFlow assetId={id} initialStep={id ? 2 : 1} />
      </div>
    </main>
  )
}
