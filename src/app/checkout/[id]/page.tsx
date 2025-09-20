"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Star,
  Copy,
  ExternalLink,
  ChevronUp,
  Info,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Separator } from "@/src/components/ui/separator"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Progress } from "@/src/components/ui/progress"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/src/components/ui/drawer"
import { toast } from "@/src/hooks/use-toast"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import { useMobile } from "@/src/hooks/use-mobile"

const PAYMENT_METHODS = [
  {
    id: "starknet",
    name: "Starknet Wallet",
    shortName: "Wallet",
    description: "Pay with STRK, ETH, or USDC",
    icon: <Wallet className="h-5 w-5" />,
    fees: "0%",
    recommended: true,
    speed: "Instant",
    security: "High",
  },
  {
    id: "credit-card",
    name: "Credit Card",
    shortName: "Card",
    description: "Visa, Mastercard, American Express",
    icon: <CreditCard className="h-5 w-5" />,
    fees: "2.9%",
    recommended: false,
    speed: "Fast",
    security: "High",
  },
]

const CURRENCIES = [
  { id: "strk", name: "STRK", symbol: "STRK", rate: 1, icon: "🔷" },
  { id: "eth", name: "Ethereum", symbol: "ETH", rate: 0.0012, icon: "⟠" },
  { id: "usdc", name: "USD Coin", symbol: "USDC", rate: 2.45, icon: "💵" },
]

