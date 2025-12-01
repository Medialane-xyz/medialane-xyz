"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  FileText,
  ImageIcon,
  Music,
  Video,
  File,
  X,
  Sparkles,
  Zap,
  Shield,
  Coins,
  Globe,
  Settings,
  ChevronDown,
  ChevronUp,
  Code2,
  Palette,
  Camera,
  FileCode,
  Briefcase,
  ArrowLeft,
  Eye,
  Check,
  Plus,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Slider } from "@/src/components/ui/slider"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import { useToast } from "@/src/components/ui/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/src/components/ui/collapsible"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/src/components/ui/sheet"
import { useMobile } from "@/src/hooks/use-mobile"
import PageTransition from "@/src/components/page-transition"
import { CollectionSelector } from "@/src/components/collection-selector"

export default function CreateAssetPage() {
  const [assetFile, setAssetFile] = useState<File | null>(null)
  const [assetPreview, setAssetPreview] = useState<string | null>(null)
  const [assetName, setAssetName] = useState("")
  const [assetDescription, setAssetDescription] = useState("")
  const [assetCategory, setAssetCategory] = useState("")
  const [assetPrice, setAssetPrice] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)

  // Advanced settings with sensible defaults
  const [royaltyPercentage, setRoyaltyPercentage] = useState([5])
  const [allowDerivatives, setAllowDerivatives] = useState(true)
  const [requireAttribution, setRequireAttribution] = useState(true)
  const [commercialUse, setCommercialUse] = useState(true)
  const [licenseType, setLicenseType] = useState("standard")
  const [listingType, setListingType] = useState("fixed")

  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMobile()

  const assetCategories = [
    { value: "art", label: "Digital Art", icon: <Palette className="h-4 w-4" /> },
    { value: "music", label: "Music", icon: <Music className="h-4 w-4" /> },
    { value: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
    { value: "photography", label: "Photography", icon: <Camera className="h-4 w-4" /> },
    { value: "literature", label: "Literature", icon: <FileText className="h-4 w-4" /> },
    { value: "code", label: "Source Code", icon: <FileCode className="h-4 w-4" /> },
    { value: "patent", label: "Patent", icon: <Shield className="h-4 w-4" /> },
    { value: "trademark", label: "Trademark", icon: <Briefcase className="h-4 w-4" /> },
    { value: "design", label: "Design", icon: <Sparkles className="h-4 w-4" /> },
    { value: "other", label: "Other", icon: <File className="h-4 w-4" /> },
  ]

  const detectFileType = (file: File) => {
    if (file.type.startsWith("image/")) return "art"
    if (file.type.startsWith("audio/")) return "music"
    if (file.type.startsWith("video/")) return "video"
    if (file.type.includes("pdf") || file.type.includes("document")) return "literature"
    if (
      file.type.includes("text") ||
      file.name.includes(".code") ||
      file.name.includes(".js") ||
      file.name.includes(".py")
    )
      return "code"
    return "other"
  }

  const handleFileChange = useCallback(
    (file: File) => {
      setAssetFile(file)

      // Auto-detect category
      const detectedType = detectFileType(file)
      setAssetCategory(detectedType)

      // Auto-generate name if empty
      if (!assetName) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
        setAssetName(nameWithoutExt)
      }

      // Create preview URL
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const previewUrl = URL.createObjectURL(file)
        setAssetPreview(previewUrl)
      }
    },
    [assetName],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        handleFileChange(file)
      }
    },
    [handleFileChange],
  )

  const isFormValid = () => {
    return assetFile && assetName.length >= 3 && assetDescription.length >= 10 && assetCategory
  }

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: "Form Incomplete",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Asset Created Successfully! 🎉",
      description: "Your programmable IP asset has been created and deployed to Starknet",
    })

    setIsSubmitting(false)
    router.push("/assets")
  }

  const PreviewContent = () => (
    <div className="space-y-4">
      {/* NFT Preview */}
      <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10">
        {assetPreview ? (
          <img src={assetPreview || "/placeholder.svg"} alt="Asset preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-12 w-12 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">Upload file to preview</p>
            </div>
          </div>
        )}
      </div>

      {/* Asset Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-lg">{assetName || "Untitled Asset"}</h3>
          <div className="flex items-center gap-2 mt-1">
            {assetCategory && (
              <Badge variant="outline" className="text-xs">
                {assetCategories.find((cat) => cat.value === assetCategory)?.label}
              </Badge>
            )}
            <Badge className="text-xs bg-primary/20 text-primary border-primary/20">Programmable IP</Badge>
          </div>
        </div>

        <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
          {assetDescription || "Add a description to see it here..."}
        </p>

        {assetPrice && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
            <span className="font-medium text-sm">Price</span>
            <span className="font-bold text-lg text-primary">{assetPrice} ETH</span>
          </div>
        )}

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">Royalty:</span>
            <span className="font-medium">{royaltyPercentage[0]}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Commercial Use:</span>
            <span className={`font-medium ${commercialUse ? "text-green-400" : "text-red-400"}`}>
              {commercialUse ? "Allowed" : "Restricted"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">License:</span>
            <span className="font-medium capitalize">{licenseType.replace("-", " ")}</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
        <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Zero-Fee Benefits
        </h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span>Zero gas fees on Starknet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span>Smart contract protection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span>Automatic royalty distribution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            <span>Global licensing marketplace</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <PageTransition>
      <div className="min-h-screen bg-black">
        {/* Mobile Header */}
        {isMobile && (
          <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center justify-between px-4 py-3">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Create Asset</h1>
              <Sheet open={showPreview} onOpenChange={setShowPreview}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Eye className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2 text-left">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Live Preview
                    </SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto h-full pb-6">
                    <PreviewContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="text-center pt-20 md:pt-24 pb-8 px-4">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full mb-6">
              <Sparkles className="w-6 h-6 mr-2 text-primary" />
              <span className="text-sm font-medium">Create Programmable IP</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
              Create Your NFT Asset
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Transform your intellectual property into programmable NFTs with zero gas fees on Starknet
            </p>
          </div>
        )}

        <div className={`${isMobile ? "px-3 pb-20" : "px-4 md:px-8 pb-24 md:pb-32"}`}>
          <div className={`max-w-6xl mx-auto ${isMobile ? "" : "grid grid-cols-1 lg:grid-cols-3 gap-8"}`}>
            {/* Main Form */}
            <div className={isMobile ? "" : "lg:col-span-2"}>
              {/* Mobile Header Info */}
              {isMobile && (
                <div className="text-center mb-6 px-2">
                  <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full mb-3">
                    <Sparkles className="w-4 h-4 mr-1 text-primary" />
                    <span className="text-xs font-medium">Create Programmable IP</span>
                  </div>
                  <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
                    Create Your NFT Asset
                  </h1>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Transform your IP into programmable NFTs with zero gas fees
                  </p>
                </div>
              )}

              <Card className="premium-glass border-primary/20 overflow-hidden">
                <CardContent className={`${isMobile ? "p-4" : "p-8"} space-y-6`}>
                  {/* Upload Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className={`${isMobile ? "text-base" : "text-xl"} font-semibold`}>Upload Your Asset</h2>
                        <p className="text-xs text-zinc-400">Choose your file to tokenize</p>
                      </div>
                    </div>

                    {!assetFile ? (
                      <div
                        className={`border-2 border-dashed rounded-xl ${isMobile ? "p-6" : "p-12"} text-center transition-all duration-300 ${
                          isDragOver
                            ? "border-primary bg-primary/10 scale-[1.02]"
                            : "border-white/20 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="space-y-4">
                          <div
                            className={`${isMobile ? "w-12 h-12" : "w-20 h-20"} rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto`}
                          >
                            <Upload className={`${isMobile ? "h-6 w-6" : "h-10 w-10"} text-primary`} />
                          </div>
                          <div>
                            <p className={`${isMobile ? "text-base" : "text-xl"} font-medium mb-2`}>
                              {isMobile ? "Tap to upload" : "Drag and drop your file here"}
                            </p>
                            <p className="text-zinc-400 mb-4 text-sm">
                              {!isMobile && "or "}
                              <label className="text-primary cursor-pointer hover:underline font-medium">
                                browse files
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                                />
                              </label>
                            </p>
                            <div className="flex flex-wrap justify-center gap-1.5">
                              <Badge
                                variant="outline"
                                className="bg-blue-500/10 border-blue-500/20 text-blue-400 text-xs px-2 py-0.5"
                              >
                                Images
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-green-500/10 border-green-500/20 text-green-400 text-xs px-2 py-0.5"
                              >
                                Audio
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-red-500/10 border-red-500/20 text-red-400 text-xs px-2 py-0.5"
                              >
                                Video
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-yellow-500/10 border-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5"
                              >
                                Docs
                              </Badge>
                              <Badge
                                variant="outline"
                                className="bg-purple-500/10 border-purple-500/20 text-purple-400 text-xs px-2 py-0.5"
                              >
                                Code
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                        <div className="flex items-center">
                          <div
                            className={`${isMobile ? "w-10 h-10" : "w-16 h-16"} rounded-xl bg-green-500/20 flex items-center justify-center mr-3`}
                          >
                            <Check className={`${isMobile ? "h-5 w-5" : "h-8 w-8"} text-green-400`} />
                          </div>
                          <div>
                            <p className={`font-semibold ${isMobile ? "text-sm" : "text-lg"} line-clamp-1`}>
                              {assetFile.name}
                            </p>
                            <p className="text-xs text-zinc-400">{(assetFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAssetFile(null)
                            setAssetPreview(null)
                          }}
                          className="hover:bg-red-500/20 hover:text-red-400 p-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Asset Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className={`${isMobile ? "text-base" : "text-xl"} font-semibold`}>Asset Details</h2>
                        <p className="text-xs text-zinc-400">Name, description, and category</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="assetName" className="text-sm font-medium">
                          Asset Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="assetName"
                          placeholder="Enter a catchy name for your asset"
                          value={assetName}
                          onChange={(e) => setAssetName(e.target.value)}
                          className={`${isMobile ? "h-11" : "h-12"} text-sm`}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assetCategory" className="text-sm font-medium">
                          Category <span className="text-red-500">*</span>
                        </Label>
                        <Select value={assetCategory} onValueChange={setAssetCategory}>
                          <SelectTrigger id="assetCategory" className={`${isMobile ? "h-11" : "h-12"}`}>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {assetCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center">
                                  {category.icon}
                                  <span className="ml-2">{category.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assetDescription" className="text-sm font-medium">
                          Description <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          id="assetDescription"
                          placeholder="Describe your intellectual property asset and its unique value..."
                          rows={isMobile ? 3 : 4}
                          value={assetDescription}
                          onChange={(e) => setAssetDescription(e.target.value)}
                          className="text-sm"
                        />
                        <p className="text-xs text-zinc-500">{assetDescription.length}/500 characters</p>
                      </div>

                      {/* Collection Selector */}
                      <div className="border-t border-white/10 pt-6">
                        <CollectionSelector
                          selectedCollection={selectedCollection}
                          onCollectionSelect={setSelectedCollection}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assetPrice" className="text-sm font-medium">
                          Price (ETH)
                        </Label>
                        <Input
                          id="assetPrice"
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          value={assetPrice}
                          onChange={(e) => setAssetPrice(e.target.value)}
                          className={`${isMobile ? "h-11" : "h-12"} text-sm`}
                        />
                        <p className="text-xs text-zinc-500">Leave empty for free assets</p>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Settings */}
                  <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-primary" />
                          <div className="text-left">
                            <p className="font-medium text-sm">Advanced Settings</p>
                            <p className="text-xs text-zinc-400">Licensing, royalties, and smart contract rules</p>
                          </div>
                        </div>
                        {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                      {/* Royalty Settings */}
                      <div className="space-y-3 p-3 bg-zinc-900/50 rounded-xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-yellow-500" />
                            <Label className="font-medium text-sm">Royalty Percentage</Label>
                          </div>
                          <span className="text-xs font-medium bg-primary/20 px-2 py-1 rounded-full">
                            {royaltyPercentage[0]}%
                          </span>
                        </div>
                        <Slider
                          min={0}
                          max={30}
                          step={1}
                          value={royaltyPercentage}
                          onValueChange={setRoyaltyPercentage}
                          className="w-full"
                        />
                        <p className="text-xs text-zinc-500">Percentage you earn from each resale</p>
                      </div>

                      {/* Usage Rights */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-zinc-900/30">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-blue-500" />
                            <div>
                              <Label className="text-sm font-medium">Commercial Use</Label>
                              <p className="text-xs text-zinc-500">Allow commercial usage</p>
                            </div>
                          </div>
                          <Switch checked={commercialUse} onCheckedChange={setCommercialUse} />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-zinc-900/30">
                          <div className="flex items-center gap-2">
                            <Code2 className="h-4 w-4 text-green-500" />
                            <div>
                              <Label className="text-sm font-medium">Derivatives</Label>
                              <p className="text-xs text-zinc-500">Allow derivative works</p>
                            </div>
                          </div>
                          <Switch checked={allowDerivatives} onCheckedChange={setAllowDerivatives} />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-zinc-900/30">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-purple-500" />
                            <div>
                              <Label className="text-sm font-medium">Attribution</Label>
                              <p className="text-xs text-zinc-500">Require credit</p>
                            </div>
                          </div>
                          <Switch checked={requireAttribution} onCheckedChange={setRequireAttribution} />
                        </div>
                      </div>

                      {/* License & Listing Type */}
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="font-medium text-sm">License Type</Label>
                          <Select value={licenseType} onValueChange={setLicenseType}>
                            <SelectTrigger className={`${isMobile ? "h-11" : "h-12"}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard License</SelectItem>
                              <SelectItem value="extended">Extended License</SelectItem>
                              <SelectItem value="exclusive">Exclusive License</SelectItem>
                              <SelectItem value="creative-commons">Creative Commons</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-medium text-sm">Listing Type</Label>
                          <Select value={listingType} onValueChange={setListingType}>
                            <SelectTrigger className={`${isMobile ? "h-11" : "h-12"}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fixed">Fixed Price</SelectItem>
                              <SelectItem value="auction">Auction</SelectItem>
                              <SelectItem value="offers">Accept Offers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Desktop Create Button */}
                  {!isMobile && (
                    <div className="pt-6">
                      <Button
                        onClick={handleSubmit}
                        disabled={!isFormValid() || isSubmitting}
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-3"></div>
                            Creating NFT...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-3 h-6 w-6" />
                            Create Programmable IP
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Desktop Preview Panel */}
            {!isMobile && (
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <Card className="premium-glass border-primary/20">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Live Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PreviewContent />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Bottom Action Bar */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 p-3">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="w-full h-12 text-sm font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  Creating NFT...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Asset
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
