"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Upload,
  FileText,
  Settings,
  CreditCard,
  Shuffle,
  DollarSign,
  Users,
  Shield,
  Zap,
  ArrowRight,
  AlertCircle,
  ImageIcon,
  Music,
  Video,
  FileCode,
  Palette,
  Sparkles,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Switch } from "@/src/components/ui/switch"
import { Slider } from "@/src/components/ui/slider"
import { Badge } from "@/src/components/ui/badge"
import { Separator } from "@/src/components/ui/separator"
import { useToast } from "@/src/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface RemixCreatorProps {
  originalAsset: any
}

export default function RemixCreator({ originalAsset }: RemixCreatorProps) {
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: `${originalAsset?.name || "Original Asset"} - Remix`,
    description: `A creative remix of "${originalAsset?.name || "Original Asset"}" bringing new artistic vision while honoring the original work. This derivative piece explores new possibilities while maintaining the essence of the source material.`,
    category: originalAsset?.category || "Art",
    tags: originalAsset?.tags?.join(", ") || "remix, derivative, creative",
    licenseType: "Standard",
    duration: "Perpetual",
    territory: "Worldwide",
    commercialUse: true,
    derivatives: true,
    attribution: true,
    royaltyPercentage: 15,
    price: "2.5",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      // Auto-detect category based on file type
      const fileType = selectedFile.type
      let detectedCategory = formData.category

      if (fileType.startsWith("image/")) detectedCategory = "Art"
      else if (fileType.startsWith("audio/")) detectedCategory = "Music"
      else if (fileType.startsWith("video/")) detectedCategory = "Film"
      else if (fileType.includes("text") || fileType.includes("document")) detectedCategory = "Literature"

      setFormData((prev) => ({ ...prev, category: detectedCategory }))

      toast({
        title: "File uploaded successfully",
        description: `${selectedFile.name} is ready for remix creation`,
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!file) newErrors.file = "Please upload your remix file"
    if (!formData.name.trim()) newErrors.name = "Asset name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.price || Number.parseFloat(formData.price) <= 0) newErrors.price = "Valid price is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Remix created successfully!",
        description: "Your remix is now live on the marketplace",
      })

      // Redirect to the new asset page
      router.push(`/assets/remix-${Date.now()}`)
    } catch (error) {
      toast({
        title: "Error creating remix",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Art":
        return <Palette className="h-4 w-4" />
      case "Music":
        return <Music className="h-4 w-4" />
      case "Film":
        return <Video className="h-4 w-4" />
      case "Literature":
        return <FileText className="h-4 w-4" />
      case "Code":
        return <FileCode className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  const licensePrice = Number.parseFloat(originalAsset?.price || "2.5")
  const remixPrice = Number.parseFloat(formData.price || "0")
  const royaltyAmount = (remixPrice * formData.royaltyPercentage) / 100
  const netEarnings = remixPrice - royaltyAmount

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* File Upload Section */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-500" />
            Upload Your Remix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
            />

            {file ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-purple-500">
                  {getCategoryIcon(formData.category)}
                  <span className="font-medium">{file.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {formData.category}
                </p>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Change File
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Shuffle className="h-12 w-12 text-purple-500 mx-auto" />
                <h3 className="text-lg font-medium">Upload your remix file</h3>
                <p className="text-muted-foreground">Drag and drop or click to select your creative remix</p>
                <p className="text-xs text-muted-foreground">Supports images, audio, video, and documents</p>
              </div>
            )}
          </div>
          {errors.file && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.file}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Remix Details */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Remix Details & Licensing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter remix name"
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Art">🎨 Digital Art</SelectItem>
                  <SelectItem value="Music">🎵 Music</SelectItem>
                  <SelectItem value="Film">🎬 Film & Video</SelectItem>
                  <SelectItem value="Literature">📚 Literature</SelectItem>
                  <SelectItem value="Code">💻 Code & AI</SelectItem>
                  <SelectItem value="Patent">⚖️ Patents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your remix and creative vision"
              rows={4}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              placeholder="remix, creative, derivative, art"
            />
          </div>

          <Separator />

          {/* Licensing Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Licensing Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>License Type</Label>
                <Select
                  value={formData.licenseType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, licenseType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard License</SelectItem>
                    <SelectItem value="Extended">Extended License</SelectItem>
                    <SelectItem value="Exclusive">Exclusive License</SelectItem>
                    <SelectItem value="Royalty-Free">Royalty-Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Perpetual">Perpetual</SelectItem>
                    <SelectItem value="1 Year">1 Year</SelectItem>
                    <SelectItem value="5 Years">5 Years</SelectItem>
                    <SelectItem value="10 Years">10 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Territory</Label>
                <Select
                  value={formData.territory}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, territory: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Worldwide">🌍 Worldwide</SelectItem>
                    <SelectItem value="North America">🇺🇸 North America</SelectItem>
                    <SelectItem value="Europe">🇪🇺 Europe</SelectItem>
                    <SelectItem value="Asia Pacific">🌏 Asia Pacific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Usage Rights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="commercial">Commercial Use</Label>
                  <p className="text-xs text-muted-foreground">Allow commercial usage</p>
                </div>
                <Switch
                  id="commercial"
                  checked={formData.commercialUse}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, commercialUse: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="derivatives">Derivatives</Label>
                  <p className="text-xs text-muted-foreground">Allow further remixes</p>
                </div>
                <Switch
                  id="derivatives"
                  checked={formData.derivatives}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, derivatives: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label htmlFor="attribution">Attribution</Label>
                  <p className="text-xs text-muted-foreground">Require attribution</p>
                </div>
                <Switch
                  id="attribution"
                  checked={formData.attribution}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, attribution: checked }))}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Royalty Settings */}
      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-500" />
            Royalty Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Royalty to Original Creator</Label>
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                {formData.royaltyPercentage}%
              </Badge>
            </div>

            <Slider
              value={[formData.royaltyPercentage]}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, royaltyPercentage: value[0] }))}
              min={5}
              max={50}
              step={1}
              className="w-full"
            />

            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5% (Minimum)</span>
              <span>50% (Maximum)</span>
            </div>
          </div>

          {/* Royalty Distribution Preview */}
          <div className="p-4 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-lg border border-green-500/20">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Royalty Distribution Preview
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Original Creator ({originalAsset?.creator})</span>
                <span className="font-medium text-green-500">{formData.royaltyPercentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Your Earnings</span>
                <span className="font-medium text-blue-500">{100 - formData.royaltyPercentage}%</span>
              </div>
            </div>

            {/* Visual representation */}
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden flex">
              <div
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${formData.royaltyPercentage}%` }}
              />
              <div
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${100 - formData.royaltyPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combined Payment Section */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-500" />
            License Payment & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* License Fee */}
          <div className="p-4 bg-gradient-to-r from-orange-500/5 to-yellow-500/5 rounded-lg border border-orange-500/20">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-500" />
                Remix License Fee
              </h4>
              <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">Required</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Payment to {originalAsset?.creator} for remix rights
              </span>
              <span className="text-xl font-bold text-orange-500">{licensePrice} STRK</span>
            </div>
          </div>

          {/* Remix Pricing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="price">Set Your Remix Price</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="price"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  className={`w-24 ${errors.price ? "border-red-500" : ""}`}
                />
                <span className="text-sm text-muted-foreground">STRK</span>
              </div>
            </div>
            {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
          </div>

          {/* Payment Summary */}
          <div className="p-4 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg border border-blue-500/20">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              Payment Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>License Fee (Immediate)</span>
                <span className="font-medium text-red-500">-{licensePrice} STRK</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Your Remix Price</span>
                <span className="font-medium text-green-500">+{remixPrice} STRK</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Royalty per Sale ({formData.royaltyPercentage}%)</span>
                <span className="font-medium text-orange-500">-{royaltyAmount.toFixed(2)} STRK</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Net Earnings per Sale</span>
                <span className="text-green-500">+{netEarnings.toFixed(2)} STRK</span>
              </div>
            </div>
          </div>

          {/* Future Earnings Preview */}
          <div className="p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg border border-purple-500/20">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Potential Earnings
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-green-500">+{(netEarnings * 5).toFixed(0)} STRK</p>
                <p className="text-xs text-muted-foreground">5 sales</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-500">+{(netEarnings * 20).toFixed(0)} STRK</p>
                <p className="text-xs text-muted-foreground">20 sales</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-500">+{(netEarnings * 100).toFixed(0)} STRK</p>
                <p className="text-xs text-muted-foreground">100 sales</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isSubmitting || !file}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating Remix...
            </>
          ) : (
            <>
              <Shuffle className="mr-2 h-5 w-5" />
              Create Remix & Pay License Fee
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </div>

      {/* Smart Contract Info */}
      <div className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-primary" />
          <span>Powered by Smart Contracts on Starknet</span>
        </div>
        <p>Automatic royalty distribution • Zero platform fees • Transparent transactions</p>
      </div>
    </div>
  )
}
