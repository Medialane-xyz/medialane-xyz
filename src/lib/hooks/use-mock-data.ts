"use client"

import { useState } from "react"
import { mockAssets, mockCollections, mockCreators, mockActivities, mockStats } from "@/src/lib/data/mock-data"

// Mock data for assets
const defaultMockAssets = [
  {
    id: "1",
    name: "Digital Dreamscape",
    creator: "DigitalArtist",
    creatorId: "1",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=DA",
    image: "/placeholder.svg?height=400&width=400&text=Digital+Dreamscape",
    description: "A stunning digital artwork exploring the boundaries of imagination and reality.",
    price: "0.5 ETH",
    category: "Art",
    likes: 42,
    liked: false,
    programmable: true,
    rwa: false,
  },
  {
    id: "2",
    name: "Melodic Memories",
    creator: "SoundWave",
    creatorId: "2",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=SW",
    image: "/placeholder.svg?height=400&width=400&text=Melodic+Memories",
    description: "An original music composition with programmable licensing for commercial use.",
    price: "0.3 ETH",
    category: "Music",
    likes: 28,
    liked: false,
    programmable: true,
    rwa: false,
  },
  {
    id: "3",
    name: "Quantum Algorithm",
    creator: "TechInnovator",
    creatorId: "3",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=TI",
    image: "/placeholder.svg?height=400&width=400&text=Quantum+Algorithm",
    description: "A patented quantum computing algorithm with programmable usage rights.",
    price: "2.0 ETH",
    category: "Patent",
    likes: 15,
    liked: false,
    programmable: true,
    rwa: true,
  },
  {
    id: "4",
    name: "Brand Identity Package",
    creator: "DesignStudio",
    creatorId: "4",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=DS",
    image: "/placeholder.svg?height=400&width=400&text=Brand+Identity",
    description: "Complete brand identity package with logo, guidelines, and assets.",
    price: "1.2 ETH",
    category: "Brand",
    likes: 36,
    liked: false,
    programmable: true,
    rwa: true,
  },
  {
    id: "5",
    name: "Sci-Fi Novel Rights",
    creator: "WordSmith",
    creatorId: "5",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=WS",
    image: "/placeholder.svg?height=400&width=400&text=Sci-Fi+Novel",
    description: "Publishing and adaptation rights for an award-winning science fiction novel.",
    price: "0.8 ETH",
    category: "Literature",
    likes: 24,
    liked: false,
    programmable: true,
    rwa: true,
  },
  {
    id: "6",
    name: "Abstract Emotion",
    creator: "ArtisticSoul",
    creatorId: "6",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=AS",
    image: "/placeholder.svg?height=400&width=400&text=Abstract+Emotion",
    description: "An abstract representation of human emotions through digital art.",
    price: "0.4 ETH",
    category: "Art",
    likes: 31,
    liked: false,
    programmable: true,
    rwa: false,
  },
  {
    id: "7",
    name: "Cinematic Score",
    creator: "FilmComposer",
    creatorId: "7",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=FC",
    image: "/placeholder.svg?height=400&width=400&text=Cinematic+Score",
    description: "Original cinematic score suitable for film, games, and multimedia projects.",
    price: "0.6 ETH",
    category: "Music",
    likes: 19,
    liked: false,
    programmable: true,
    rwa: false,
  },
  {
    id: "8",
    name: "Renewable Energy Patent",
    creator: "GreenTech",
    creatorId: "8",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=GT",
    image: "/placeholder.svg?height=400&width=400&text=Renewable+Energy",
    description: "Innovative renewable energy technology with commercial licensing options.",
    price: "3.0 ETH",
    category: "Patent",
    likes: 47,
    liked: false,
    programmable: true,
    rwa: true,
  },
  {
    id: "9",
    name: "Fashion Logo Collection",
    creator: "StyleDesigner",
    creatorId: "9",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=SD",
    image: "/placeholder.svg?height=400&width=400&text=Fashion+Logo",
    description: "Premium fashion brand logo with complete usage rights and brand guidelines.",
    price: "0.9 ETH",
    category: "Brand",
    likes: 33,
    liked: false,
    programmable: true,
    rwa: true,
  },
  {
    id: "10",
    name: "Fantasy World Map",
    creator: "WorldBuilder",
    creatorId: "10",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=WB",
    image: "/placeholder.svg?height=400&width=400&text=Fantasy+Map",
    description: "Detailed fantasy world map with lore and world-building elements.",
    price: "0.35 ETH",
    category: "Art",
    likes: 29,
    liked: false,
    programmable: true,
    rwa: false,
  },
  {
    id: "11",
    name: "Electronic Dance Track",
    creator: "BeatMaker",
    creatorId: "11",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=BM",
    image: "/placeholder.svg?height=400&width=400&text=EDM+Track",
    description: "High-energy electronic dance music track with commercial licensing options.",
    price: "0.25 ETH",
    category: "Music",
    likes: 38,
    liked: false,
    programmable: true,
    rwa: false,
  },
  {
    id: "12",
    name: "AI Algorithm Framework",
    creator: "DataScientist",
    creatorId: "12",
    creatorAvatar: "/placeholder.svg?height=40&width=40&text=DS",
    image: "/placeholder.svg?height=400&width=400&text=AI+Algorithm",
    description: "Advanced AI algorithm framework for machine learning applications.",
    price: "1.8 ETH",
    category: "Patent",
    likes: 22,
    liked: false,
    programmable: true,
    rwa: true,
  },
]

