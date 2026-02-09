"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
    Layers,
    Sparkles,
    Zap,
    Repeat,
    Trophy,
    ArrowRight,
    Plus,
    Search,
    Store,
    Wallet,
    Coins,
    Palette,
    Music,
    Video,
    Rocket,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import PageTransition from "@/src/components/page-transition"
import { useMobile } from "@/src/hooks/use-mobile"

// Creator Actions Data
const creativeActions = [
    {
        id: "collection-drop",
        title: "Collection Drop",
        description: "Schedule a public launch of digital assets with allowlists, reveal mechanics, and minting phases.",
        icon: Rocket,
        href: "/create/drop-collection", // Intended to be the Drop flow
        featured: true,
        status: "available",
        gradient: "from-primary to-purple-600",
        iconColor: "text-white",
    },
    {
        id: "mint-collection",
        title: "Mint Collection",
        description: "Deploy a standard NFT collection contract for immediate minting of art, music, or 1/1s.",
        icon: Layers,
        href: "/create/collection?mode=standard",
        featured: false,
        status: "available",
        gradient: "from-blue-500/10 to-cyan-500/10",
        iconColor: "text-blue-400",
    },
    {
        id: "create-asset",
        title: "Create Asset",
        description: "Mint a unique 1/1 digital asset directly to your wallet or an existing collection.",
        icon: Sparkles,
        href: "/create/asset",
        featured: false,
        status: "available",
        gradient: "from-green-500/10 to-emerald-500/10",
        iconColor: "text-green-400",
    },
    {
        id: "remix-asset",
        title: "Remix Asset",
        description: "Create a derivative work from an existing programmable asset.",
        icon: Repeat,
        href: "/remix", // Assuming /remix exists or will exist
        featured: false,
        status: "available", // Or "beta" if preferred
        gradient: "from-pink-500/10 to-rose-500/10",
        iconColor: "text-pink-400",
    },
    {
        id: "create-listing",
        title: "Create Listing",
        description: "List your assets for sale on the marketplace.",
        icon: Store,
        href: "/portfolio?tab=assets", // Directing to portfolio to list assets
        featured: false,
        status: "available",
        gradient: "from-orange-500/10 to-amber-500/10",
        iconColor: "text-orange-400",
    },
    {
        id: "claim-collection",
        title: "Claim Collection",
        description: "Verify and claim ownership of an existing collection on Starknet.",
        icon: Trophy,
        href: "#", // Placeholder
        featured: false,
        status: "coming-soon",
        gradient: "from-purple-500/10 to-indigo-500/10",
        iconColor: "text-purple-400",
    },
]

export default function CreatorLaunchpadPage() {
    const [isLoaded, setIsLoaded] = useState(false)
    const router = useRouter()
    const isMobile = useMobile()

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 150)
        return () => clearTimeout(timer)
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    }

    if (!isLoaded) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
                <div className="flex flex-col items-center space-y-3">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <span className="text-sm font-medium">Loading Studio</span>
                </div>
            </div>
        )
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-background text-foreground pb-20">
                <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3"
                            >
                                <Zap className="w-3 h-3" />
                                Creator Studio
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-3xl md:text-4xl font-bold tracking-tight"
                            >
                                Create & Manage
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-muted-foreground mt-2 max-w-xl"
                            >
                                Launch collections, mint assets, and manage your intellectual property on the Integrity Web.
                            </motion.p>
                        </div>

                        {/* Quick Actions (Optional - kept simple for now) */}
                        {/* <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div> */}
                    </div>

                    {/* Main Grid */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {/* Featured Item: Collection Drop */}
                        {creativeActions.filter(a => a.featured).map((action) => (
                            <motion.div key={action.id} variants={itemVariants} className="md:col-span-2 lg:col-span-2">
                                <Card
                                    className="relative overflow-hidden border-primary/20 bg-card/40 backdrop-blur-md hover:border-primary/40 transition-all duration-300 cursor-pointer h-full group"
                                    onClick={() => router.push(action.href)}
                                >
                                    {/* Featured Background Glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-10 group-hover:opacity-15 transition-opacity`} />

                                    <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${action.gradient} shadow-lg shadow-primary/20`}>
                                            <action.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-bold">{action.title}</h3>
                                                <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">Feature</Badge>
                                            </div>
                                            <p className="text-muted-foreground text-lg leading-relaxed">{action.description}</p>
                                        </div>
                                        <Button className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground group-hover:px-6 transition-all duration-300">
                                            Launch Drop <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        {/* Standard Items */}
                        {creativeActions.filter(a => !a.featured).map((action) => {
                            const isComingSoon = action.status === "coming-soon";
                            return (
                                <motion.div key={action.id} variants={itemVariants}>
                                    <Card
                                        className={`relative overflow-hidden premium-glass border-white/5 hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 h-full group ${isComingSoon ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                                        onClick={() => !isComingSoon && router.push(action.href)}
                                    >
                                        <CardHeader>
                                            <div className="flex justify-between items-start mb-2">
                                                <div className={`p-2.5 rounded-xl bg-secondary/50 ${action.iconColor}`}>
                                                    <action.icon className="w-6 h-6" />
                                                </div>
                                                {isComingSoon && <Badge variant="outline" className="text-xs">Soon</Badge>}
                                            </div>
                                            <CardTitle className="group-hover:text-primary transition-colors">{action.title}</CardTitle>
                                            <CardDescription className="line-clamp-2">{action.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </motion.div>

                </div>
            </div>
        </PageTransition>
    )
}
