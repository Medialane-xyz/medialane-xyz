"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Search, Filter, Wallet, Code, LayoutGrid, List, RefreshCcw, X, Loader2 } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
import { Slider } from "@/src/components/ui/slider"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/src/components/ui/drawer"
import { useRouter } from "next/navigation"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import AssetCard from "@/src/components/asset-card"

type ViewMode = "grid" | "list"

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function parsePrice(input: string | number | undefined): number {
  if (typeof input === "number") return input
  if (!input) return 0
  const n = Number.parseFloat(String(input).replace(/[^\d.]/g, ""))
  return Number.isFinite(n) ? n : 0
}

export default function AssetsPage() {
  const router = useRouter()
  const { assets } = useMockData()

  const maxPrice = useMemo(() => Math.max(0, ...assets.map((a: any) => parsePrice(a.price))), [assets])

  // Core controls
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebouncedValue(searchQuery, 300)
  const [sortBy, setSortBy] = useState("recent")
  const [view, setView] = useState<ViewMode>(() => {
    if (typeof window !== "undefined") return (localStorage.getItem("assets:view") as ViewMode) || "grid"
    return "grid"
  })

  // Committed filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice || 10])
  const [minLikes, setMinLikes] = useState<number>(0)
  const [programmableOnly, setProgrammableOnly] = useState(false)
  const [rwaOnly, setRwaOnly] = useState(false)
  const [selectedCreator, setSelectedCreator] = useState<string>("all")

  // Drawer state + drafts
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [dCategories, setDCategories] = useState<string[]>([])
  const [dPriceRange, setDPriceRange] = useState<[number, number]>([0, maxPrice || 10])
  const [dMinLikes, setDMinLikes] = useState<number>(0)
  const [dProgrammable, setDProgrammable] = useState(false)
  const [dRwa, setDRwa] = useState(false)
  const [dCreator, setDCreator] = useState<string>("all")

  useEffect(() => {
    setPriceRange(([min]) => [min, maxPrice || 10])
    setDPriceRange(([min]) => [min, maxPrice || 10])
  }, [maxPrice])

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("assets:view", view)
  }, [view])

  // Infinite scroll
  const [visibleCount, setVisibleCount] = useState(16)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const batchSize = 16
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>()
    assets.forEach((a: any) => {
      if (a?.category) set.add(String(a.category))
    })
    return Array.from(set).sort()
  }, [assets])

  const uniqueCreators = useMemo(() => {
    const set = new Set<string>()
    assets.forEach((a: any) => {
      if (a?.creator) set.add(String(a.creator))
    })
    return ["all", ...Array.from(set).sort()]
  }, [assets])

  const handleDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open)
    if (open) {
      // Initialize drafts from committed state
      setDCategories(selectedCategories)
      setDPriceRange(priceRange)
      setDMinLikes(minLikes)
      setDProgrammable(programmableOnly)
      setDRwa(rwaOnly)
      setDCreator(selectedCreator)
    }
  }

  const applyDrawerFilters = () => {
    setSelectedCategories(dCategories)
    setPriceRange(dPriceRange)
    setMinLikes(dMinLikes)
    setProgrammableOnly(dProgrammable)
    setRwaOnly(dRwa)
    setSelectedCreator(dCreator)
    setDrawerOpen(false)
  }

  const resetDrawerDrafts = () => {
    setDCategories([])
    setDPriceRange([0, maxPrice || 10])
    setDMinLikes(0)
    setDProgrammable(false)
    setDRwa(false)
    setDCreator("all")
  }

  const filteredAssets = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return assets.filter((asset: any) => {
      // Search
      const matchesSearch =
        !q ||
        String(asset?.name || "")
          .toLowerCase()
          .includes(q) ||
        String(asset?.creator || "")
          .toLowerCase()
          .includes(q) ||
        String(asset?.category || "")
          .toLowerCase()
          .includes(q)
      if (!matchesSearch) return false

      // Categories (multi)
      if (selectedCategories.length > 0) {
        const cat = String(asset?.category || "").toLowerCase()
        const selected = selectedCategories.map((c) => c.toLowerCase())
        if (!selected.includes(cat)) return false
      }

      // Creator
      if (selectedCreator !== "all" && String(asset?.creator || "") !== selectedCreator) return false

      // Price
      const price = parsePrice(asset?.price)
      if (!(price >= priceRange[0] && price <= priceRange[1])) return false

      // Likes
      const likes = Number(asset?.likes || 0)
      if (likes < minLikes) return false

      // Toggles
      if (programmableOnly && !Boolean(asset?.programmable)) return false
      if (rwaOnly && !Boolean((asset as any)?.rwa)) return false

      return true
    })
  }, [assets, debouncedSearch, selectedCategories, selectedCreator, priceRange, minLikes, programmableOnly, rwaOnly])

  const sortedAssets = useMemo(() => {
    const list = [...filteredAssets]
    switch (sortBy) {
      case "price-high":
        return list.sort((a: any, b: any) => parsePrice(b.price) - parsePrice(a.price))
      case "price-low":
        return list.sort((a: any, b: any) => parsePrice(a.price) - parsePrice(b.price))
      case "likes":
        return list.sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0))
      case "recent":
      default:
        return list.sort((a: any, b: any) => Number.parseInt(b.id) - Number.parseInt(a.id))
    }
  }, [filteredAssets, sortBy])

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(16)
  }, [
    debouncedSearch,
    selectedCategories,
    selectedCreator,
    sortBy,
    priceRange,
    minLikes,
    programmableOnly,
    rwaOnly,
    view,
  ])

  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0]
      if (entry.isIntersecting) {
        setIsLoadingMore(true)
        setTimeout(() => {
          setVisibleCount((prev) => Math.min(prev + batchSize, sortedAssets.length))
          setIsLoadingMore(false)
        }, 250)
      }
    },
    [sortedAssets.length],
  )

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(onIntersect, {
      root: null,
      rootMargin: "200px",
      threshold: 0,
    })
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [onIntersect])

  const handleCreateAsset = () => router.push("/create")
  const clearSearch = () => setSearchQuery("")

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    selectedCategories.length > 0 ||
    selectedCreator !== "all" ||
    programmableOnly ||
    rwaOnly ||
    minLikes > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < (maxPrice || 10)

  const filterCount =
    (selectedCategories.length > 0 ? 1 : 0) +
    (selectedCreator !== "all" ? 1 : 0) +
    (programmableOnly ? 1 : 0) +
    (rwaOnly ? 1 : 0) +
    (minLikes > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < (maxPrice || 10) ? 1 : 0)

  const resetAll = () => {
    setSearchQuery("")
    setSortBy("recent")
    setSelectedCategories([])
    setSelectedCreator("all")
    setProgrammableOnly(false)
    setRwaOnly(false)
    setMinLikes(0)
    setPriceRange([0, maxPrice || 10])
    // reset drafts as well
    resetDrawerDrafts()
  }

  const shownAssets = useMemo(() => sortedAssets.slice(0, visibleCount), [sortedAssets, visibleCount])

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">
      {/* Hero */}
      <motion.div
        className="flex flex-col items-center text-center mb-6 md:mb-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-3">
          <Sparkles className="w-4 h-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Discover Unique IP Assets</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-3 gradient-text">Tokenized Intellectual Property</h1>
        <p className="text-base md:text-lg text-zinc-400 max-w-2xl">
          Explore and collect unique digital assets representing intellectual property rights on the Starknet blockchain
          with zero licensing fees
        </p>

        <div className="flex gap-3 mt-5">
          <Button onClick={handleCreateAsset} className="rounded-full">
            <Code className="mr-2 h-4 w-4" />
            Create Asset
          </Button>
          <Button variant="outline" className="rounded-full bg-transparent">
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        className="max-w-7xl mx-auto mb-4 md:mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <div className="flex flex-col gap-3 glass-effect p-3 md:p-4 rounded-xl">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:w-[420px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search assets, creators, categories"
                className="pl-9 bg-transparent border-white/10 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search assets"
              />
              {searchQuery && (
                <button
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4 text-zinc-400" />
                </button>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] bg-transparent border-white/10" aria-label="Sort by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="likes">Most Liked</SelectItem>
                </SelectContent>
              </Select>

              {/* View toggle */}
              <div className="inline-flex rounded-lg border border-white/10 p-0.5">
                <Button
                  variant={view === "grid" ? "default" : "ghost"}
                  size="sm"
                  className={`h-9 w-9 p-0 ${view === "grid" ? "bg-primary/90" : ""}`}
                  onClick={() => setView("grid")}
                  aria-pressed={view === "grid"}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={view === "list" ? "default" : "ghost"}
                  size="sm"
                  className={`h-9 w-9 p-0 ${view === "list" ? "bg-primary/90" : ""}`}
                  onClick={() => setView("list")}
                  aria-pressed={view === "list"}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters Drawer Trigger */}
              <Drawer open={drawerOpen} onOpenChange={handleDrawerOpenChange}>
                <DrawerTrigger asChild>
                  <Button variant="outline" className="bg-transparent" aria-label="Open filters">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {filterCount > 0 && (
                      <Badge className="ml-2 bg-primary/20 text-primary border-none">{filterCount}</Badge>
                    )}
                  </Button>
                </DrawerTrigger>

                <DrawerContent className="max-h-[90vh]">
                  <DrawerHeader>
                    <DrawerTitle>Filter assets</DrawerTitle>
                  </DrawerHeader>

                  <div className="px-4 pb-4 space-y-4 overflow-y-auto">
                    {/* Categories */}
                    <section>
                      <h3 className="text-sm font-medium mb-2">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {uniqueCategories.map((c) => {
                          const active = dCategories.some((x) => x.toLowerCase() === c.toLowerCase())
                          return (
                            <button
                              key={c}
                              onClick={() => {
                                setDCategories((prev) =>
                                  active ? prev.filter((x) => x.toLowerCase() !== c.toLowerCase()) : [...prev, c],
                                )
                              }}
                              className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                                active
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-transparent border-white/15 hover:bg-white/5"
                              }`}
                              aria-pressed={active}
                            >
                              {c}
                            </button>
                          )
                        })}
                      </div>
                    </section>

                    {/* Creator */}
                    <section className="grid gap-2">
                      <Label htmlFor="creator">Creator</Label>
                      <Select value={dCreator} onValueChange={setDCreator}>
                        <SelectTrigger id="creator" className="bg-transparent border-white/10">
                          <SelectValue placeholder="All creators" />
                        </SelectTrigger>
                        <SelectContent>
                          {uniqueCreators.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c === "all" ? "All creators" : c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </section>

                    {/* Price range */}
                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Price range (STRK)</h3>
                        <span className="text-xs text-muted-foreground">
                          {dPriceRange[0].toFixed(2)} - {dPriceRange[1].toFixed(2)}
                        </span>
                      </div>
                      <Slider
                        value={dPriceRange}
                        onValueChange={(val) => setDPriceRange([val[0], val[1]] as [number, number])}
                        min={0}
                        max={Math.max(maxPrice, 10)}
                        step={0.1}
                        aria-label="Price range"
                      />
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="minPrice" className="text-xs w-16">
                            Min
                          </Label>
                          <Input
                            id="minPrice"
                            type="number"
                            step="0.1"
                            value={dPriceRange[0]}
                            onChange={(e) => {
                              const n = Number.parseFloat(e.target.value || "0")
                              const min = Math.max(0, Math.min(n, dPriceRange[1]))
                              setDPriceRange([min, dPriceRange[1]])
                            }}
                            className="bg-transparent border-white/10 h-9"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor="maxPrice" className="text-xs w-16">
                            Max
                          </Label>
                          <Input
                            id="maxPrice"
                            type="number"
                            step="0.1"
                            value={dPriceRange[1]}
                            onChange={(e) => {
                              const n = Number.parseFloat(e.target.value || "0")
                              const max = Math.min(Math.max(n, dPriceRange[0]), Math.max(maxPrice, 10))
                              setDPriceRange([dPriceRange[0], max])
                            }}
                            className="bg-transparent border-white/10 h-9"
                          />
                        </div>
                      </div>
                    </section>

                    {/* Likes */}
                    <section>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium">Minimum likes</h3>
                        <span className="text-xs text-muted-foreground">{dMinLikes}</span>
                      </div>
                      <Slider
                        value={[dMinLikes]}
                        onValueChange={(val) => setDMinLikes(val[0] ?? 0)}
                        min={0}
                        max={Math.max(0, ...assets.map((a: any) => Number(a.likes || 0)))}
                        step={1}
                        aria-label="Minimum likes"
                      />
                    </section>

                    {/* Toggles */}
                    <section className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between rounded-lg border border-white/10 p-3">
                        <div>
                          <Label htmlFor="programmable-only" className="text-sm">
                            Programmable only
                          </Label>
                          <p className="text-xs text-muted-foreground">Assets with smart rules</p>
                        </div>
                        <Switch id="programmable-only" checked={dProgrammable} onCheckedChange={setDProgrammable} />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border border-white/10 p-3">
                        <div>
                          <Label htmlFor="rwa-only" className="text-sm">
                            RWA only
                          </Label>
                          <p className="text-xs text-muted-foreground">Real-world assets</p>
                        </div>
                        <Switch id="rwa-only" checked={dRwa} onCheckedChange={setDRwa} />
                      </div>
                    </section>
                  </div>

                  <DrawerFooter className="px-4 pb-4">
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={applyDrawerFilters}>
                        Apply filters
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent" onClick={resetDrawerDrafts}>
                        Reset
                      </Button>
                      <DrawerClose asChild>
                        <Button variant="ghost" className="flex-0">
                          Close
                        </Button>
                      </DrawerClose>
                    </div>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              {/* Reset All (tooltip on desktop) */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" onClick={resetAll} disabled={!hasActiveFilters}>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset all filters</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Search: {searchQuery}
                  <button aria-label="Remove search filter" onClick={clearSearch}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {selectedCategories.length > 0 &&
                selectedCategories.map((c) => (
                  <Badge key={c} variant="secondary" className="flex items-center gap-2">
                    {c}
                    <button
                      aria-label={`Remove ${c}`}
                      onClick={() => setSelectedCategories((prev) => prev.filter((x) => x !== c))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              {selectedCreator !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Creator: {selectedCreator}
                  <button aria-label="Remove creator filter" onClick={() => setSelectedCreator("all")}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {programmableOnly && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Programmable
                  <button aria-label="Remove programmable filter" onClick={() => setProgrammableOnly(false)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {rwaOnly && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  RWA
                  <button aria-label="Remove RWA filter" onClick={() => setRwaOnly(false)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {minLikes > 0 && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Likes: {minLikes}+
                  <button aria-label="Remove likes filter" onClick={() => setMinLikes(0)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < (maxPrice || 10)) && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Price: {priceRange[0]} - {priceRange[1]} STRK
                  <button aria-label="Remove price filter" onClick={() => setPriceRange([0, maxPrice || 10])}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        {sortedAssets.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-xl font-medium mb-2">No assets found</h3>
            <p className="text-zinc-400 mb-6">Try adjusting your search or filter criteria</p>
            <Button onClick={resetAll}>Reset Filters</Button>
          </div>
        ) : view === "grid" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {shownAssets.map((asset: any) => (
                <div key={asset.id} className="contents">
                  <AssetCard asset={asset} />
                </div>
              ))}
            </div>
            <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-6">
              {isLoadingMore && (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more…
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl border border-white/10 divide-y divide-white/10 overflow-hidden">
              {shownAssets.map((asset: any) => (
                <AssetListItem key={asset.id} asset={asset} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-6">
              {isLoadingMore && (
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading more…
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

function AssetListItem({ asset }: { asset: any }) {
  const router = useRouter()
  const onCreatorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/users/${asset.creatorId || "1"}`)
  }
  const onOpen = () => router.push(`/assets/${asset.id}`)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" ? onOpen() : null)}
      className="flex items-stretch gap-3 p-3 hover:bg-white/5 transition-colors cursor-pointer content-visibility-auto"
    >
      <div className="relative w-24 h-24 rounded-md overflow-hidden border border-white/10 shrink-0 bg-muted/30">
        <img
          src={asset.image || "/placeholder.svg?height=96&width=96&query=asset-preview"}
          alt={asset.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          sizes="96px"
        />
        <div className="absolute bottom-1 left-1">
          <Badge variant="outline" className="bg-black/50 text-white border-white/20 text-[10px]">
            {asset.category}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-medium truncate">{asset.name}</h3>
          <div className="text-sm font-semibold">{asset.price}</div>
        </div>
        <div
          className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors w-fit"
          onClick={onCreatorClick}
        >
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px]">
            {String(asset.creator || "NA").slice(0, 2)}
          </span>
          <span className="truncate">{asset.creator}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          {asset?.programmable && (
            <Badge variant="secondary" className="text-[10px]">
              Programmable
            </Badge>
          )}
          {(asset as any)?.rwa && (
            <Badge variant="secondary" className="text-[10px]">
              RWA
            </Badge>
          )}
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px]">
            Zero Fees
          </Badge>
          <span className="ml-auto text-xs text-muted-foreground">{asset.likes ?? 0} likes</span>
          <Button size="sm" variant="outline" className="h-7 px-3 ml-auto rounded-full bg-transparent">
            Open
          </Button>
        </div>
      </div>
    </div>
  )
}