// Mock data for collections
const defaultMockCollections = [
  {
    id: "1",
    name: "Digital Art Masterpieces",
    creator: "ArtCurator",
    image: "/placeholder.svg?height=100&width=100&text=DAM",
    banner: "/placeholder.svg?height=400&width=800&text=Digital+Art+Collection",
    items: 24,
    verified: true,
    description: "A curated collection of digital art masterpieces from renowned artists around the world.",
    volume: "45.8 ETH",
  },
  {
    id: "2",
    name: "Music Licensing Bundle",
    creator: "SoundStudio",
    image: "/placeholder.svg?height=100&width=100&text=MLB",
    banner: "/placeholder.svg?height=400&width=800&text=Music+Licensing",
    items: 18,
    verified: true,
    description:
      "A comprehensive collection of music tracks available for commercial licensing with programmable terms.",
    volume: "32.5 ETH",
  },
  {
    id: "3",
    name: "Tech Patent Portfolio",
    creator: "InnovationLabs",
    image: "/placeholder.svg?height=100&width=100&text=TPP",
    banner: "/placeholder.svg?height=400&width=800&text=Tech+Patents",
    items: 12,
    verified: false,
    description:
      "A collection of technology patents and intellectual property rights available for licensing and development.",
    volume: "78.2 ETH",
  },
  {
    id: "4",
    name: "Brand Assets Package",
    creator: "BrandingAgency",
    image: "/placeholder.svg?height=100&width=100&text=BAP",
    banner: "/placeholder.svg?height=400&width=800&text=Brand+Assets",
    items: 30,
    verified: true,
    description: "Complete brand identity packages including logos, guidelines, and marketing materials.",
    volume: "56.7 ETH",
  },
  {
    id: "5",
    name: "Literary Works Anthology",
    creator: "PublishingHouse",
    image: "/placeholder.svg?height=100&width=100&text=LWA",
    banner: "/placeholder.svg?height=400&width=800&text=Literary+Works",
    items: 15,
    verified: false,
    description: "A collection of literary works with publishing rights and adaptation options.",
    volume: "28.9 ETH",
  },
  {
    id: "6",
    name: "Film & Video Rights",
    creator: "CinematicArts",
    image: "/placeholder.svg?height=100&width=100&text=FVR",
    banner: "/placeholder.svg?height=400&width=800&text=Film+Rights",
    items: 20,
    verified: true,
    description: "A portfolio of film and video content with distribution and adaptation rights.",
    volume: "62.3 ETH",
  },
]

// Mock data for activities
const defaultMockActivities = [
  {
    id: "1",
    type: "purchase",
    user: "CryptoCollector",
    userId: "101",
    userAvatar: "/placeholder.svg?height=40&width=40&text=CC",
    asset: "Digital Dreamscape",
    assetId: "1",
    price: "0.5 ETH",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
  },
  {
    id: "2",
    type: "listing",
    user: "ArtisticSoul",
    userId: "6",
    userAvatar: "/placeholder.svg?height=40&width=40&text=AS",
    asset: "Abstract Emotion",
    assetId: "6",
    price: "0.4 ETH",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
  },
  {
    id: "3",
    type: "transfer",
    user: "TechInnovator",
    userId: "3",
    userAvatar: "/placeholder.svg?height=40&width=40&text=TI",
    asset: "Quantum Algorithm",
    assetId: "3",
    recipient: "ScienceFund",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
  },
  {
    id: "4",
    type: "like",
    user: "MusicFan",
    userId: "102",
    userAvatar: "/placeholder.svg?height=40&width=40&text=MF",
    asset: "Melodic Memories",
    assetId: "2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
  },
  {
    id: "5",
    type: "purchase",
    user: "BrandManager",
    userId: "103",
    userAvatar: "/placeholder.svg?height=40&width=40&text=BM",
    asset: "Brand Identity Package",
    assetId: "4",
    price: "1.2 ETH",
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
  },
  {
    id: "6",
    type: "listing",
    user: "WordSmith",
    userId: "5",
    userAvatar: "/placeholder.svg?height=40&width=40&text=WS",
    asset: "Sci-Fi Novel Rights",
    assetId: "5",
    price: "0.8 ETH",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
  },
  {
    id: "7",
    type: "transfer",
    user: "FilmProducer",
    userId: "104",
    userAvatar: "/placeholder.svg?height=40&width=40&text=FP",
    asset: "Cinematic Score",
    assetId: "7",
    recipient: "MovieStudio",
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
  },
  {
    id: "8",
    type: "like",
    user: "PatentAttorney",
    userId: "105",
    userAvatar: "/placeholder.svg?height=40&width=40&text=PA",
    asset: "Renewable Energy Patent",
    assetId: "8",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
  },
]

// Mock platform stats
const defaultMockStats = {
  assets: 1248,
  users: 876,
  volume: 12450,
  transactions: 3567,
}

export function useMockData() {
  const [assets, setAssets] = useState(mockAssets || defaultMockAssets)
  const [collections, setCollections] = useState(mockCollections || defaultMockCollections)
  const [creators, setCreators] = useState(mockCreators || [])
  const [activities, setActivities] = useState(mockActivities || defaultMockActivities)
  const [stats, setStats] = useState(mockStats || defaultMockStats)

  const toggleLike = (assetId: string) => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) => {
        if (asset?.id === assetId) {
          return {
            ...asset,
            liked: !asset.liked,
            likes: asset.liked ? asset.likes - 1 : asset.likes + 1,
          }
        }
        return asset
      }),
    )
  }

  return {
    assets,
    collections,
    creators,
    activities,
    stats,
    toggleLike,
  }
}
