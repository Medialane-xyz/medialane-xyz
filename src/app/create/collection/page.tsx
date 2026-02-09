"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Upload,
  ImageIcon,
  FileText,
  Check,
  Plus,
  Globe,
  Shield,
  Sparkles,
  ChevronRight,
  Info,
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
  DollarSign,
  Loader2,
  X,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { Slider } from "@/src/components/ui/slider"
import { Badge } from "@/src/components/ui/badge"
import { useToast } from "@/src/components/ui/use-toast"
import { useMobile } from "@/src/hooks/use-mobile"
import { useCreateCollection } from "@/src/lib/hooks/use-create-collection"
import { cn } from "@/src/lib/utils"

// Define types
interface CollectionFormData {
  name: string
  description: string
  category: string
  tags: string[]
  coverImage: { file: File; url: string; name: string; type: string; size: number } | null
  bannerImage: { file: File; url: string; name: string; type: string; size: number } | null
  royaltyPercentage: number
  mintPrice: number
  currency: string
  enableRemixing: boolean
  remixRoyalty: number
  allowCommercialUse: boolean
  requireAttribution: boolean
  licenseType: string
  website: string
  twitter: string
  discord: string
}

export default function CreateCollectionPage() {
  const { toast } = useToast()
  const isMobile = useMobile()
  const { createCollection, isProcessing, step } = useCreateCollection()

  const [formData, setFormData] = useState<CollectionFormData>({
    // Basic Information
    name: "",
    description: "",
    category: "",
    tags: [],

    // Media
    coverImage: null,
    bannerImage: null,

    // Collection Settings
    royaltyPercentage: 5,
    mintPrice: 0.1,
    currency: "ETH",

    // Programmable IP Settings
    enableRemixing: true,
    remixRoyalty: 2.5,
    allowCommercialUse: true,
    requireAttribution: true,

    // Licensing
    licenseType: "CC-BY-SA",

    // Social Links
    website: "",
    twitter: "",
    discord: "",
  })

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    media: true,
    settings: false,
    programmableIP: false,
    licensing: false,
    social: false,
  })

  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState("card")

  // Calculate completion percentage based on essential fields only
  const calculateCompletion = () => {
    let completed = 0
    if (formData.name && formData.description) completed++
    if (formData.coverImage) completed++
    if (formData.bannerImage) completed++
    if (formData.category) completed++
    return Math.round((completed / 4) * 100)
  }

  const completionPercentage = calculateCompletion()

  // Validation - only essential fields
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = "Collection name is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (!formData.category) errors.category = "Category is required"
    if (!formData.coverImage) errors.coverImage = "Cover image is required"
    if (!formData.bannerImage) errors.bannerImage = "Banner image is required"

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // Handle file upload
  const handleFileUpload = async (file: File, type: "coverImage" | "bannerImage") => {
    setIsUploading(true)
    setUploadProgress((prev) => ({ ...prev, [type]: 0 }))

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
              file: file,
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
    }, 100)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent, type: "coverImage" | "bannerImage") => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0], type)
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }))
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Prepare params
    if (!formData.coverImage || !formData.bannerImage) return

    await createCollection({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      coverImage: formData.coverImage.file,
      bannerImage: formData.bannerImage.file,
      symbol: formData.name.substring(0, 3).toUpperCase(),
      tags: formData.tags,
      royaltyPercentage: formData.royaltyPercentage,
      mintPrice: formData.mintPrice,
      currency: formData.currency,
      enableRemixing: formData.enableRemixing,
      remixRoyalty: formData.remixRoyalty,
      allowCommercialUse: formData.allowCommercialUse,
      requireAttribution: formData.requireAttribution,
      licenseType: formData.licenseType,
      website: formData.website,
      twitter: formData.twitter,
      discord: formData.discord
    })
  }

  const categories = [
    { id: "art", name: "Digital Art", icon: Palette },
    { id: "music", name: "Music", icon: Music },
    { id: "video", name: "Film & Video", icon: Video },
    { id: "photography", name: "Photography", icon: Camera },
    { id: "gaming", name: "Gaming", icon: Gamepad2 },
    { id: "collectibles", name: "Collectibles", icon: Briefcase },
    { id: "literature", name: "Literature", icon: BookOpen },
  ]

  const licenseTypes = [
    { id: "CC-BY", name: "Creative Commons Attribution" },
    { id: "CC-BY-SA", name: "Creative Commons Share-Alike" },
    { id: "CC-BY-NC", name: "Creative Commons Non-Commercial" },
    { id: "CC-BY-ND", name: "Creative Commons No Derivatives" },
    { id: "EXCLUSIVE", name: "Exclusive License" },
    { id: "CUSTOM", name: "Custom License" },
  ]

  return (
    <div className="min-h-screen pt-40 pb-40">
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
                Mint your collection
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Launch your Programmable IP NFT collection with zero fees
              </p>
            </motion.div>

            {/* Essential Fields Section */}
            <CollectionSection
              title="Essential Information"
              icon={FileText}
              isExpanded={expandedSections.basic}
              onToggle={() => toggleSection("basic")}
              isCompleted={formData.name && formData.description && formData.category}
              color="text-purple-400"
              description="Just fill in the basics - we'll handle the rest"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    Collection Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Digital Artistry Series"
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
                  <Label htmlFor="description" className="flex items-center gap-2">
                    Description <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Tell us what your collection is about..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className={cn(
                      "bg-black/40 border border-white/10 rounded-lg text-white focus:border-purple-400 min-h-[100px]",
                      validationErrors.description && "border-red-400",
                    )}
                  />
                  {validationErrors.description && (
                    <p className="text-xs text-red-400">{validationErrors.description}</p>
                  )}
                  <p className="text-xs text-gray-500">{formData.description.length}/500 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">
                    Category <span className="text-red-400">*</span>
                  </Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className={cn(
                      "w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-purple-400",
                      validationErrors.category && "border-red-400",
                    )}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.category && <p className="text-xs text-red-400">{validationErrors.category}</p>}
                </div>

                {/* Optional tags */}
                <div className="space-y-2">
                  <Label>Tags (Optional - helps discovery)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag and press Enter"
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
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-500/20">
                          {tag}
                          <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CollectionSection>

            {/* Media Section */}
            <CollectionSection
              title="Collection Images"
              icon={ImageIcon}
              isExpanded={expandedSections.media}
              onToggle={() => toggleSection("media")}
              isCompleted={formData.coverImage && formData.bannerImage}
              color="text-blue-400"
              description="Upload cover (1:1) and banner (3:1) images"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadArea
                  title="Cover Image"
                  description="1:1 ratio (400x400px recommended)"
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
                  description="3:1 ratio (1200x400px recommended)"
                  file={formData.bannerImage}
                  onFileUpload={(file) => handleFileUpload(file, "bannerImage")}
                  dragActive={dragActive}
                  onDrag={handleDrag}
                  onDrop={(e) => handleDrop(e, "bannerImage")}
                  required
                  uploadProgress={uploadProgress.bannerImage}
                  error={validationErrors.bannerImage}
                />
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-400">Tip</span>
                </div>
                <p className="text-xs text-gray-400">
                  High-quality images make your collection stand out. Supported: JPG, PNG, GIF, WebP
                </p>
              </div>
            </CollectionSection>

            {/* Monetization Settings */}
            <CollectionSection
              title="Monetization"
              icon={DollarSign}
              isExpanded={expandedSections.settings}
              onToggle={() => toggleSection("settings")}
              isCompleted={formData.royaltyPercentage >= 0}
              color="text-green-400"
              description="Set your pricing and earnings"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="mintPrice">Mint Price</Label>
                      <div className="flex gap-2">
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
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))}
                          className="p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-green-400"
                        >
                          <option value="ETH">ETH</option>
                          <option value="MATIC">MATIC</option>
                          <option value="BNB">BNB</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">Your Royalty: {formData.royaltyPercentage}%</Label>
                    <Slider
                      value={[formData.royaltyPercentage]}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, royaltyPercentage: value[0] }))}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">You earn this % from every resale</p>
                  </div>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 font-medium mb-2">Revenue Example</p>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Initial Sale:</span>
                      <span className="text-green-400">
                        {formData.mintPrice} {formData.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Royalty per Resale:</span>
                      <span className="text-green-400">{formData.royaltyPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CollectionSection>

            {/* Programmable IP */}
            <CollectionSection
              title="Programmable IP & Remixing"
              icon={Shuffle}
              isExpanded={expandedSections.programmableIP}
              onToggle={() => toggleSection("programmableIP")}
              isCompleted={true}
              color="text-cyan-400"
              description="Enable remix and derivative monetization"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Remixing</Label>
                    <p className="text-xs text-gray-500">Let users create derivative works</p>
                  </div>
                  <Switch
                    checked={formData.enableRemixing}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, enableRemixing: checked }))}
                  />
                </div>

                {formData.enableRemixing && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Remix Royalty: {formData.remixRoyalty}%</Label>
                      <Slider
                        value={[formData.remixRoyalty]}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, remixRoyalty: value[0] }))}
                        max={5}
                        step={0.5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">You earn this from remix sales</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-black/40 rounded-lg">
                    <Switch
                      checked={formData.allowCommercialUse}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowCommercialUse: checked }))}
                    />
                    <Label className="text-sm cursor-pointer">Commercial Use</Label>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-black/40 rounded-lg">
                    <Switch
                      checked={formData.requireAttribution}
                      onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, requireAttribution: checked }))}
                    />
                    <Label className="text-sm cursor-pointer">Require Credit</Label>
                  </div>
                </div>

                <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shuffle className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-400">Remix Benefits</span>
                  </div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Earn royalties from derivative works</li>
                    <li>• Build a creative ecosystem</li>
                    <li>• Automatic tracking & attribution</li>
                  </ul>
                </div>
              </div>
            </CollectionSection>

            {/* Licensing */}
            <CollectionSection
              title="Licensing"
              icon={Shield}
              isExpanded={expandedSections.licensing}
              onToggle={() => toggleSection("licensing")}
              isCompleted={formData.licenseType}
              color="text-orange-400"
              description="Choose how your IP can be used"
            >
              <div className="space-y-4">
                {licenseTypes.map((license) => (
                  <div
                    key={license.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
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
                      <Label className="cursor-pointer text-sm">{license.name}</Label>
                    </div>
                  </div>
                ))}
              </div>
            </CollectionSection>

            {/* Social Links */}
            <CollectionSection
              title="Social & Community"
              icon={Globe}
              isExpanded={expandedSections.social}
              onToggle={() => toggleSection("social")}
              isCompleted={formData.website || formData.twitter}
              color="text-indigo-400"
              description="Connect your social presence (optional)"
            >
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
            </CollectionSection>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white py-6 text-lg font-semibold disabled:opacity-50"
                disabled={completionPercentage < 100 || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create Collection
                  </>
                )}
              </Button>
              <Button variant="outline" className="px-8 py-6 bg-transparent" disabled={isProcessing}>
                Save Draft
              </Button>
            </motion.div>

            {completionPercentage < 100 && (
              <div className="text-center text-sm text-gray-500">
                Complete all required fields to launch your collection ({completionPercentage}%)
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

interface CollectionSectionProps {
  title: string
  icon: any
  isExpanded: boolean
  onToggle: () => void
  isCompleted: any
  color: string
  description?: string
  children: React.ReactNode
}

const CollectionSection = ({ title, icon: Icon, isExpanded, onToggle, isCompleted, color, description, children }: CollectionSectionProps) => (
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

interface FileUploadAreaProps {
  title: string
  description: string
  file: { url: string; name: string } | null
  onFileUpload: (file: File) => void
  dragActive: boolean
  onDrag: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  required?: boolean
  uploadProgress?: number
  error?: string
}

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
}: FileUploadAreaProps) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-1">
      {title}
      {required && <span className="text-red-400">*</span>}
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
        </div>
      ) : (
        <div className="space-y-2">
          <Upload className="h-8 w-8 mx-auto text-gray-400" />
          <p className="text-sm text-gray-400">{description}</p>
          <p className="text-xs text-gray-500">Click or drag to upload</p>
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && <p className="text-xs text-purple-400 mt-1">{uploadProgress}%</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  </div>
)

