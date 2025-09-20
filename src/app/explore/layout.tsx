import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Explore IP | MediaLane",
  description:
    "Discover, explore, and license intellectual property assets on MediaLane - the zero-fee IP marketplace on Starknet.",
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <section>{children}</section>
}
