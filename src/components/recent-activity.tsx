"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { ActivityItem } from "@/src/components/activity-item"
import { ArrowRight, Activity } from "lucide-react"
import { useRouter } from "next/navigation"

interface RecentActivityProps {
  activities: any[]
  limit?: number
  showHeader?: boolean
  compact?: boolean
}

export function RecentActivity({ activities, limit = 5, showHeader = true, compact = true }: RecentActivityProps) {
  const router = useRouter()
  const displayedActivities = activities.slice(0, limit)

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/activity")}
              className="text-muted-foreground hover:text-foreground"
            >
              View All
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-0" : "p-4"}>
        <div className="space-y-2">
          {displayedActivities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} compact={compact} showImage={true} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
