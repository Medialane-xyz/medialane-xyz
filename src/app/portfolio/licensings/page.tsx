"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileCheck, Search, Filter, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import PageTransition from "@/src/components/page-transition"

// Mock licensing data
const licensings = [
  {
    id: "1",
    assetName: "Digital Masterpiece #1",
    assetImage: "/placeholder.svg?height=100&width=100",
    licensor: "CryptoArtist",
    licensorAvatar: "/placeholder.svg?height=36&width=36",
    licensee: "You",
    startDate: "Jan 15, 2023",
    endDate: "Jan 15, 2024",
    price: "1.2 STRK",
    status: "active",
    type: "commercial",
    rights: ["Display", "Modify", "Distribute"],
  },
  {
    id: "2",
    assetName: "Music Rights Token",
    assetImage: "/placeholder.svg?height=100&width=100",
    licensor: "You",
    licensee: "SoundWave",
    licenseeAvatar: "/placeholder.svg?height=36&width=36",
    startDate: "Mar 3, 2023",
    endDate: "Mar 3, 2024",
    price: "2.5 STRK",
    status: "active",
    type: "commercial",
    rights: ["Play", "Distribute", "Include in Productions"],
  },
  {
    id: "3",
    assetName: "Patent #45892",
    assetImage: "/placeholder.svg?height=100&width=100",
    licensor: "InnovatorX",
    licensorAvatar: "/placeholder.svg?height=36&width=36",
    licensee: "You",
    startDate: "Apr 20, 2023",
    endDate: "Apr 20, 2025",
    price: "5.0 STRK",
    status: "pending",
    type: "exclusive",
    rights: ["Implement", "Manufacture", "Sell Products"],
  },
  {
    id: "4",
    assetName: "Novel Rights",
    assetImage: "/placeholder.svg?height=100&width=100",
    licensor: "You",
    licensee: "PublishingCo",
    licenseeAvatar: "/placeholder.svg?height=36&width=36",
    startDate: "Feb 10, 2023",
    endDate: "Feb 10, 2024",
    price: "3.7 STRK",
    status: "expired",
    type: "non-exclusive",
    rights: ["Publish", "Translate", "Distribute"],
  },
]

export default function LicensingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  // Filter licensings based on search, status, and type
  const filterLicensings = (list, direction) => {
    return list.filter((license) => {
      const matchesSearch =
        license.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        license.licensor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        license.licensee.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || license.status === statusFilter
      const matchesType = typeFilter === "all" || license.type === typeFilter
      const matchesDirection =
        direction === "all" ||
        (direction === "incoming" && license.licensee === "You") ||
        (direction === "outgoing" && license.licensor === "You")

      return matchesSearch && matchesStatus && matchesType && matchesDirection
    })
  }

  const incomingLicenses = filterLicensings(licensings, "incoming")
  const outgoingLicenses = filterLicensings(licensings, "outgoing")

  // Helper function to render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" /> Active
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-red-500/20 text-red-500 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" /> Expired
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/30">
            <AlertCircle className="h-3 w-3 mr-1" /> {status}
          </Badge>
        )
    }
  }

  // Render license card
  const renderLicenseCard = (license) => (
    <Card key={license.id} className="glass-effect border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={license.assetImage || "/placeholder.svg"}
              alt={license.assetName}
              className="h-10 w-10 rounded-md object-cover mr-3"
            />
            <div>
              <CardTitle className="text-base">{license.assetName}</CardTitle>
              <CardDescription>
                {license.licensor === "You" ? (
                  <span>
                    Licensed to <span className="font-medium">{license.licensee}</span>
                  </span>
                ) : (
                  <span>
                    Licensed from <span className="font-medium">{license.licensor}</span>
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          {renderStatusBadge(license.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-zinc-400">License Type</p>
            <p className="capitalize">{license.type}</p>
          </div>
          <div>
            <p className="text-zinc-400">Price</p>
            <p>{license.price}</p>
          </div>
          <div>
            <p className="text-zinc-400">Start Date</p>
            <p>{license.startDate}</p>
          </div>
          <div>
            <p className="text-zinc-400">End Date</p>
            <p>{license.endDate}</p>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-zinc-400 text-sm">Rights</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {license.rights.map((right, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {right}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-end">
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">
        <motion.div
          className="flex flex-col items-center text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <FileCheck className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium">IP Licensing</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 gradient-text">My Licensings</h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl">
            Manage your incoming and outgoing IP licenses on the Starknet blockchain
          </p>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto mb-6 md:mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-effect p-4 rounded-xl">
            <div className="relative w-full md:w-auto flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search licenses..."
                className="pl-10 bg-transparent border-white/10 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-transparent border-white/10">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px] bg-transparent border-white/10">
                  <SelectValue placeholder="License Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="exclusive">Exclusive</SelectItem>
                  <SelectItem value="non-exclusive">Non-Exclusive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="incoming" className="w-full">
            <TabsList className="mb-6 glass-effect">
              <TabsTrigger value="incoming">Incoming Licenses</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing Licenses</TabsTrigger>
            </TabsList>

            <TabsContent value="incoming">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {incomingLicenses.length > 0 ? (
                  incomingLicenses.map(renderLicenseCard)
                ) : (
                  <div className="col-span-full text-center py-20">
                    <h3 className="text-xl font-medium mb-2">No incoming licenses found</h3>
                    <p className="text-zinc-400 mb-6">Try adjusting your search or filter criteria</p>
                    <Button
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                        setTypeFilter("all")
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="outgoing">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {outgoingLicenses.length > 0 ? (
                  outgoingLicenses.map(renderLicenseCard)
                ) : (
                  <div className="col-span-full text-center py-20">
                    <h3 className="text-xl font-medium mb-2">No outgoing licenses found</h3>
                    <p className="text-zinc-400 mb-6">Try adjusting your search or filter criteria</p>
                    <Button
                      onClick={() => {
                        setSearchQuery("")
                        setStatusFilter("all")
                        setTypeFilter("all")
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageTransition>
  )
}
