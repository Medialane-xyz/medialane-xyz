"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"
import { OnChainCollection } from "@/src/lib/hooks/use-all-collections"
import { Badge } from "@/src/components/ui/badge"

interface HeroSliderV2Props {
    collections: OnChainCollection[]
}

export function HeroSliderV2({ collections }: HeroSliderV2Props) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovering, setIsHovering] = useState(false)

    // Auto-play
    useEffect(() => {
        if (collections.length <= 1 || isHovering) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % collections.length)
        }, 5000)

        return () => clearInterval(timer)
    }, [collections.length, isHovering])

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % collections.length)
    }

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + collections.length) % collections.length)
    }

    if (collections.length === 0) {
        return (
            <div className="relative w-full h-[60vh] min-h-[500px] bg-zinc-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
            </div>
        )
    }

    const currentCollection = collections[currentIndex]

    // Helper to fallback to image if banner is missing
    // Since we fixed the hook to return undefined, this works.
    const bgImage = currentCollection.banner || currentCollection.image

    // Deterministic gradient fallback
    const getGradient = (id: string) => {
        const gradients = [
            "from-pink-500 via-purple-900 to-black",
            "from-cyan-500 via-blue-900 to-black",
            "from-green-500 via-emerald-900 to-black",
            "from-orange-500 via-red-900 to-black",
        ]
        return gradients[Number(id) % gradients.length || 0]
    }

    return (
        <div
            className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-black text-white"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentCollection.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    {/* Background Image / Gradient */}
                    {bgImage ? (
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${bgImage})` }}
                        />
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(currentCollection.id)} opacity-50`} />
                    )}

                    {/* Overlays */}
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 top-0 flex items-end pb-32 sm:pb-40">
                        <div className="container mx-auto px-4 md:px-8">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="max-w-3xl"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    {currentCollection.verified && (
                                        <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 backdrop-blur-md">
                                            Verified
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5 backdrop-blur-md">
                                        IP Collection
                                    </Badge>
                                </div>

                                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 drop-shadow-2xl">
                                    {currentCollection.name}
                                </h1>

                                {currentCollection.description && (
                                    <p className="text-lg md:text-xl text-zinc-200 line-clamp-2 md:line-clamp-3 mb-8 max-w-2xl drop-shadow-lg">
                                        {currentCollection.description}
                                    </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4">
                                    <Link href={`/collections/${currentCollection.ipNft || currentCollection.id}`}>
                                        <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-zinc-200 transition-transform active:scale-95">
                                            Explore Collection
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </Link>
                                    <Link href={`/create/asset`}>
                                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/30 bg-black/30 backdrop-blur-md hover:bg-white/10 text-white transition-transform active:scale-95">
                                            Create Asset
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white border border-white/10 z-10 transition-all hover:scale-110"
                onClick={prevSlide}
            >
                <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white border border-white/10 z-10 transition-all hover:scale-110"
                onClick={nextSlide}
            >
                <ChevronRight className="w-6 h-6" />
            </Button>

            {/* Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {collections.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === currentIndex
                                ? "w-8 bg-white"
                                : "bg-white/40 hover:bg-white/60"
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
