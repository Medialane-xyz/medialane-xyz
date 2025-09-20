"use client"

import { useState } from "react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { ActivityItem } from "@/src/components/activity-item"
import { Activity, TrendingUp, Shuffle, ShoppingCart } from "lucide-react"

interface LatestActivitiesProps {
  activities: any[]
  pageSize?: number
  showTabs?: boolean
}

export default function LatestActivities({ activities, pageSize = 12, showTabs = true }: LatestActivitiesProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [activeTab, setActiveTab] = useState("all")

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

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center justify-center p-1.5 bg-primary/10 rounded-full mb-2">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-primary" />
            <span className="text-xs font-medium">Live Activity</span>
          </div>
          <h2 className="text-2xl font-bold">Latest Activities</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time updates from the MediaLane community</p>
        </div>
      </div>

      {showTabs ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="sale" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="remix" className="flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Remixes
            </TabsTrigger>
            <TabsTrigger value="mint" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Mints
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-4">
              {displayedActivities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} compact={false} showImage={true} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
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
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {displayedActivities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} compact={false} showImage={true} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
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
      )}
    </section>
  )
}
