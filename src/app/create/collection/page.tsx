"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  ImageIcon,
  FileText,
  Settings,
  Eye,
  Check,
  X,
  Plus,
  Globe,
  Zap,
  Tag,
  Shield,
  Sparkles,
  ChevronRight,
  Info,
  AlertCircle,
  Palette,
  Music,
  Video,
  Gamepad2,
  Trophy,
  Briefcase,
  BookOpen,
  Camera,
  Cpu,
  Shuffle,
  Lock,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Star,
  Share2,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { Slider } from "@/src/components/ui/slider"
import { Badge } from "@/src/components/ui/badge"
import { Progress } from "@/src/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useToast } from "@/src/components/ui/use-toast"
import { useMobile } from "@/src/hooks/use-mobile"
import { cn } from "@/src/lib/utils"

export default function CreateCollectionPage() {
  const { toast } = useToast()
  const isMobile = useMobile()

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    description: "",
    symbol: "",
    category: "",
    subcategory: "",
    tags: [],

    // Media
    coverImage: null,
    bannerImage: null,
    logoImage: null,
    featuredImage: null,

    // Collection Settings
    maxSupply: 10000,
    isUnlimited: false,
    royaltyPercentage: 5,
    mintPrice: 0.1,
    currency: "STRK",

    // Programmable IP Settings
    enableRemixing: true,
    remixRoyalty: 2.5,
    allowCommercialUse: true,
    requireAttribution: true,
    enableDerivatives: true,
    maxDerivativeDepth: 3,

    // Licensing Options
    licenseType: "CC-BY-SA",
    customLicenseTerms: "",
    enableCustomLicensing: false,
    licensingPrice: 0,

    // Visibility & Access
    isPublic: true,
    isVerified: false,
    allowCollaborators: false,
    collaboratorRoyalty: 1,

    // Advanced Settings
    enableRevealDate: false,
    revealDate: "",
    enableWhitelist: false,
    whitelistAddresses: [],
    enablePresale: false,
    presaleDate: "",
    presalePrice: 0.08,

    // Social Links
    website: "",
    twitter: "",
    discord: "",
    instagram: "",
    telegram: "",

    // Analytics & Tracking
    enableAnalytics: true,
    trackRemixes: true,
    trackLicensing: true,
    enableNotifications: true,
  })

  // UI state
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    media: false,
    settings: false,
    programmableIP: false,
    licensing: false,
    visibility: false,
    advanced: false,
    social: false,
    analytics: false,
  })

  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState("card")

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0
    const total = 9

    if (formData.name && formData.description && formData.symbol) completed++
    if (formData.coverImage) completed++
    if (formData.category) completed++
    if (formData.maxSupply > 0 || formData.isUnlimited) completed++
    if (formData.tags.length > 0) completed++
    if (formData.royaltyPercentage >= 0) completed++
    if (formData.enableRemixing !== undefined) completed++
    if (formData.licenseType) completed++
    if (formData.website || formData.twitter || formData.discord) completed++

    return Math.round((completed / total) * 100)
  }

  const completionPercentage = calculateCompletion()

  // Validation
  const validateForm = useCallback(() => {
    const errors = {}

    if (!formData.name.trim()) errors.name = "Collection name is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (!formData.symbol.trim()) errors.symbol = "Symbol is required"
    if (formData.symbol.length > 10) errors.symbol = "Symbol must be 10 characters or less"
    if (!formData.category) errors.category = "Category is required"
    if (!formData.coverImage) errors.coverImage = "Cover image is required"
    if (formData.royaltyPercentage < 0 || formData.royaltyPercentage > 10) {
      errors.royaltyPercentage = "Royalty must be between 0% and 10%"
    }
    if (formData.mintPrice < 0) errors.mintPrice = "Mint price cannot be negative"
    if (!formData.isUnlimited && formData.maxSupply < 1) {
      errors.maxSupply = "Max supply must be at least 1"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // Auto-expand sections based on completion
  useEffect(() => {
    const newExpanded = { ...expandedSections }

    if (formData.name && formData.description && formData.symbol && !expandedSections.media) {
      newExpanded.media = true
    }
    if (formData.coverImage && !expandedSections.settings) {
      newExpanded.settings = true
    }
    if (formData.maxSupply && !expandedSections.programmableIP) {
      newExpanded.programmableIP = true
    }

    setExpandedSections(newExpanded)
  }, [formData])

  // Handle file upload simulation
  const handleFileUpload = async (file, type) => {
    setIsUploading(true)
    setUploadProgress((prev) => ({ ...prev, [type]: 0 }))

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      })
      setIsUploading(false)
      return
    }

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const currentProgress = prev[type] || 0
        if (currentProgress >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setFormData((prev) => ({
            ...prev,
            [type]: {
              name: file.name,
              size: file.size,
              type: file.type,
              url: URL.createObjectURL(file),
            },
          }))
          toast({
            title: "Upload Complete",
            description: `${file.name} uploaded successfully`,
          })
          return { ...prev, [type]: 100 }
        }
        return { ...prev, [type]: currentProgress + 10 }
      })
    }, 200)
  }

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], type)
    }
  }

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 3000))

    toast({
      title: "Collection Created Successfully! 🎉",
      description: "Your collection is now live and ready for minting",
      duration: 5000,
    })

    setIsSubmitting(false)
  }

  const categories = [
    {
      id: "art",
      name: "Digital Art",
      icon: Palette,
      subcategories: ["Abstract", "Portrait", "Landscape", "Conceptual"],
    },
    { id: "music", name: "Music", icon: Music, subcategories: ["Electronic", "Classical", "Hip-Hop", "Ambient"] },
    {
      id: "video",
      name: "Film & Video",
      icon: Video,
      subcategories: ["Short Films", "Documentaries", "Animation", "Music Videos"],
    },
    {
      id: "photography",
      name: "Photography",
      icon: Camera,
      subcategories: ["Nature", "Street", "Portrait", "Abstract"],
    },
    {
      id: "gaming",
      name: "Gaming",
      icon: Gamepad2,
      subcategories: ["Characters", "Environments", "Items", "Concepts"],
    },
    { id: "sports", name: "Sports", icon: Trophy, subcategories: ["Moments", "Cards", "Memorabilia", "Highlights"] },
    {
      id: "collectibles",
      name: "Collectibles",
      icon: Star,
      subcategories: ["Trading Cards", "Figurines", "Vintage", "Limited Edition"],
    },
    {
      id: "utility",
      name: "Utility",
      icon: Briefcase,
      subcategories: ["Access Tokens", "Memberships", "Services", "Tools"],
    },
    {
      id: "literature",
      name: "Literature",
      icon: BookOpen,
      subcategories: ["Poetry", "Fiction", "Non-Fiction", "Scripts"],
    },
    { id: "patents", name: "Patents & IP", icon: Cpu, subcategories: ["Technology", "Design", "Process", "Software"] },
  ]

  const licenseTypes = [
    { id: "CC-BY", name: "Creative Commons Attribution", description: "Others can use, modify, and distribute" },
    {
      id: "CC-BY-SA",
      name: "Creative Commons Share-Alike",
      description: "Others can use but must share under same license",
    },
    {
      id: "CC-BY-NC",
      name: "Creative Commons Non-Commercial",
      description: "Others can use for non-commercial purposes only",
    },
    { id: "CC-BY-ND", name: "Creative Commons No Derivatives", description: "Others can use but cannot modify" },
    { id: "EXCLUSIVE", name: "Exclusive License", description: "Full exclusive rights to the buyer" },
    { id: "CUSTOM", name: "Custom License", description: "Define your own licensing terms" },
  ]

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Form */}
          <div className="xl:col-span-8 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                Create New Collection
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Build your own NFT collection with advanced programmable IP features, remix capabilities, and flexible
                licensing options
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-gray-300">Collection Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-purple-400">{completionPercentage}%</span>
                  {completionPercentage === 100 && <CheckCircle className="h-4 w-4 text-green-400" />}
                </div>
              </div>
              <Progress value={completionPercentage} className="h-3 mb-2" />
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Complete all sections to publish your collection</span>
                <span>{Math.ceil(9 - (completionPercentage / 100) * 9)} sections remaining</span>
              </div>
            </motion.div>

            {/* Basic Information Section */}
            <CollectionSection
              title="Basic Information"
              icon={FileText}
              isExpanded={expandedSections.basic}
              onToggle={() => toggleSection("basic")}
              isCompleted={formData.name && formData.description && formData.symbol && formData.category}
              color="text-purple-400"
              description="Essential details about your collection"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      Collection Name <span className="text-red-400">*</span>
                      {validationErrors.name && <AlertCircle className="h-4 w-4 text-red-400" />}
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter collection name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className={cn(
                        "bg-black/40 border-white/10 focus:border-purple-400",
                        validationErrors.name && "border-red-400",
                      )}
                    />
                    {validationErrors.name && <p className="text-xs text-red-400">{validationErrors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symbol" className="flex items-center gap-2">
                      Symbol <span className="text-red-400">*</span>
                      {validationErrors.symbol && <AlertCircle className="h-4 w-4 text-red-400" />}
                    </Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., MYCOL"
                      value={formData.symbol}
                      onChange={(e) => setFormData((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                      className={cn(
                        "bg-black/40 border-white/10 focus:border-purple-400",
                        validationErrors.symbol && "border-red-400",
                      )}
                      maxLength={10}
                    />
                    {validationErrors.symbol && <p className="text-xs text-red-400">{validationErrors.symbol}</p>}
                    <p className="text-xs text-gray-500">Used for blockchain identification</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    Description <span className="text-red-400">*</span>
                    {validationErrors.description && <AlertCircle className="h-4 w-4 text-red-400" />}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your collection, its theme, and what makes it unique..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className={cn(
                      "bg-black/40 border-white/10 focus:border-purple-400 min-h-[120px]",
                      validationErrors.description && "border-red-400",
                    )}
                  />
                  {validationErrors.description && (
                    <p className="text-xs text-red-400">{validationErrors.description}</p>
                  )}
                  <p className="text-xs text-gray-500">{formData.description.length}/500 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="flex items-center gap-2">
                      Category <span className="text-red-400">*</span>
                      {validationErrors.category && <AlertCircle className="h-4 w-4 text-red-400" />}
                    </Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, category: e.target.value, subcategory: "" }))
                      }}
                      className={cn(
                        "w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-purple-400",
                        validationErrors.category && "border-red-400",
                      )}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.category && <p className="text-xs text-red-400">{validationErrors.category}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <select
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subcategory: e.target.value }))}
                      className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-purple-400"
                      disabled={!formData.category}
                    >
                      <option value="">Select subcategory</option>
                      {formData.category &&
                        categories
                          .find((cat) => cat.id === formData.category)
                          ?.subcategories.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag (max 10)"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                      className="bg-black/40 border-white/10 focus:border-purple-400"
                      disabled={formData.tags.length >= 10}
                    />
                    <Button
                      onClick={addTag}
                      size="sm"
                      variant="outline"
                      disabled={!currentTag.trim() || formData.tags.length >= 10}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-purple-500/20 hover:bg-purple-500/30">
                        {tag}
                        <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Tags help users discover your collection</p>
                </div>
              </div>
            </CollectionSection>

            {/* Media Section */}
            <CollectionSection
              title="Collection Media"
              icon={ImageIcon}
              isExpanded={expandedSections.media}
              onToggle={() => toggleSection("media")}
              isCompleted={formData.coverImage}
              color="text-blue-400"
              description="Visual assets for your collection"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FileUploadArea
                  title="Cover Image"
                  description="400x400px recommended"
                  file={formData.coverImage}
                  onFileUpload={(file) => handleFileUpload(file, "coverImage")}
                  dragActive={dragActive}
                  onDrag={handleDrag}
                  onDrop={(e) => handleDrop(e, "coverImage")}
                  required
                  uploadProgress={uploadProgress.coverImage}
                  error={validationErrors.coverImage}
                />

                <FileUploadArea
                  title="Banner Image"
                  description="1200x400px recommended"
                  file={formData.bannerImage}
                  onFileUpload={(file) => handleFileUpload(file, "bannerImage")}
                  dragActive={dragActive}
                  onDrag={handleDrag}
                  onDrop={(e) => handleDrop(e, "bannerImage")}
                  uploadProgress={uploadProgress.bannerImage}
                />

                <FileUploadArea
                  title="Logo"
                  description="200x200px recommended"
                  file={formData.logoImage}
                  onFileUpload={(file) => handleFileUpload(file, "logoImage")}
                  dragActive={dragActive}
                  onDrag={handleDrag}
                  onDrop={(e) => handleDrop(e, "logoImage")}
                  uploadProgress={uploadProgress.logoImage}
                />

                <FileUploadArea
                  title="Featured Image"
                  description="600x400px recommended"
                  file={formData.featuredImage}
                  onFileUpload={(file) => handleFileUpload(file, "featuredImage")}
                  dragActive={dragActive}
                  onDrag={handleDrag}
                  onDrop={(e) => handleDrop(e, "featuredImage")}
                  uploadProgress={uploadProgress.featuredImage}
                />
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Media Guidelines</span>
                </div>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Use high-quality images for better visibility</li>
                  <li>• Cover image appears in marketplace listings</li>
                  <li>• Banner image displays on collection page header</li>
                  <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                  <li>• Maximum file size: 10MB per image</li>
                </ul>
              </div>
            </CollectionSection>

            {/* Collection Settings */}
            <CollectionSection
              title="Collection Settings"
              icon={Settings}
              isExpanded={expandedSections.settings}
              onToggle={() => toggleSection("settings")}
              isCompleted={formData.maxSupply > 0 || formData.isUnlimited}
              color="text-green-400"
              description="Configure supply, pricing, and royalties"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Unlimited Supply</Label>
                        <p className="text-xs text-gray-500">Allow infinite minting</p>
                      </div>
                      <Switch
                        checked={formData.isUnlimited}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isUnlimited: checked }))}
                      />
                    </div>

                    {!formData.isUnlimited && (
                      <div className="space-y-2">
                        <Label htmlFor="maxSupply" className="flex items-center gap-2">
                          Maximum Supply
                          {validationErrors.maxSupply && <AlertCircle className="h-4 w-4 text-red-400" />}
                        </Label>
                        <Input
                          id="maxSupply"
                          type="number"
                          value={formData.maxSupply}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, maxSupply: Number.parseInt(e.target.value) || 0 }))
                          }
                          className={cn(
                            "bg-black/40 border-white/10 focus:border-green-400",
                            validationErrors.maxSupply && "border-red-400",
                          )}
                          min="1"
                        />
                        {validationErrors.maxSupply && (
                          <p className="text-xs text-red-400">{validationErrors.maxSupply}</p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mintPrice">Mint Price</Label>
                        <Input
                          id="mintPrice"
                          type="number"
                          step="0.001"
                          value={formData.mintPrice}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, mintPrice: Number.parseFloat(e.target.value) || 0 }))
                          }
                          className="bg-black/40 border-white/10 focus:border-green-400"
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <select
                          id="currency"
                          value={formData.currency}
                          onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                          className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-green-400"
                        >
                          <option value="STRK">STRK</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        Creator Royalty: {formData.royaltyPercentage}%
                        {validationErrors.royaltyPercentage && <AlertCircle className="h-4 w-4 text-red-400" />}
                      </Label>
                      <Slider
                        value={[formData.royaltyPercentage]}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, royaltyPercentage: value[0] }))}
                        max={10}
                        step={0.5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>0%</span>
                        <span>10%</span>
                      </div>
                      {validationErrors.royaltyPercentage && (
                        <p className="text-xs text-red-400">{validationErrors.royaltyPercentage}</p>
                      )}
                      <p className="text-xs text-gray-500">Percentage you'll earn from secondary sales</p>
                    </div>

                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">Revenue Projection</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Initial Sales:</span>
                          <span>
                            {(formData.mintPrice * (formData.isUnlimited ? 1000 : formData.maxSupply)).toFixed(3)}{" "}
                            {formData.currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Royalty (per resale):</span>
                          <span>{formData.royaltyPercentage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollectionSection>

            {/* Programmable IP Settings */}
            <CollectionSection
              title="Programmable IP Features"
              icon={Shuffle}
              isExpanded={expandedSections.programmableIP}
              onToggle={() => toggleSection("programmableIP")}
              isCompleted={formData.enableRemixing !== undefined}
              color="text-cyan-400"
              description="Configure remix and derivative work capabilities"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Remixing</Label>
                        <p className="text-xs text-gray-500">Allow others to create remixes</p>
                      </div>
                      <Switch
                        checked={formData.enableRemixing}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enableRemixing: checked }))}
                      />
                    </div>

                    {formData.enableRemixing && (
                      <>
                        <div className="space-y-2">
                          <Label>Remix Royalty: {formData.remixRoyalty}%</Label>
                          <Slider
                            value={[formData.remixRoyalty]}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, remixRoyalty: value[0] }))}
                            max={5}
                            step={0.5}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500">Royalty from remix sales</p>
                        </div>

                        <div className="space-y-2">
                          <Label>Max Derivative Depth</Label>
                          <Input
                            type="number"
                            value={formData.maxDerivativeDepth}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                maxDerivativeDepth: Number.parseInt(e.target.value) || 1,
                              }))
                            }
                            className="bg-black/40 border-white/10 focus:border-cyan-400"
                            min="1"
                            max="10"
                          />
                          <p className="text-xs text-gray-500">How many generations of remixes allowed</p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Commercial Use</Label>
                        <p className="text-xs text-gray-500">Allow commercial usage</p>
                      </div>
                      <Switch
                        checked={formData.allowCommercialUse}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowCommercialUse: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Attribution</Label>
                        <p className="text-xs text-gray-500">Credit original creator</p>
                      </div>
                      <Switch
                        checked={formData.requireAttribution}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, requireAttribution: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Derivatives</Label>
                        <p className="text-xs text-gray-500">Allow derivative works</p>
                      </div>
                      <Switch
                        checked={formData.enableDerivatives}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enableDerivatives: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shuffle className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-400">Programmable IP Benefits</span>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Earn royalties from all derivative works</li>
                    <li>• Build a creative ecosystem around your IP</li>
                    <li>• Automatic attribution and licensing tracking</li>
                    <li>• Increased exposure through remix network</li>
                  </ul>
                </div>
              </div>
            </CollectionSection>

            {/* Licensing Options */}
            <CollectionSection
              title="Licensing Options"
              icon={Shield}
              isExpanded={expandedSections.licensing}
              onToggle={() => toggleSection("licensing")}
              isCompleted={formData.licenseType}
              color="text-orange-400"
              description="Define how others can use your IP"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {licenseTypes.map((license) => (
                    <div
                      key={license.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all",
                        formData.licenseType === license.id
                          ? "border-orange-400 bg-orange-400/10"
                          : "border-white/10 hover:border-white/20",
                      )}
                      onClick={() => setFormData((prev) => ({ ...prev, licenseType: license.id }))}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2",
                            formData.licenseType === license.id ? "border-orange-400 bg-orange-400" : "border-gray-400",
                          )}
                        />
                        <div>
                          <h4 className="font-medium">{license.name}</h4>
                          <p className="text-xs text-gray-400">{license.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.licenseType === "CUSTOM" && (
                  <div className="space-y-2">
                    <Label htmlFor="customLicenseTerms">Custom License Terms</Label>
                    <Textarea
                      id="customLicenseTerms"
                      placeholder="Define your custom licensing terms..."
                      value={formData.customLicenseTerms}
                      onChange={(e) => setFormData((prev) => ({ ...prev, customLicenseTerms: e.target.value }))}
                      className="bg-black/40 border-white/10 focus:border-orange-400 min-h-[100px]"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Custom Licensing</Label>
                    <p className="text-xs text-gray-500">Allow buyers to request custom licenses</p>
                  </div>
                  <Switch
                    checked={formData.enableCustomLicensing}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enableCustomLicensing: checked }))}
                  />
                </div>

                {formData.enableCustomLicensing && (
                  <div className="space-y-2">
                    <Label htmlFor="licensingPrice">Base Licensing Price ({formData.currency})</Label>
                    <Input
                      id="licensingPrice"
                      type="number"
                      step="0.001"
                      value={formData.licensingPrice}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, licensingPrice: Number.parseFloat(e.target.value) || 0 }))
                      }
                      className="bg-black/40 border-white/10 focus:border-orange-400"
                      min="0"
                    />
                    <p className="text-xs text-gray-500">Starting price for custom licensing requests</p>
                  </div>
                )}
              </div>
            </CollectionSection>

            {/* Visibility & Access */}
            <CollectionSection
              title="Visibility & Access"
              icon={Eye}
              isExpanded={expandedSections.visibility}
              onToggle={() => toggleSection("visibility")}
              isCompleted={true}
              color="text-pink-400"
              description="Control who can see and interact with your collection"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Public Collection</Label>
                        <p className="text-xs text-gray-500">Visible to everyone</p>
                      </div>
                      <Switch
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublic: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow Collaborators</Label>
                        <p className="text-xs text-gray-500">Let others add to collection</p>
                      </div>
                      <Switch
                        checked={formData.allowCollaborators}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowCollaborators: checked }))}
                      />
                    </div>

                    {formData.allowCollaborators && (
                      <div className="space-y-2">
                        <Label>Collaborator Royalty: {formData.collaboratorRoyalty}%</Label>
                        <Slider
                          value={[formData.collaboratorRoyalty]}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, collaboratorRoyalty: value[0] }))}
                          max={5}
                          step={0.5}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">Royalty share for collaborators</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">Verification Status</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        Submit for verification to get a blue checkmark and increased visibility
                      </p>
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Apply for Verification
                      </Button>
                    </div>

                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-medium text-purple-400">Community Features</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Enable Comments</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Allow Favorites</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">Enable Sharing</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollectionSection>

            {/* Advanced Settings */}
            <CollectionSection
              title="Advanced Settings"
              icon={Zap}
              isExpanded={expandedSections.advanced}
              onToggle={() => toggleSection("advanced")}
              isCompleted={false}
              color="text-yellow-400"
              description="Advanced features and timing controls"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Reveal Date</Label>
                        <p className="text-xs text-gray-500">Hide metadata until reveal</p>
                      </div>
                      <Switch
                        checked={formData.enableRevealDate}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enableRevealDate: checked }))}
                      />
                    </div>

                    {formData.enableRevealDate && (
                      <div className="space-y-2">
                        <Label htmlFor="revealDate">Reveal Date</Label>
                        <Input
                          id="revealDate"
                          type="datetime-local"
                          value={formData.revealDate}
                          onChange={(e) => setFormData((prev) => ({ ...prev, revealDate: e.target.value }))}
                          className="bg-black/40 border-white/10 focus:border-yellow-400"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Presale</Label>
                        <p className="text-xs text-gray-500">Early access for selected users</p>
                      </div>
                      <Switch
                        checked={formData.enablePresale}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enablePresale: checked }))}
                      />
                    </div>

                    {formData.enablePresale && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="presaleDate">Presale Date</Label>
                          <Input
                            id="presaleDate"
                            type="datetime-local"
                            value={formData.presaleDate}
                            onChange={(e) => setFormData((prev) => ({ ...prev, presaleDate: e.target.value }))}
                            className="bg-black/40 border-white/10 focus:border-yellow-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="presalePrice">Presale Price ({formData.currency})</Label>
                          <Input
                            id="presalePrice"
                            type="number"
                            step="0.001"
                            value={formData.presalePrice}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, presalePrice: Number.parseFloat(e.target.value) || 0 }))
                            }
                            className="bg-black/40 border-white/10 focus:border-yellow-400"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Whitelist</Label>
                        <p className="text-xs text-gray-500">Restrict minting to specific addresses</p>
                      </div>
                      <Switch
                        checked={formData.enableWhitelist}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enableWhitelist: checked }))}
                      />
                    </div>

                    {formData.enableWhitelist && (
                      <div className="space-y-2">
                        <Label htmlFor="whitelistAddresses">Whitelist Addresses</Label>
                        <Textarea
                          id="whitelistAddresses"
                          placeholder="Enter wallet addresses (one per line)"
                          className="bg-black/40 border-white/10 focus:border-yellow-400"
                          rows={4}
                        />
                        <p className="text-xs text-gray-500">Upload CSV file or paste addresses</p>
                      </div>
                    )}

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">Launch Timeline</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Collection Creation:</span>
                          <span>Now</span>
                        </div>
                        {formData.enablePresale && (
                          <div className="flex justify-between">
                            <span>Presale Start:</span>
                            <span>
                              {formData.presaleDate ? new Date(formData.presaleDate).toLocaleDateString() : "TBD"}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Public Launch:</span>
                          <span>After presale</span>
                        </div>
                        {formData.enableRevealDate && (
                          <div className="flex justify-between">
                            <span>Metadata Reveal:</span>
                            <span>
                              {formData.revealDate ? new Date(formData.revealDate).toLocaleDateString() : "TBD"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollectionSection>

            {/* Social Links */}
            <CollectionSection
              title="Social Links"
              icon={Globe}
              isExpanded={expandedSections.social}
              onToggle={() => toggleSection("social")}
              isCompleted={formData.website || formData.twitter || formData.discord}
              color="text-indigo-400"
              description="Connect your social media and community"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                      className="bg-black/40 border-white/10 focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      placeholder="@yourusername"
                      value={formData.twitter}
                      onChange={(e) => setFormData((prev) => ({ ...prev, twitter: e.target.value }))}
                      className="bg-black/40 border-white/10 focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discord">Discord</Label>
                    <Input
                      id="discord"
                      placeholder="Discord invite link"
                      value={formData.discord}
                      onChange={(e) => setFormData((prev) => ({ ...prev, discord: e.target.value }))}
                      className="bg-black/40 border-white/10 focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@yourusername"
                      value={formData.instagram}
                      onChange={(e) => setFormData((prev) => ({ ...prev, instagram: e.target.value }))}
                      className="bg-black/40 border-white/10 focus:border-indigo-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telegram">Telegram</Label>
                    <Input
                      id="telegram"
                      placeholder="Telegram channel link"
                      value={formData.telegram}
                      onChange={(e) => setFormData((prev) => ({ ...prev, telegram: e.target.value }))}
                      className="bg-black/40 border-white/10 focus:border-indigo-400"
                    />
                  </div>

                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Share2 className="h-4 w-4 text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-400">Social Benefits</span>
                    </div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Increase collection visibility</li>
                      <li>• Build community engagement</li>
                      <li>• Enable cross-platform promotion</li>
                      <li>• Verify authenticity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CollectionSection>

            {/* Analytics & Tracking */}
            <CollectionSection
              title="Analytics & Tracking"
              icon={TrendingUp}
              isExpanded={expandedSections.analytics}
              onToggle={() => toggleSection("analytics")}
              isCompleted={true}
              color="text-emerald-400"
              description="Monitor performance and engagement"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Analytics</Label>
                        <p className="text-xs text-gray-500">Track collection performance</p>
                      </div>
                      <Switch
                        checked={formData.enableAnalytics}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enableAnalytics: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Track Remixes</Label>
                        <p className="text-xs text-gray-500">Monitor remix activity</p>
                      </div>
                      <Switch
                        checked={formData.trackRemixes}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, trackRemixes: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Track Licensing</Label>
                        <p className="text-xs text-gray-500">Monitor licensing usage</p>
                      </div>
                      <Switch
                        checked={formData.trackLicensing}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, trackLicensing: checked }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable Notifications</Label>
                        <p className="text-xs text-gray-500">Get updates on activity</p>
                      </div>
                      <Switch
                        checked={formData.enableNotifications}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({ ...prev, enableNotifications: checked }))
                        }
                      />
                    </div>

                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Analytics Features</span>
                      </div>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• Real-time sales tracking</li>
                        <li>• Remix genealogy mapping</li>
                        <li>• Licensing revenue analytics</li>
                        <li>• Community engagement metrics</li>
                        <li>• Geographic distribution data</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CollectionSection>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white py-6 text-lg font-semibold disabled:opacity-50"
                disabled={completionPercentage < 50 || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating Collection...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create Collection
                  </>
                )}
              </Button>
              <Button variant="outline" className="px-8 py-6 bg-transparent" disabled={isSubmitting}>
                Save Draft
              </Button>
            </motion.div>

            {completionPercentage < 50 && (
              <div className="text-center text-sm text-gray-500">
                Complete at least 50% of the form to create your collection
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="xl:col-span-4">
            <div className="sticky top-24">
              <CollectionPreview
                formData={formData}
                completionPercentage={completionPercentage}
                previewMode={previewMode}
                setPreviewMode={setPreviewMode}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Collection Section Component
const CollectionSection = ({ title, icon: Icon, isExpanded, onToggle, isCompleted, color, description, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "glass-effect rounded-2xl border transition-all duration-300",
      isExpanded ? "border-white/20" : "border-white/10",
      isCompleted ? "bg-green-500/5 border-green-500/20" : "",
    )}
  >
    <div className="p-6 cursor-pointer flex items-center justify-between" onClick={onToggle}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-black/40", isCompleted ? "bg-green-500/20" : "")}>
          {isCompleted ? <Check className="h-5 w-5 text-green-400" /> : <Icon className={cn("h-5 w-5", color)} />}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      <ChevronRight className={cn("h-5 w-5 transition-transform duration-200", isExpanded ? "rotate-90" : "")} />
    </div>

    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-6 space-y-4 border-t border-white/10">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

// File Upload Area Component
const FileUploadArea = ({
  title,
  description,
  file,
  onFileUpload,
  dragActive,
  onDrag,
  onDrop,
  required = false,
  uploadProgress = 0,
  error,
}) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-1">
      {title}
      {required && <span className="text-red-400">*</span>}
      {error && <AlertCircle className="h-4 w-4 text-red-400" />}
    </Label>
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
        dragActive ? "border-purple-400 bg-purple-400/10" : "border-gray-600 hover:border-gray-500",
        file ? "border-green-400 bg-green-400/10" : "",
        error ? "border-red-400 bg-red-400/10" : "",
      )}
      onDragEnter={onDrag}
      onDragLeave={onDrag}
      onDragOver={onDrag}
      onDrop={onDrop}
      onClick={() => document.getElementById(`file-${title}`)?.click()}
    >
      <input
        id={`file-${title}`}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
      />

      {file ? (
        <div className="space-y-2">
          <img src={file.url || "/placeholder.svg"} alt={title} className="w-16 h-16 object-cover rounded-lg mx-auto" />
          <p className="text-sm text-green-400 font-medium">{file.name}</p>
          <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <p className="text-sm text-gray-400">{description}</p>
          <p className="text-xs text-gray-500">Click or drag to upload</p>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-2">
          <Progress value={uploadProgress} className="h-1" />
          <p className="text-xs text-purple-400 mt-1">{uploadProgress}%</p>
        </div>
      )}

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  </div>
)

