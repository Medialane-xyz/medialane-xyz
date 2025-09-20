"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import { useMobile } from "@/src/hooks/use-mobile"

export default function DynamicStats() {
  const { stats } = useMockData()
  const [currentStats, setCurrentStats] = useState(stats)
  const isMobile = useMobile()

  // Simulate changing stats - reduced frequency for better performance
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStats((prev) => ({
        assets: prev.assets + Math.floor(Math.random() * 2),
        users: prev.users + Math.floor(Math.random() * 1),
        volume: +(prev.volume + Math.random() * 0.02).toFixed(2),
        transactions: prev.transactions + Math.floor(Math.random() * 3),
      }))
    }, 10000) // Reduced frequency to 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Don't render on mobile to save space and improve performance
  if (isMobile) {
    return null
  }

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 glass-effect rounded-full px-6 py-2 z-40"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
    >
      <div className="flex items-center space-x-6 text-xs md:text-sm">
        <div className="dynamic-stats-item">
          <div className="font-bold">{currentStats.assets.toLocaleString()}</div>
          <div className="text-zinc-400 text-xs">Assets</div>
        </div>
        <div className="dynamic-stats-item">
          <div className="font-bold">{currentStats.users.toLocaleString()}</div>
          <div className="text-zinc-400 text-xs">Users</div>
        </div>
        <div className="dynamic-stats-item">
          <div className="font-bold">${currentStats.volume.toLocaleString()}M</div>
          <div className="text-zinc-400 text-xs">Volume</div>
        </div>
        <div className="dynamic-stats-item">
          <div className="font-bold">{currentStats.transactions.toLocaleString()}</div>
          <div className="text-zinc-400 text-xs">Transactions</div>
        </div>
      </div>
    </motion.div>
  )
}
