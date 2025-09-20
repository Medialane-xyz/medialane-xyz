"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Settings, HelpCircle, LogOut, Plus, Copy, Check, ExternalLink, Shield, ChevronRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Separator } from "@/src/components/ui/separator"
import { useToast } from "@/src/components/ui/use-toast"
import { cn } from "@/src/lib/utils"

// Mock wallet data
const MOCK_WALLETS = [
  {
    id: "argent",
    name: "Argent",
    icon: "🛡️",
    description: "Smart wallet with social recovery",
    isInstalled: true,
    isRecommended: true,
  },
  {
    id: "braavos",
    name: "Braavos",
    icon: "⚔️",
    description: "Hardware wallet support",
    isInstalled: true,
    isRecommended: false,
  },
  {
    id: "okx",
    name: "OKX Wallet",
    icon: "🌟",
    description: "Multi-chain wallet",
    isInstalled: false,
    isRecommended: false,
  },
]

// Mock user data
const MOCK_USER = {
  address: "0x1234...5678",
  fullAddress: "0x1234567890abcdef1234567890abcdef12345678",
  name: "Creator Pro",
  avatar: "/placeholder.svg?height=40&width=40",
  balance: "1,234.56",
  currency: "STRK",
  verified: true,
  memberSince: "2024",
  assetsCreated: 42,
  totalEarnings: "5,678.90",
}

export default function UserAccountPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  // Check for existing connection on mount
  useEffect(() => {
    const savedConnection = localStorage.getItem("wallet_connected")
    if (savedConnection) {
      setIsConnected(true)
      setSelectedWallet(JSON.parse(savedConnection))
    }
  }, [])

  const handleWalletConnect = async (wallet) => {
    setIsConnecting(true)

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    if (!wallet.isInstalled) {
      toast({
        title: "Wallet not installed",
        description: `Please install ${wallet.name} to continue`,
        duration: 3000,
      })
      setIsConnecting(false)
      return
    }

    // Mock successful connection
    setIsConnected(true)
    setSelectedWallet(wallet)
    setIsOpen(false)
    setIsConnecting(false)

    // Save to localStorage
    localStorage.setItem("wallet_connected", JSON.stringify(wallet))

    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${wallet.name}`,
      duration: 3000,
    })
  }

  const handleCreateWallet = () => {
    toast({
      title: "Create New Wallet",
      description: "Redirecting to wallet creation...",
      duration: 2000,
    })
    // In a real app, this would redirect to wallet creation
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setSelectedWallet(null)
    setIsOpen(false)
    localStorage.removeItem("wallet_connected")

    toast({
      title: "Wallet Disconnected",
      description: "You have been logged out",
      duration: 2000,
    })
  }

  const copyAddress = async () => {
    await navigator.clipboard.writeText(MOCK_USER.fullAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
      duration: 2000,
    })
  }

  const handleAccountSettings = () => {
    toast({
      title: "Account Settings",
      description: "Opening account settings...",
      duration: 2000,
    })
    setIsOpen(false)
  }

  const handleSupport = () => {
    toast({
      title: "Support Channel",
      description: "Opening support channel...",
      duration: 2000,
    })
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative rounded-full h-9 w-9 transition-all duration-200",
            isConnected ? "border-2 border-primary/50 bg-primary/10" : "border border-white/20 hover:border-primary/50",
          )}
        >
          {isConnected ? (
            <Avatar className="h-7 w-7">
              <AvatarImage src={MOCK_USER.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {MOCK_USER.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-4 w-4" />
          )}

          {isConnected && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-black" />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0 bg-black/90 backdrop-blur-md border border-white/20" align="end">
        <AnimatePresence mode="wait">
          {!isConnected ? (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6"
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">Connect Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your Starknet wallet to start creating and trading IP assets
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {MOCK_WALLETS.map((wallet) => (
                  <motion.button
                    key={wallet.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleWalletConnect(wallet)}
                    disabled={isConnecting}
                    className={cn(
                      "w-full p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 text-left",
                      !wallet.isInstalled && "opacity-60",
                      isConnecting && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{wallet.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{wallet.name}</span>
                            {wallet.isRecommended && (
                              <Badge variant="secondary" className="text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{wallet.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!wallet.isInstalled && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <Separator className="my-4 bg-white/10" />

              <Button variant="outline" className="w-full" onClick={handleCreateWallet} disabled={isConnecting}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Wallet
              </Button>

              {isConnecting && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                    Connecting wallet...
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="connected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6"
            >
              {/* User Profile Section */}
              <div className="flex items-center gap-3 mb-6">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={MOCK_USER.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {MOCK_USER.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{MOCK_USER.name}</h3>
                    {MOCK_USER.verified && <Shield className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{MOCK_USER.address}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
                      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-semibold">{MOCK_USER.balance}</span>
                    <span className="text-sm text-muted-foreground">{MOCK_USER.currency}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Connected via {selectedWallet?.name}</span>
                  <Badge variant="outline" className="text-xs">
                    Member since {MOCK_USER.memberSince}
                  </Badge>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">{MOCK_USER.assetsCreated}</div>
                  <div className="text-xs text-muted-foreground">Assets Created</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-500">{MOCK_USER.totalEarnings}</div>
                  <div className="text-xs text-muted-foreground">Total Earnings</div>
                </div>
              </div>

              <Separator className="my-4 bg-white/10" />

              {/* Menu Items */}
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" onClick={handleAccountSettings}>
                  <Settings className="h-4 w-4 mr-3" />
                  Account Settings
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Button variant="ghost" className="w-full justify-start" onClick={handleSupport}>
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Support Channel
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>

                <Separator className="my-2 bg-white/10" />

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  onClick={handleDisconnect}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Disconnect Wallet
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  )
}
