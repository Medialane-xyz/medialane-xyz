"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Gavel, Clock, Info, AlertTriangle } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Textarea } from "@/src/components/ui/textarea"
import { toast } from "@/src/hooks/use-toast"

interface OfferModalProps {
  isOpen: boolean
  onClose: () => void
  asset: any
  creator: any
  onOfferSubmitted: (offer: any) => void
}

const EXPIRY_OPTIONS = [
  { value: "1", label: "1 day" },
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
]

export function OfferModal({ isOpen, onClose, asset, creator, onOfferSubmitted }: OfferModalProps) {
  const [offerAmount, setOfferAmount] = useState("")
  const [expiryDays, setExpiryDays] = useState("7")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

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
      const offer = {
        id: Math.random().toString(36).substring(7),
        amount: offerValue,
        currency: "STRK",
        expiryDays: Number.parseInt(expiryDays),
        message,
        timestamp: new Date().toISOString(),
        status: "pending",
      }

      setSubmitting(false)
      onOfferSubmitted(offer)
      onClose()

      toast({
        title: "Offer Submitted!",
        description: `Your offer of ${offerValue} STRK has been sent to the creator.`,
      })

      // Reset form
      setOfferAmount("")
      setMessage("")
      setExpiryDays("7")
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg max-h-[90vh] overflow-auto"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Make an Offer
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Asset Preview */}
              <div className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={asset?.image || "/placeholder.svg"}
                    alt={asset?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1">{asset?.name}</h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={creator?.avatar || "/placeholder.svg"} alt={creator?.name} />
                      <AvatarFallback className="text-xs">{creator?.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{creator?.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{asset?.price}</div>
                  <div className="text-xs text-muted-foreground">Listed price</div>
                </div>
              </div>

              {/* Offer Amount */}
              <div className="space-y-2">
                <Label htmlFor="offer-amount">Your Offer (STRK)</Label>
                <Input
                  id="offer-amount"
                  type="number"
                  placeholder="0.00"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="text-lg"
                />
                {offerValue > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{percentageOfListing.toFixed(1)}% of listing price</span>
                    {percentageOfListing < 50 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low offer
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Expiry */}
              <div className="space-y-2">
                <Label>Offer Expires In</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger>
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
                <Label htmlFor="offer-message">Message to Creator (Optional)</Label>
                <Textarea
                  id="offer-message"
                  placeholder="Tell the creator why you're interested in this asset..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">How offers work:</p>
                    <ul className="text-xs space-y-1 text-blue-700 dark:text-blue-300">
                      <li>• The creator can accept, decline, or counter your offer</li>
                      <li>• Your offer is binding once accepted</li>
                      <li>• Funds are held in escrow until completion</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handleSubmitOffer} disabled={!offerAmount || submitting} className="flex-1">
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4" />
                      Submit Offer
                    </div>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Offer expires in {EXPIRY_OPTIONS.find((o) => o.value === expiryDays)?.label}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
