"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Gavel, Clock, Info, AlertTriangle, CheckCircle2, Shield, Sparkles, ImageIcon } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"
import { Separator } from "@/src/components/ui/separator"
import { toast } from "@/src/hooks/use-toast"
import { useMockData } from "@/src/lib/hooks/use-mock-data"

const EXPIRY_OPTIONS = [
  { value: "1", label: "1 day" },
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
]

interface MakeOfferComponentProps {
  assetId: string
}

export function MakeOfferComponent({ assetId }: MakeOfferComponentProps) {
  const router = useRouter()
  const { assets, creators } = useMockData()
  const [asset, setAsset] = useState(null)
  const [creator, setCreator] = useState(null)
  const [loading, setLoading] = useState(true)

  const [offerAmount, setOfferAmount] = useState("")
  const [expiryDays, setExpiryDays] = useState("7")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!assets || !creators) return

    const foundAsset = assets.find((a) => a.id === assetId)
    if (foundAsset) {
      setAsset(foundAsset)
      const foundCreator = creators.find((c) => c.id === foundAsset.creatorId)
      setCreator(foundCreator)
    }
    setLoading(false)
  }, [assetId, assets, creators])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (!asset) {
    return (
      <Card className="text-center">
        <CardContent className="p-8">
          <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Asset Not Found</h2>
          <p className="text-muted-foreground mb-4">The asset you're trying to make an offer on doesn't exist.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </CardContent>
      </Card>
    )
  }

  const basePrice = Number.parseFloat(asset?.price?.replace(/[^\d.]/g, "") || "0")
  const offerValue = Number.parseFloat(offerAmount) || 0
  const percentageOfListing = basePrice > 0 ? (offerValue / basePrice) * 100 : 0

  const handleSubmitOffer = async () => {
    if (!offerAmount || offerValue <= 0) {
      toast({
        title: "Invalid Offer",
        description: "Please enter a valid offer amount.",
        variant: "destructive",
      })
      return
    }

    if (offerValue >= basePrice) {
      toast({
        title: "Offer Too High",
        description: "Your offer should be lower than the listing price. Consider buying directly instead.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    // Simulate offer submission
    setTimeout(() => {
      setSubmitting(false)
      setSuccess(true)

      toast({
        title: "Offer Submitted!",
        description: `Your offer of ${offerValue} STRK has been sent to the creator.`,
      })
    }, 2000)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Offer Submitted Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Your offer of <span className="font-semibold">{offerValue} STRK</span> has been sent to{" "}
                <span className="font-semibold">{creator?.name}</span> for review.
              </p>
              <p className="text-sm text-muted-foreground">
                You'll receive a notification when the creator responds to your offer.
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-4 rounded-lg border border-emerald-500/30">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-emerald-400 mr-2" />
                <span className="font-medium text-emerald-400">Zero-Fee Trading</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your offer is recorded on-chain. MediaLane doesn't charge any platform fees for offers or trades.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => router.push(`/assets/${assetId}`)}>
                Back to Asset
              </Button>
              <Button onClick={() => router.push("/portfolio/offers")}>View My Offers</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* Asset Preview */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <ImageIcon className="h-5 w-5" />
              Asset Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={asset.image || "/placeholder.svg"} alt={asset.name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg mb-1">{asset.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {asset.category}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={creator?.avatar || "/placeholder.svg"} alt={creator?.name} />
                  <AvatarFallback className="text-xs">{creator?.name?.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">{creator?.name}</div>
                  <div className="text-xs text-muted-foreground">{creator?.totalAssets || 0} assets</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Listed Price</div>
                  <div className="font-semibold">{asset.price}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Blockchain</div>
                  <div className="font-semibold">Starknet</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Offer Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Gavel className="h-5 w-5" />
              Make Your Offer
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Submit an offer below the listing price. The creator can accept, decline, or counter your offer.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Offer Amount */}
            <div className="space-y-2">
              <Label htmlFor="offer-amount" className="text-sm font-medium">
                Your Offer Amount (STRK)
              </Label>
              <Input
                id="offer-amount"
                type="number"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="text-lg h-12"
                step="0.01"
                min="0"
              />
              {offerValue > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{percentageOfListing.toFixed(1)}% of listing price</span>
                  {percentageOfListing < 50 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low offer
                    </Badge>
                  )}
                  {percentageOfListing >= 80 && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Competitive
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Offer Expires In</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="offer-message" className="text-sm font-medium">
                Message to Creator (Optional)
              </Label>
              <Textarea
                id="offer-message"
                placeholder="Tell the creator why you're interested in this asset..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground">{message.length}/500 characters</div>
            </div>

            <Separator />

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-medium mb-2">How offers work:</p>
                  <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                    <li>• The creator can accept, decline, or counter your offer</li>
                    <li>• Your offer is binding once accepted by the creator</li>
                    <li>• Funds are held in escrow until transaction completion</li>
                    <li>• You can cancel your offer before it's accepted</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button onClick={handleSubmitOffer} disabled={!offerAmount || submitting} className="w-full h-12" size="lg">
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Submitting Offer...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Submit Offer
                </div>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Offer expires in {EXPIRY_OPTIONS.find((o) => o.value === expiryDays)?.label}</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