// Collection Preview Component
const CollectionPreview = ({ formData, completionPercentage, previewMode, setPreviewMode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 }}
    className="glass-effect rounded-2xl p-6 border border-white/10 space-y-6"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Live Preview</h3>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-purple-500/20">
          {completionPercentage}% Complete
        </Badge>
      </div>
    </div>

    {/* Preview Mode Tabs */}
    <Tabs value={previewMode} onValueChange={setPreviewMode} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="card">Card</TabsTrigger>
        <TabsTrigger value="banner">Banner</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
      </TabsList>

      <TabsContent value="card" className="space-y-4">
        {/* Card Preview */}
        <div className="aspect-square rounded-xl overflow-hidden bg-gray-800/50 border border-white/10 relative">
          {formData.coverImage ? (
            <img
              src={formData.coverImage.url || "/placeholder.svg"}
              alt="Collection cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-600" />
            </div>
          )}
          {formData.isVerified && (
            <div className="absolute top-2 right-2">
              <CheckCircle className="h-6 w-6 text-blue-400" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold truncate">{formData.name || "Collection Name"}</h4>
            {formData.enableRemixing && (
              <Badge variant="outline" className="text-cyan-400 border-cyan-400/50">
                <Shuffle className="h-3 w-3 mr-1" />
                Remixable
              </Badge>
            )}
          </div>

          {formData.symbol && (
            <Badge variant="outline" className="text-purple-400 border-purple-400/50">
              {formData.symbol}
            </Badge>
          )}

          <p className="text-gray-400 text-sm line-clamp-3">
            {formData.description || "Collection description will appear here..."}
          </p>

          {formData.category && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400">{formData.category}</span>
              {formData.subcategory && <span className="text-sm text-gray-500">• {formData.subcategory}</span>}
            </div>
          )}

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {formData.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{formData.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="banner" className="space-y-4">
        {/* Banner Preview */}
        <div className="aspect-[3/1] rounded-xl overflow-hidden bg-gray-800/50 border border-white/10">
          {formData.bannerImage ? (
            <img
              src={formData.bannerImage.url || "/placeholder.svg"}
              alt="Collection banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-gray-600" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800/50 border border-white/10">
            {formData.logoImage ? (
              <img
                src={formData.logoImage.url || "/placeholder.svg"}
                alt="Collection logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold">{formData.name || "Collection Name"}</h4>
            <p className="text-sm text-gray-400">by Creator</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="details" className="space-y-4">
        {/* Collection Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-black/40 rounded-lg">
            <div className="text-lg font-bold text-purple-400">
              {formData.isUnlimited ? "∞" : formData.maxSupply.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">Max Supply</div>
          </div>
          <div className="text-center p-3 bg-black/40 rounded-lg">
            <div className="text-lg font-bold text-green-400">{formData.royaltyPercentage}%</div>
            <div className="text-xs text-gray-500">Royalty</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-black/40 rounded-lg">
            <div className="text-lg font-bold text-blue-400">
              {formData.mintPrice} {formData.currency}
            </div>
            <div className="text-xs text-gray-500">Mint Price</div>
          </div>
          <div className="text-center p-3 bg-black/40 rounded-lg">
            <div className="text-lg font-bold text-cyan-400">{formData.remixRoyalty}%</div>
            <div className="text-xs text-gray-500">Remix Royalty</div>
          </div>
        </div>

        {/* License Info */}
        {formData.licenseType && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-400">License</span>
            </div>
            <p className="text-xs text-gray-400">{formData.licenseType}</p>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-300">Features</h5>
          <div className="space-y-1">
            {formData.enableRemixing && (
              <div className="flex items-center gap-2 text-xs text-cyan-400">
                <Shuffle className="h-3 w-3" />
                <span>Remixing Enabled</span>
              </div>
            )}
            {formData.allowCommercialUse && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <DollarSign className="h-3 w-3" />
                <span>Commercial Use</span>
              </div>
            )}
            {formData.requireAttribution && (
              <div className="flex items-center gap-2 text-xs text-blue-400">
                <Users className="h-3 w-3" />
                <span>Attribution Required</span>
              </div>
            )}
            {formData.enableCustomLicensing && (
              <div className="flex items-center gap-2 text-xs text-purple-400">
                <Lock className="h-3 w-3" />
                <span>Custom Licensing</span>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>

    {/* Zero-Fee Benefits */}
    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-4 w-4 text-yellow-400" />
        <span className="text-sm font-medium text-yellow-400">Zero-Fee Benefits</span>
      </div>
      <ul className="text-xs text-gray-300 space-y-1">
        <li>• No collection creation fees</li>
        <li>• No listing fees</li>
        <li>• No transaction fees</li>
        <li>• Keep 100% of your earnings</li>
        <li>• Advanced IP features included</li>
      </ul>
    </div>

    {/* Action Buttons */}
    <div className="space-y-2">
      <Button className="w-full bg-transparent" variant="outline" disabled={completionPercentage < 50}>
        <Eye className="h-4 w-4 mr-2" />
        Preview Collection Page
      </Button>
      {completionPercentage < 50 && (
        <p className="text-xs text-gray-500 text-center">Complete more sections to enable preview</p>
      )}
    </div>
  </motion.div>
)
