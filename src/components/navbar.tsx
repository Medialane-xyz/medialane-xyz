"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  User,
  Menu,
  X,
  Home,
  Grid3X3,
  Layers,
  Users,
  Activity,
  Plus,
  Wallet,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Palette,
  Music,
  FileText,
  Briefcase,
  Film,
  Zap,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { ThemeToggle } from "@/src/components/theme-toggle"
import NotificationsPopover from "@/src/components/notifications-popover"
import { useMobile } from "@/src/hooks/use-mobile"

const categories = [
  { name: "Digital Art", slug: "digital-art", icon: Palette, color: "text-purple-500" },
  { name: "Music", slug: "music", icon: Music, color: "text-blue-500" },
  { name: "Patents", slug: "patents", icon: Zap, color: "text-yellow-500" },
  { name: "Literature", slug: "literature", icon: FileText, color: "text-green-500" },
  { name: "Branding", slug: "branding", icon: Briefcase, color: "text-orange-500" },
  { name: "Film & Video", slug: "film-video", icon: Film, color: "text-red-500" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useMobile()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery("")
    }
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Assets", href: "/assets", icon: Grid3X3 },
    { name: "Collections", href: "/collections", icon: Layers },
    { name: "Creators", href: "/creators", icon: Users },
    { name: "New Releases", href: "/new-releases", icon: Sparkles },
    { name: "Activity", href: "/activity", icon: Activity },
  ]

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/95 backdrop-blur-md border-b shadow-sm" : "bg-background/80 backdrop-blur-sm"
          }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                MediaLane
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive(item.href) ? "default" : "ghost"}
                        size="sm"
                        className="flex items-center space-x-2"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Button>
                    </Link>
                  )
                })}

                {/* Categories Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                      <Grid3X3 className="w-4 h-4" />
                      <span>Categories</span>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Browse Categories</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/categories" className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        All Categories
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {categories.map((category) => {
                      const Icon = category.icon
                      return (
                        <DropdownMenuItem key={category.slug} asChild>
                          <Link href={`/categories/${category.slug}`} className="flex items-center">
                            <Icon className={`w-4 h-4 mr-2 ${category.color}`} />
                            {category.name}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search assets, creators, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 rounded-full bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
                />
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              {/* Create Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="hidden md:flex items-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/creator">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Creator Launchpad
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/create">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Asset
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/create/collection">
                      <Layers className="w-4 h-4 mr-2" />
                      Create Collection
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <NotificationsPopover />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/portfolio">
                      <User className="w-4 h-4 mr-2" />
                      Portfolio
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portfolio/dashboard">
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/portfolio/licensings">
                      <FileText className="w-4 h-4 mr-2" />
                      Licensings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              {isMobile && (
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
                  {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col h-full pt-16">
              {/* Mobile Search */}
              <div className="px-4 py-4 border-b">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </form>
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-4 py-4 space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                        <Button
                          variant={isActive(item.href) ? "default" : "ghost"}
                          size="lg"
                          className="w-full justify-start"
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {item.name}
                        </Button>
                      </Link>
                    )
                  })}

                  <div className="py-2">
                    <div className="text-sm font-medium text-muted-foreground px-3 py-2">Categories</div>
                    <Link href="/categories" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="lg" className="w-full justify-start">
                        <TrendingUp className="w-5 h-5 mr-3" />
                        All Categories
                      </Button>
                    </Link>
                    {categories.map((category) => {
                      const Icon = category.icon
                      return (
                        <Link
                          key={category.slug}
                          href={`/categories/${category.slug}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <Button variant="ghost" size="lg" className="w-full justify-start">
                            <Icon className={`w-5 h-5 mr-3 ${category.color}`} />
                            {category.name}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>

                  <div className="py-2 border-t">
                    <div className="text-sm font-medium text-muted-foreground px-3 py-2">Create</div>
                    <Link href="/creator" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="lg" className="w-full justify-start">
                        <Sparkles className="w-5 h-5 mr-3" />
                        Creator Launchpad
                      </Button>
                    </Link>
                    <Link href="/create" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="lg" className="w-full justify-start">
                        <Plus className="w-5 h-5 mr-3" />
                        Create Asset
                      </Button>
                    </Link>
                    <Link href="/create/collection" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="lg" className="w-full justify-start">
                        <Layers className="w-5 h-5 mr-3" />
                        Create Collection
                      </Button>
                    </Link>
                  </div>

                  <div className="py-2 border-t">
                    <div className="text-sm font-medium text-muted-foreground px-3 py-2">Account</div>
                    <Link href="/portfolio" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="lg" className="w-full justify-start">
                        <User className="w-5 h-5 mr-3" />
                        Portfolio
                      </Button>
                    </Link>
                    <Link href="/settings" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" size="lg" className="w-full justify-start">
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t">
          <div className="grid grid-cols-6 gap-1 p-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className="flex flex-col items-center space-y-1 h-auto py-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{item.name === "New Releases" ? "New" : item.name}</span>
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
      {isMobile && <div className="h-16" />}
    </>
  )
}
