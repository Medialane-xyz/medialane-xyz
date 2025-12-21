"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { ActivityItem } from "@/src/components/activity-item"
import { Activity, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface LatestActivitiesProps {
  activities: any[]
  pageSize?: number
  showTabs?: boolean
}

export default function LatestActivities({ activities, pageSize = 6, showTabs = false }: LatestActivitiesProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  const filterActivities = (type?: string) => {
    if (!type || type === "all") return activities
    return activities.filter((activity) => activity.type === type)
  }

  const getFilteredActivities = () => {
    const filtered = filterActivities(activeTab)
    const startIndex = currentPage * pageSize
    return filtered.slice(startIndex, startIndex + pageSize)
  }

  const getTotalPages = () => {
    const filtered = filterActivities(activeTab)
    return Math.ceil(filtered.length / pageSize)
  }

  const displayedActivities = getFilteredActivities()
  const totalPages = getTotalPages()

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
          <p className="text-muted-foreground">Activity will appear here as users interact with the platform.</p>
        </CardContent>
      </Card>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="py-12 md:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Latest</h2>
              <p className="text-base text-muted-foreground mt-2">Follow the market in real time</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => router.push("/activity")} className="gap-2">
              View More
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-3">
          {displayedActivities.map((activity) => (
            <motion.div key={activity.id} variants={itemVariants}>
              <ActivityItem activity={activity} />
            </motion.div>
          ))}
        </motion.div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-border/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </motion.section>
  )
}
