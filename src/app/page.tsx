"use client"

import { FeaturedSlider } from "@/src/components/featured-slider"
import { FEATURED_DATA } from "@/src/lib/featured-data"

export default function Home() {
  return (
    <div className="relative w-full overflow-hidden">
      <FeaturedSlider items={FEATURED_DATA} />
    </div>
  )
}
