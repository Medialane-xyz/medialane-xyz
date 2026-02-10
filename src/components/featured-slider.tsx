"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Play, ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import Image from "next/image"
import { Badge } from "@/src/components/ui/badge"
import { useRouter } from "next/navigation"
import { type FeaturedItem } from "@/src/lib/featured-data"

interface FeaturedSliderProps {
    items: FeaturedItem[]
    autoPlay?: boolean
    interval?: number
}

export function FeaturedSlider({ items, autoPlay = true, interval = 5000 }: FeaturedSliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0)
    const router = useRouter()

    useEffect(() => {
        if (!autoPlay || items.length <= 1) return

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % items.length)
        }, interval)

        return () => clearInterval(timer)
    }, [autoPlay, interval, items.length])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % items.length)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + items.length) % items.length)
    }

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    if (!items.length) return null

    return (
        <div className="relative min-h-[95vh] h-[95vh] overflow-hidden">
            {/* Background Images */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 transition-transform duration-[10000ms] ease-out scale-105">
                        <Image
                            src={items[currentSlide]?.image || "/placeholder.svg"}
                            alt={items[currentSlide]?.title || "Featured Image"}
                            fill
                            priority
                            className="object-cover"
                            sizes="100vw"
                        />
                    </div>
                    {/* Gradients to ensure text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="max-w-3xl">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-white"
                            >
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    <Badge className="mb-4 md:mb-6 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-sm backdrop-blur-md">
                                        {items[currentSlide]?.tag}
                                    </Badge>
                                </motion.div>

                                <motion.h1
                                    className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                >
                                    {items[currentSlide]?.title}
                                </motion.h1>

                                <motion.p
                                    className="text-lg md:text-xl lg:text-2xl text-zinc-300 mb-8 md:mb-10 leading-relaxed max-w-2xl"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                >
                                    {items[currentSlide]?.description}
                                </motion.p>

                                <motion.div
                                    className="flex flex-col sm:flex-row gap-4"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 1 }}
                                >
                                    <Button
                                        size="lg"
                                        onClick={() => router.push(items[currentSlide].link)}
                                        className="gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-8 py-6 text-lg border-0 shadow-lg shadow-cyan-900/20"
                                    >
                                        <Play className="h-5 w-5 fill-current" />
                                        {items[currentSlide]?.ctaText}
                                    </Button>

                                    {/* Optional Secondary Button (could be added to data model if needed) */}
                                    {/* 
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="bg-white/5 border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
                                    >
                                        More Info
                                    </Button> 
                                    */}
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Navigation Controls - Desktop */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden md:block">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
            </div>

            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden md:block">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/20 text-white backdrop-blur-sm border border-white/10"
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-3 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/5">
                    {items.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all duration-500 ${index === currentSlide ? "bg-cyan-500 w-8" : "bg-white/30 w-2 hover:bg-white/50"
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile Navigation - Bottom */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 md:hidden w-full flex justify-between px-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    className="h-10 w-10 rounded-full bg-black/30 text-white backdrop-blur-md border border-white/10"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    className="h-10 w-10 rounded-full bg-black/30 text-white backdrop-blur-md border border-white/10"
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}
