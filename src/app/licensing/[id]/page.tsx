"use client"

import { useParams } from "next/navigation"
import { LicensingOfferFlow } from "@/src/components/licensing-offer-flow"

export default function LicensingByIdPage() {
  const params = useParams()
  const id = String(params?.id || "")

  return (
    <main className="container mx-auto px-4 py-6 md:py-8">
      <div className="w-full max-w-6xl mx-auto">
        <LicensingOfferFlow assetId={id} initialStep={2} />
      </div>
    </main>
  )
}