const QUICK_AMOUNTS = [
  { label: "Current Price", multiplier: 1 },
  { label: "+5%", multiplier: 1.05 },
  { label: "+10%", multiplier: 1.1 },
  { label: "+15%", multiplier: 1.15 },
]

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const isMobile = useMobile()
  const { assets, creators } = useMockData()
  const [asset, setAsset] = useState(null)
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState("starknet")
  const [selectedCurrency, setSelectedCurrency] = useState("strk")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)
  const [transactionHash, setTransactionHash] = useState("")
  const [showOrderSummary, setShowOrderSummary] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [customAmount, setCustomAmount] = useState("")
  const [useCustomAmount, setUseCustomAmount] = useState(false)

  useEffect(() => {
    if (!assets || !creators) return

    const assetId = params.id as string
    const foundAsset = assets.find((a) => a.id === assetId)

    if (foundAsset) {
      setAsset(foundAsset)
      const foundCreator = creators.find((c) => c.id === foundAsset.creatorId)
      setCreator(foundCreator)
    }

    setLoading(false)
  }, [params.id, assets, creators])

  const selectedPaymentMethod = PAYMENT_METHODS.find((method) => method.id === paymentMethod)
  const selectedCurrencyData = CURRENCIES.find((currency) => currency.id === selectedCurrency)

  // Calculate prices
  const basePrice = Number.parseFloat(asset?.price?.replace(/[^\d.]/g, "") || "0")
  const finalPrice = useCustomAmount && customAmount ? Number.parseFloat(customAmount) : basePrice
  const platformFee = 0 // Zero fees on MediaLane
  const paymentFee = paymentMethod === "credit-card" ? finalPrice * 0.029 : 0
  const convertedPrice = finalPrice * (selectedCurrencyData?.rate || 1)
  const totalPrice = convertedPrice + paymentFee

  const processingSteps = [
    "Validating payment method...",
    "Processing transaction...",
    "Confirming on blockchain...",
    "Transferring ownership...",
  ]

  const handlePurchase = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    setProcessingStep(0)

    // Simulate processing steps
    const stepDuration = 750
    for (let i = 0; i < processingSteps.length; i++) {
      setTimeout(() => setProcessingStep(i), i * stepDuration)
    }

    // Complete transaction
    setTimeout(() => {
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
      setTransactionHash(mockTxHash)
      setPurchaseComplete(true)
      setProcessing(false)

      toast({
        title: "Purchase Successful!",
        description: "Your asset has been transferred to your wallet.",
      })
    }, processingSteps.length * stepDuration)
  }

  const handleQuickAmount = (multiplier: number) => {
    const newAmount = (basePrice * multiplier).toFixed(2)
    setCustomAmount(newAmount)
    setUseCustomAmount(multiplier !== 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Asset Not Found</h2>
            <p className="text-muted-foreground mb-4">The asset you're trying to purchase doesn't exist.</p>
            <Button onClick={() => router.push("/assets")}>Browse Assets</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (purchaseComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="text-center border-0 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Purchase Successful!
              </h1>
              <p className="text-muted-foreground mb-8 text-lg">
                Congratulations! You now own <strong className="text-foreground">{asset.name}</strong>
              </p>

              <div className="bg-muted/30 rounded-xl p-6 mb-8 border">
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="font-medium">Transaction Details</span>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmed</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Transaction Hash:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background px-3 py-1 rounded-lg text-xs font-mono border">
                      {transactionHash}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(transactionHash)
                        toast({ title: "Copied!", description: "Transaction hash copied to clipboard" })
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button onClick={() => router.push(`/assets/${asset.id}`)} className="h-12">
                  View Asset
                </Button>
                <Button variant="outline" onClick={() => router.push("/portfolio")} className="h-12">
                  <Wallet className="h-4 w-4 mr-2" />
                  Portfolio
                </Button>
                <Button variant="outline" asChild className="h-12 bg-transparent">
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Explorer
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="font-semibold">Checkout</h1>
            <div className="w-16" /> {/* Spacer */}
          </div>
        </div>

        <div className="p-4 pb-32 space-y-4">
          {/* Asset Preview - Mobile */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={asset.image || "/placeholder.svg"}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{asset.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={creator?.avatar || "/placeholder.svg"} alt={creator?.name} />
                      <AvatarFallback className="text-xs">{creator?.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground truncate">{creator?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {asset.category}
                    </Badge>
                    <div className="text-right">
                      <div className="text-xl font-bold">{asset.price}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method - Mobile */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.id} className="relative">
                    <div className="flex items-center space-x-3 p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex items-center gap-3 flex-1">
                        {method.icon}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Label htmlFor={method.id} className="font-medium cursor-pointer">
                              {method.shortName}
                            </Label>
                            {method.recommended && (
                              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                                Recommended
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {method.fees === "0%" ? (
                              <span className="text-green-600">Free</span>
                            ) : (
                              <span className="text-muted-foreground">{method.fees}</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{method.speed}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Currency Selection - Mobile */}
          {paymentMethod === "starknet" && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Currency</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedCurrency} onValueChange={setSelectedCurrency} className="space-y-3">
                  {CURRENCIES.map((currency) => (
                    <div key={currency.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value={currency.id} id={currency.id} />
                      <Label htmlFor={currency.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{currency.icon}</span>
                            <span className="font-medium">{currency.symbol}</span>
                          </div>
                          <span className="font-mono text-sm">
                            {(finalPrice * currency.rate).toFixed(4)} {currency.symbol}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Quick Amount Selection - Mobile */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Purchase Amount</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {QUICK_AMOUNTS.map((amount) => (
                  <Button
                    key={amount.label}
                    variant={
                      (amount.multiplier === 1 && !useCustomAmount) ||
                      (useCustomAmount && Number.parseFloat(customAmount) === basePrice * amount.multiplier)
                        ? "default"
                        : "outline"
                    }
                    onClick={() => handleQuickAmount(amount.multiplier)}
                    className="h-12"
                  >
                    {amount.label}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom Amount (USD)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder={basePrice.toString()}
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setUseCustomAmount(e.target.value !== "" && Number.parseFloat(e.target.value) !== basePrice)
                  }}
                  className="h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Terms - Mobile */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="mobile-terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                  className="mt-1"
                />
                <Label htmlFor="mobile-terms" className="text-sm cursor-pointer leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t p-4 space-y-3">
          {/* Order Summary Toggle */}
          <Drawer open={showOrderSummary} onOpenChange={setShowOrderSummary}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full h-12 justify-between bg-transparent">
                <span>Order Summary</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono">
                    {totalPrice.toFixed(4)} {selectedCurrencyData?.symbol}
                  </span>
                  <ChevronUp className="h-4 w-4" />
                </div>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Order Summary</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Asset Price</span>
                    <span>${finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                        FREE
                      </Badge>
                      <span className="line-through text-muted-foreground text-sm">2.5%</span>
                    </div>
                  </div>
                  {paymentFee > 0 && (
                    <div className="flex justify-between">
                      <span>Payment Fee</span>
                      <span>${paymentFee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>
                      {totalPrice.toFixed(4)} {selectedCurrencyData?.symbol}
                    </span>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={!agreedToTerms || processing}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {processingSteps[processingStep]}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Complete Purchase
              </div>
            )}
          </Button>

          {processing && (
            <div className="space-y-2">
              <Progress value={(processingStep + 1) * 25} className="h-2" />
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Secured by Starknet</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="min-h-screen pt-20 pb-24 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-4 hover:bg-muted/50">
            <ArrowLeft className="h-4 w-4" />
            Back to Asset
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Complete Your Purchase
              </h1>
              <p className="text-muted-foreground text-lg mt-2">Secure checkout powered by Starknet</p>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>SSL Secured</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Summary - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 order-2 lg:order-1"
          >
            <Card className="sticky top-24 border-0 shadow-2xl bg-gradient-to-br from-card to-card/80 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Asset Preview */}
                <div className="flex gap-4 p-4 bg-muted/30 rounded-xl border">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={asset.image || "/placeholder.svg"}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2">{asset.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={creator?.avatar || "/placeholder.svg"} alt={creator?.name} />
                        <AvatarFallback className="text-xs">{creator?.name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{creator?.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {asset.category}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span>Asset Price</span>
                    <span className="font-semibold">${finalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                        FREE
                      </Badge>
                      <span className="line-through text-muted-foreground text-sm">2.5%</span>
                    </div>
                  </div>
                  {paymentFee > 0 && (
                    <div className="flex justify-between">
                      <span>Payment Processing</span>
                      <span>${paymentFee.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-2xl">
                    <span>Total</span>
                    <span className="text-primary">
                      {totalPrice.toFixed(4)} {selectedCurrencyData?.symbol}
                    </span>
                  </div>
                </div>

                {/* Zero Fee Highlight */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900 dark:text-green-100">Zero Platform Fees</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Save on every transaction with MediaLane's zero-fee marketplace. You save{" "}
                    <strong>${(finalPrice * 0.025).toFixed(2)}</strong> compared to other platforms.
                  </p>
                </div>

                {/* Security Features */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Blockchain verified ownership</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>Instant transfer on completion</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Form - Desktop */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 order-1 lg:order-2 space-y-6"
          >
            {/* Payment Method Selection */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="text-xl">Payment Method</CardTitle>
                <p className="text-muted-foreground">Choose your preferred payment option</p>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="relative">
                      <div className="flex items-center space-x-4 p-6 border rounded-xl hover:bg-muted/30 transition-all duration-200 hover:shadow-md">
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-3 bg-primary/10 rounded-lg">{method.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Label htmlFor={method.id} className="font-semibold text-lg cursor-pointer">
                                {method.name}
                              </Label>
                              {method.recommended && (
                                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Recommended</Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-2">{method.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{method.speed}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                <span>{method.security} Security</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold mb-1">
                              {method.fees === "0%" ? (
                                <span className="text-green-600">No Fees</span>
                              ) : (
                                <span>{method.fees} fee</span>
                              )}
                            </div>
                            {method.fees !== "0%" && (
                              <div className="text-sm text-muted-foreground">+${(finalPrice * 0.029).toFixed(2)}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Currency Selection */}
            {paymentMethod === "starknet" && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="text-xl">Select Currency</CardTitle>
                  <p className="text-muted-foreground">Choose your preferred cryptocurrency</p>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedCurrency} onValueChange={setSelectedCurrency} className="space-y-4">
                    {CURRENCIES.map((currency) => (
                      <div
                        key={currency.id}
                        className="flex items-center space-x-4 p-4 border rounded-xl hover:bg-muted/30 transition-colors"
                      >
                        <RadioGroupItem value={currency.id} id={currency.id} />
                        <Label htmlFor={currency.id} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{currency.icon}</span>
                              <div>
                                <span className="font-semibold text-lg">{currency.name}</span>
                                <span className="text-muted-foreground ml-2">({currency.symbol})</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-lg font-semibold">
                                {(finalPrice * currency.rate).toFixed(4)} {currency.symbol}
                              </div>
                              <div className="text-sm text-muted-foreground">≈ ${finalPrice.toFixed(2)} USD</div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Quick Amount Selection */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
              <CardHeader>
                <CardTitle className="text-xl">Purchase Amount</CardTitle>
                <p className="text-muted-foreground">Set your offer amount or use quick options</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {QUICK_AMOUNTS.map((amount) => (
                    <Button
                      key={amount.label}
                      variant={
                        (amount.multiplier === 1 && !useCustomAmount) ||
                        (useCustomAmount && Number.parseFloat(customAmount) === basePrice * amount.multiplier)
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleQuickAmount(amount.multiplier)}
                      className="h-12 font-semibold"
                    >
                      {amount.label}
                    </Button>
                  ))}
                </div>
                <div className="space-y-3">
                  <Label htmlFor="desktop-custom-amount" className="text-base font-medium">
                    Custom Amount (USD)
                  </Label>
                  <Input
                    id="desktop-custom-amount"
                    type="number"
                    placeholder={basePrice.toString()}
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setUseCustomAmount(e.target.value !== "" && Number.parseFloat(e.target.value) !== basePrice)
                    }}
                    className="h-12 text-lg"
                  />
                  {useCustomAmount && customAmount && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>
                        {Number.parseFloat(customAmount) > basePrice
                          ? `${(((Number.parseFloat(customAmount) - basePrice) / basePrice) * 100).toFixed(1)}% above listing price`
                          : `${(((basePrice - Number.parseFloat(customAmount)) / basePrice) * 100).toFixed(1)}% below listing price`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Credit Card Form */}
            {paymentMethod === "credit-card" && (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
                <CardHeader>
                  <CardTitle className="text-xl">Card Information</CardTitle>
                  <p className="text-muted-foreground">Enter your payment details securely</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="card-number" className="text-base font-medium">
                        Card Number
                      </Label>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" className="h-12 text-lg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry" className="text-base font-medium">
                          Expiry Date
                        </Label>
                        <Input id="expiry" placeholder="MM/YY" className="h-12 text-lg" />
                      </div>
                      <div>
                        <Label htmlFor="cvc" className="text-base font-medium">
                          CVC
                        </Label>
                        <Input id="cvc" placeholder="123" className="h-12 text-lg" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="name" className="text-base font-medium">
                        Cardholder Name
                      </Label>
                      <Input id="name" placeholder="John Doe" className="h-12 text-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Terms and Conditions */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Checkbox
                    id="desktop-terms"
                    checked={agreedToTerms}
                    onCheckedChange={setAgreedToTerms}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="desktop-terms" className="text-base cursor-pointer leading-relaxed">
                      I agree to the{" "}
                      <a href="#" className="text-primary hover:underline font-medium">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-primary hover:underline font-medium">
                        Privacy Policy
                      </a>
                      . I understand that this purchase is final and non-refundable.
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Purchase Button */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
              <CardContent className="p-6">
                <Button
                  onClick={handlePurchase}
                  disabled={!agreedToTerms || processing}
                  className="w-full h-16 text-xl font-semibold"
                  size="lg"
                >
                  {processing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full border-3 border-white border-t-transparent animate-spin" />
                      <div className="text-left">
                        <div>{processingSteps[processingStep]}</div>
                        <div className="text-sm opacity-80">
                          Step {processingStep + 1} of {processingSteps.length}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Zap className="h-6 w-6" />
                      Complete Purchase - {totalPrice.toFixed(4)} {selectedCurrencyData?.symbol}
                    </div>
                  )}
                </Button>

                {processing && (
                  <div className="mt-6 space-y-3">
                    <Progress value={(processingStep + 1) * 25} className="h-3" />
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Transaction secured by Starknet blockchain technology</span>
                    </div>
                  </div>
                )}

                {!processing && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Secured by Starknet blockchain technology</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
