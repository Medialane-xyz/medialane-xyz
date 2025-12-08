"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CreditCard, Wallet, Shield, Zap } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Separator } from "@/src/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Label } from "@/src/components/ui/label"
import { Checkbox } from "@/src/components/ui/checkbox"
import { toast } from "@/src/hooks/use-toast"

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  asset: any
  creator: any
  onPurchaseComplete: (transactionHash: string) => void
}

const PAYMENT_METHODS = [
  {
    id: "starknet",
    name: "Starknet Wallet",
    description: "Pay with STRK, ETH, or USDC",
    icon: <Wallet className="h-4 w-4" />,
    fees: "0%",
    recommended: true,
  },
  {
    id: "credit-card",
    name: "Credit Card",
    description: "Quick checkout with card",
    icon: <CreditCard className="h-4 w-4" />,
    fees: "2.9%",
    recommended: false,
  },
]

export function PurchaseModal({ isOpen, onClose, asset, creator, onPurchaseComplete }: PurchaseModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("starknet")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [processing, setProcessing] = useState(false)

  const basePrice = Number.parseFloat(asset?.price?.replace(/[^\d.]/g, "") || "0")
  const platformFee = 0 // Zero fees
  const paymentFee = paymentMethod === "credit-card" ? basePrice * 0.029 : 0
  const totalPrice = basePrice + platformFee + paymentFee

  const handlePurchase = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)

    // Simulate transaction
    setTimeout(() => {
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`
      setProcessing(false)
      onPurchaseComplete(mockTxHash)
      onClose()
      toast({
        title: "Purchase Successful!",
        description: "Asset has been transferred to your wallet.",
      })
    }, 2000)
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
          className="relative w-full max-w-2xl max-h-[90vh] overflow-auto"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl">Complete Purchase</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Asset Preview */}
              <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={asset?.image || "/placeholder.svg"}
                    alt={asset?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{asset?.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={creator?.avatar || "/placeholder.svg"} alt={creator?.name} />
                      <AvatarFallback className="text-xs">{creator?.name?.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{creator?.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {asset?.category}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{asset?.price}</div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="text-base font-medium mb-3 block">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {PAYMENT_METHODS.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex items-center gap-2 flex-1">
                        {method.icon}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={method.id} className="font-medium cursor-pointer">
                              {method.name}
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
                          <div className="text-sm">
                            {method.fees === "0%" ? (
                              <span className="text-green-600 font-medium">No Fees</span>
                            ) : (
                              <span className="text-muted-foreground">{method.fees} fee</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Asset Price</span>
                  <span>{asset?.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Platform Fee</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                      FREE
                    </Badge>
                    <span className="line-through text-muted-foreground">2.5%</span>
                  </div>
                </div>
                {paymentFee > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Payment Processing</span>
                    <span>${paymentFee.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Zero Fee Highlight */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">Zero Platform Fees</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Save money with MediaLane's Low-fee marketplace
                </p>
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="modal-terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                  className="mt-1"
                />
                <Label htmlFor="modal-terms" className="text-sm cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:underline">
                    Terms of Service
                  </a>{" "}
                  and understand this purchase is final.
                </Label>
              </div>

              {/* Purchase Button */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button onClick={handlePurchase} disabled={!agreedToTerms || processing} className="flex-1">
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Purchase Now
                    </div>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Secured by Starknet blockchain</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