interface CollectionPreviewProps {
  formData: CollectionFormData
  completionPercentage: number
  previewMode: string
  setPreviewMode: (mode: string) => void
}

const CollectionPreview = ({ formData, completionPercentage, previewMode, setPreviewMode }: CollectionPreviewProps) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 }}
    className="glass-effect rounded-2xl p-6 border border-white/10 space-y-6"
  >
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Preview</h3>
      <Badge variant="secondary" className={cn("bg-purple-500/20", completionPercentage === 100 && "bg-green-500/20")}>
        {completionPercentage}% Ready
      </Badge>
    </div>

    <div className="space-y-4 overflow-hidden rounded-xl border border-white/10">
      {/* Banner background section */}
      <div className="relative aspect-[3/1] overflow-hidden rounded-t-lg">
        {formData.bannerImage ? (
          <img
            src={formData.bannerImage.url || "/placeholder.svg"}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-600" />
          </div>
        )}
      </div>

      {/* Collection info overlaid on banner */}
      <div className="px-6 pb-6 space-y-4">
        {/* Cover image and basic info */}
        <div className="flex gap-4 items-start">
          {/* Cover image */}
          <div className="w-24 h-24 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 -mt-12 relative z-10 bg-black">
            {formData.coverImage ? (
              <img
                src={formData.coverImage.url || "/placeholder.svg"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-gray-600" />
              </div>
            )}
          </div>

          {/* Collection name and description */}
          <div className="flex-1 pt-2">
            <h4 className="text-lg font-bold">{formData.name || "Collection Name"}</h4>
            <p className="text-gray-400 text-sm line-clamp-2 mt-1">
              {formData.description || "Your description here..."}
            </p>
            {formData.category && (
              <Badge className="bg-purple-500/20 text-purple-300 mt-2 text-xs">{formData.category}</Badge>
            )}
          </div>
        </div>

        {/* Stats and pricing info */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-sm font-bold">{formData.mintPrice}</div>
            <div className="text-xs text-gray-500">Mint Price</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-green-400">{formData.royaltyPercentage}%</div>
            <div className="text-xs text-gray-500">Royalty</div>
          </div>
          {formData.enableRemixing && (
            <div className="text-center">
              <div className="text-sm font-bold text-cyan-400">{formData.remixRoyalty}%</div>
              <div className="text-xs text-gray-500">Remix</div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Info box */}
    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
      <p className="text-xs text-blue-400 font-medium mb-2">Zero Platform Fees</p>
      <ul className="text-xs text-gray-300 space-y-1">
        <li>• No creation fees</li>
        <li>• No listing fees</li>
        <li>• Keep 100% of earnings</li>
      </ul>
    </div>
  </motion.div>
)
