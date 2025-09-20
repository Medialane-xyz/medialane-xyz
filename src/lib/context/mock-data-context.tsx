"use client"

import { createContext, useState } from "react"
import { mockAssets, mockCollections, mockCreators, mockActivities, mockStats } from "@/src/lib/data/mock-data"

export const MockDataContext = createContext(null)

export function MockDataProvider({ children }) {
  const [assets, setAssets] = useState(mockAssets)
  const [collections, setCollections] = useState(mockCollections)
  const [creators, setCreators] = useState(mockCreators)
  const [activities, setActivities] = useState(mockActivities)
  const [stats, setStats] = useState(mockStats)

  return (
    <MockDataContext.Provider
      value={{
        assets,
        collections,
        creators,
        activities,
        stats,
        setAssets,
        setCollections,
        setCreators,
        setActivities,
        setStats,
      }}
    >
      {children}
    </MockDataContext.Provider>
  )
}
