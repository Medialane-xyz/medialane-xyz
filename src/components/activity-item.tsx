"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import {
  ShoppingCart,
  Heart,
  List,
  GitBranch,
  Zap,
  Users,
  Gavel,
  FileText,
  UserPlus,
  ExternalLink,
  Copy,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ActivityItemProps {
  activity: {
    id: string
    type: "sale" | "remix" | "listing" | "like" | "mint" | "license" | "collection_created" | "offer" | "follow"
    user: {
      id: string
      name: string
      avatar: string
      verified?: boolean
    }
    asset?: {
      id: string
      name: string
      image: string
    }
    originalAsset?: {
      id: string
      name: string
      image: string
    }
    collection?: {
      id: string
      name: string
      image: string
    }
    followedUser?: {
      id: string
      name: string
      avatar: string
      verified?: boolean
    }
    price?: string
    licenseType?: string
    royalty?: string
    timestamp: string
    transactionHash?: string
  }
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "sale":
      return <ShoppingCart className="h-4 w-4" />
    case "remix":
      return <GitBranch className="h-4 w-4" />
    case "listing":
      return <List className="h-4 w-4" />
    case "like":
      return <Heart className="h-4 w-4" />
    case "mint":
      return <Zap className="h-4 w-4" />
    case "license":
      return <FileText className="h-4 w-4" />
    case "collection_created":
      return <Users className="h-4 w-4" />
    case "offer":
      return <Gavel className="h-4 w-4" />
    case "follow":
      return <UserPlus className="h-4 w-4" />
    default:
      return <Zap className="h-4 w-4" />
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "sale":
      return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400"
    case "remix":
      return "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400"
    case "listing":
      return "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-400"
    case "like":
      return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400"
    case "mint":
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400"
    case "license":
      return "text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-400"
    case "collection_created":
      return "text-cyan-600 bg-cyan-100 dark:bg-cyan-900 dark:text-cyan-400"
    case "offer":
      return "text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400"
    case "follow":
      return "text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-400"
    default:
      return "text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400"
  }
}

const getActivityDescription = (activity: ActivityItemProps["activity"]) => {
  const { type, user, asset, originalAsset, collection, followedUser, price, licenseType, royalty } = activity

  switch (type) {
    case "sale":
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          purchased{" "}
          <Link href={`/assets/${asset?.id}`} className="font-medium hover:underline text-primary">
            {asset?.name}
          </Link>
          {price && <span className="text-green-600 font-medium"> for {price}</span>}
        </span>
      )

    case "remix":
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          created a remix{" "}
          <Link href={`/assets/${asset?.id}`} className="font-medium hover:underline text-primary">
            {asset?.name}
          </Link>{" "}
          based on{" "}
          <Link href={`/assets/${originalAsset?.id}`} className="font-medium hover:underline text-primary">
            {originalAsset?.name}
          </Link>
          {royalty && <span className="text-blue-600 font-medium"> ({royalty} royalty)</span>}
        </span>
      )

    case "listing":
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          listed{" "}
          <Link href={`/assets/${asset?.id}`} className="font-medium hover:underline text-primary">
            {asset?.name}
          </Link>
          {price && <span className="text-purple-600 font-medium"> for {price}</span>}
        </span>
      )

    case "like":
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          liked{" "}
          <Link href={`/assets/${asset?.id}`} className="font-medium hover:underline text-primary">
            {asset?.name}
          </Link>
        </span>
      )

    case "mint":
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          minted{" "}
          <Link href={`/assets/${asset?.id}`} className="font-medium hover:underline text-primary">
            {asset?.name}
          </Link>
        </span>
      )

    case "license":
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          licensed{" "}
          <Link href={`/assets/${asset?.id}`} className="font-medium hover:underline text-primary">
            {asset?.name}
          </Link>
          {licenseType && <span className="text-indigo-600 font-medium"> ({licenseType})</span>}
          {price && <span className="text-indigo-600 font-medium"> for {price}</span>}
        </span>
      )

    case "collection_created":
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          created collection{" "}
          <Link href={`/collections/${collection?.id}`} className="font-medium hover:underline text-primary">
            {collection?.name}
          </Link>
        </span>
      )

    case "offer":
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          made an offer on{" "}
          <Link href={`/assets/${asset?.id}`} className="font-medium hover:underline text-primary">
            {asset?.name}
          </Link>
          {price && <span className="text-orange-600 font-medium"> for {price}</span>}
        </span>
      )

    case "follow":
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          started following{" "}
          <Link href={`/users/${followedUser?.id}`} className="font-medium hover:underline text-primary">
            {followedUser?.name}
          </Link>
        </span>
      )

    default:
      return (
        <span>
          <Link href={`/users/${user.id}`} className="font-medium hover:underline">
            {user.name}
          </Link>{" "}
          performed an action
        </span>
      )
  }
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })

  const handleCopyHash = () => {
    if (activity.transactionHash) {
      navigator.clipboard.writeText(activity.transactionHash)
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Activity Icon */}
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getActivityColor(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>

          {/* User Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>{activity.user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                {activity.type.replace("_", " ")}
              </Badge>
              {activity.user.verified && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-sm leading-relaxed mb-2">{getActivityDescription(activity)}</p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{timeAgo}</span>

              {activity.transactionHash && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs hover:text-primary"
                  onClick={handleCopyHash}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {activity.transactionHash.substring(0, 8)}...
                </Button>
              )}

              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs hover:text-primary" asChild>
                <a
                  href={`https://starkscan.co/tx/${activity.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Explorer
                </a>
              </Button>
            </div>
          </div>

          {/* Asset/Collection Thumbnail */}
          {(activity.asset || activity.collection) && (
            <div className="flex-shrink-0">
              <Link href={activity.asset ? `/assets/${activity.asset.id}` : `/collections/${activity.collection?.id}`}>
                <div className="h-12 w-12 rounded-lg overflow-hidden border hover:shadow-md transition-shadow">
                  <img
                    src={activity.asset?.image || activity.collection?.image || "/placeholder.svg?height=48&width=48"}
                    alt={activity.asset?.name || activity.collection?.name || "Asset"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ActivityItem
