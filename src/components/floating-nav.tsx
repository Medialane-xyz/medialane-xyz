"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Home,
  Layers,
  Users,
  Menu,
  X,
  Plus,
  Compass,
  Sparkles,
  User,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useMobile } from "@/src/hooks/use-mobile"
import { cn } from "@/src/lib/utils"
import NotificationsMenu from "@/src/components/notifications-menu"
import { useToast } from "@/src/components/ui/use-toast"

const FloatingNav = () => {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMobile()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (isMobileMenuOpen) setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    if (isSearchOpen) setIsSearchOpen(false)
  }

  const closeAll = () => {
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchQuery("")
    }
  }

  const navigateTo = (path) => {
    router.push(path)
    closeAll()
  }

  // Main navigation items (simplified)
  const mainNavItems = [
    {
      icon: <Home className="w-4 h-4" />,
      label: "Home",
      href: "/",
      isActive: pathname === "/",
    },
    {
      icon: <Compass className="w-4 h-4" />,
      label: "Explore",
      href: "/explore",
      isActive: pathname.startsWith("/explore") || pathname.startsWith("/assets"),
    },
    {
      icon: <Layers className="w-4 h-4" />,
      label: "Collections",
      href: "/collections",
      isActive: pathname.startsWith("/collections"),
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: "Creators",
      href: "/creators",
      isActive: pathname.startsWith("/creators") || pathname.startsWith("/users"),
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      label: "New",
      href: "/new-releases",
      isActive: pathname.startsWith("/new-releases"),
    },
  ]

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "py-2" : "py-3",
          "px-4 md:px-6",
        )}
      >
        <div
          className={cn(
            "w-full mx-auto rounded-full glass-effect border border-white/10 transition-all duration-300",
            scrolled ? "shadow-lg bg-black/80" : "bg-black/60",
          )}
        >
          <div className="relative flex items-center justify-between h-12 md:h-14">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center px-3 md:px-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo("/")}>
                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-r from-purple-600 to-primary"></div>
                {!isMobile && <span className="font-bold text-lg text-white">MediaLane</span>}
              </div>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex px-2 space-x-1">
                {mainNavItems.map((item, index) => (
                  <Button
                    key={index}
                    variant={item.isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "rounded-full text-white hover:bg-white/20",
                      item.isActive ? "bg-primary/30 text-white" : "",
                    )}
                    onClick={() => navigateTo(item.href)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>
                ))}
              </nav>
            )}

            {/* Right section */}
            <div className="flex items-center pr-3 md:pr-4 space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white hover:bg-white/20 h-8 w-8 md:h-9 md:w-9"
                onClick={toggleSearch}
              >
                <Search className="w-4 h-4" />
              </Button>

              <NotificationsMenu />

              {/* Create Button - Desktop Only */}
              {!isMobile && (
                <Button
                  size="sm"
                  className="rounded-full bg-primary hover:bg-primary/90"
                  onClick={() => navigateTo("/create")}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create
                </Button>
              )}

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-9 md:w-9">
                    <Avatar className="w-6 h-6 md:w-7 md:h-7">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback className="text-xs">U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-black/90 backdrop-blur-md border border-white/20 text-white"
                >
                  <DropdownMenuItem onClick={() => navigateTo("/portfolio")}>
                    <User className="w-4 h-4 mr-2" />
                    Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigateTo("/settings")}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/20" />
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-white hover:bg-white/20 h-8 w-8"
                  onClick={toggleMobileMenu}
                >
                  {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Expanded Menu */}
          <AnimatePresence>
            {isMobile && isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-white/10"
              >
                <div className="px-4 py-3 space-y-1">
                  {mainNavItems.map((item, index) => (
                    <Button
                      key={index}
                      variant={item.isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start rounded-lg text-white hover:bg-white/20",
                        item.isActive ? "bg-primary/30" : "",
                      )}
                      onClick={() => navigateTo(item.href)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>
                  ))}

                  <div className="pt-2">
                    <Button
                      className="w-full justify-start bg-primary hover:bg-primary/90"
                      onClick={() => navigateTo("/create")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Asset
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-white/10"
              >
                <div className="px-4 py-3">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search assets, creators, collections..."
                      className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-gray-400"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white"
                      onClick={toggleSearch}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Bottom Navigation 
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-40 glass-effect border-t border-white/10 bg-black/80 backdrop-blur-lg">
          <div className="flex items-center justify-between px-1">
            {mainNavItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                className={cn(
                  "py-3 flex-1 rounded-none flex flex-col items-center text-xs",
                  item.isActive ? "text-primary" : "text-zinc-400",
                )}
                onClick={() => navigateTo(item.href)}
              >
                {item.icon}
                <span className="mt-1">{item.label === "New" ? "New" : item.label}</span>
              </Button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="py-3 rounded-none flex-1 flex flex-col items-center text-primary relative"
              onClick={() => navigateTo("/create")}
            >
              <div className="absolute -top-3 rounded-full bg-primary p-2 shadow-lg">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <span className="text-xs mt-4">Create</span>
            </Button>
          </div>
        </div>
      )}*/}

      {/* Background overlay */}
      <AnimatePresence>
        {(isMobileMenuOpen || isSearchOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
            onClick={closeAll}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .glass-effect {
          backdrop-filter: blur(12px);
          background-color: rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </>
  )
}

export default FloatingNav
