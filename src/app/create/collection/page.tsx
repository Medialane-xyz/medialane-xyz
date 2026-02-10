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
  Briefcase,
  BookOpen,
  Camera,
  DollarSign,
  Loader2,
  X,
  Layers,
  Share2,
  Copyright
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
import { useAccount } from "@starknet-react/core"
import { useAuth } from "@clerk/nextjs"
import { useGetWallet } from "@chipi-stack/nextjs"
import { WalletPinDialog } from "@/src/components/chipi/wallet-pin-dialog"
import { CreateWalletDialog } from "@/src/components/chipi/create-wallet-dialog"
import { ChipiDebug } from "@/src/components/debug/chipi-debug"

// Define types
interface CollectionFormData {
  name: string
  symbol: string
  description: string
  category: string
  tags: string[]
  featureImage: { file: File; url: string; name: string; type: string; size: number } | undefined
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
  const { createCollection, isProcessing } = useCreateCollection()
  const { address } = useAccount()

  // Chipipay integration
  const { getToken, userId: clerkUserId } = useAuth()
  const { data: customerWallet } = useGetWallet({
    getBearerToken: getToken,
    params: { externalUserId: clerkUserId || "" },
  })
  const [pinOpen, setPinOpen] = useState(false)
  const [createWalletOpen, setCreateWalletOpen] = useState(false)

  const [formData, setFormData] = useState<CollectionFormData>({
    // Basic Information
    name: "",
    symbol: "",
    description: "",
    category: "",
    tags: [],

    // Media
    featureImage: undefined,

    // Collection Settings
    royaltyPercentage: 5,
    mintPrice: 0, // Standard collections often free to mint (deploy), but kept for consistency if needed
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
    settings: true,
    programmableIP: false,
    licensing: false,
    social: false,
  })

  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [currentTag, setCurrentTag] = useState("")
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [previewMode, setPreviewMode] = useState("card")

  // Calculate completion percentage based on essential fields only
  const calculateCompletion = () => {
    let completed = 0
    let total = 4
    if (formData.name && formData.symbol && formData.description) completed++
    if (formData.featureImage) completed++
    if (formData.category) completed++
    if (formData.royaltyPercentage >= 0) completed++
    return Math.round((completed / total) * 100)
  }

  const completionPercentage = calculateCompletion()

  // Validation
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {}
    if (!formData.name.trim()) errors.name = "Collection name is required"
    if (!formData.symbol.trim()) errors.symbol = "Symbol is required"
    if (!formData.description.trim()) errors.description = "Description is required"
    if (!formData.category) errors.category = "Category is required"
    if (!formData.featureImage) errors.featureImage = "Feature image is required"

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [formData])

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

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
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setFormData((prev) => ({
            ...prev,
            featureImage: {
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
          return 100
        }
        return prev + 10
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
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

    if (!formData.featureImage) return

    // Wallet check
    if (!address) {
      if (customerWallet) {
        setPinOpen(true)
        return
      } else if (clerkUserId) {
        // Logged in but no wallet -> create wallet
        setCreateWalletOpen(true)
        return
      }
      // If neither, let logic flow to createCollection which will show toast
    }

    await createCollection({
      name: formData.name,
      symbol: formData.symbol,
      description: formData.description,
      category: formData.category,
      featureImage: formData.featureImage.file,
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-3">
                <Layers className="w-4 h-4" /> Standard Collection
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                Create a Collection
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl">
                Deploy your smart contract and start minting unique digital assets.
              </p>
            </motion.div>

            {/* Basic Information */}
            <CollectionSection
              title="Collection Details"
              icon={FileText}
              isExpanded={expandedSections.basic}
              onToggle={() => toggleSection("basic")}
              isCompleted={formData.name && formData.symbol && formData.description && formData.category}
              color="text-purple-400"
              description="Name, symbol, description, and category"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">Collection Name <span className="text-red-400">*</span></Label>
                    <Input id="name" placeholder="e.g., Cyber Punks 2077" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className={cn("bg-black/40 border-white/10 focus:border-purple-400", validationErrors.name && "border-red-400")} />
                    {validationErrors.name && <p className="text-xs text-red-400">{validationErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="symbol" className="flex items-center gap-2">Symbol <span className="text-red-400">*</span></Label>
                    <Input id="symbol" placeholder="e.g., PUNK" value={formData.symbol} onChange={(e) => setFormData((prev) => ({ ...prev, symbol: e.target.value.toUpperCase() }))} className={cn("bg-black/40 border-white/10 focus:border-purple-400 uppercase", validationErrors.symbol && "border-red-400")} maxLength={10} />
                    {validationErrors.symbol && <p className="text-xs text-red-400">{validationErrors.symbol}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">Description <span className="text-red-400">*</span></Label>
                  <Textarea id="description" placeholder="Tell the story behind your collection..." value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} className={cn("bg-black/40 border border-white/10 rounded-lg text-white focus:border-purple-400 min-h-[100px]", validationErrors.description && "border-red-400")} />
                  {validationErrors.description && <p className="text-xs text-red-400">{validationErrors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="flex items-center gap-2">Category <span className="text-red-400">*</span></Label>
                  <select id="category" value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))} className={cn("w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-purple-400", validationErrors.category && "border-red-400")}>
                    <option value="">Select a category</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  {validationErrors.category && <p className="text-xs text-red-400">{validationErrors.category}</p>}
                </div>

                {/* Optional tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Add tag and press Enter" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addTag()} className="bg-black/40 border-white/10 focus:border-purple-400" disabled={formData.tags.length >= 10} />
                    <Button onClick={addTag} size="sm" variant="outline" disabled={!currentTag.trim() || formData.tags.length >= 10}><Plus className="h-4 w-4" /></Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-purple-500/20">{tag}<X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} /></Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CollectionSection>

            {/* Media Section */}
            <CollectionSection
              title="Visual Identity"
              icon={ImageIcon}
              isExpanded={expandedSections.media}
              onToggle={() => toggleSection("media")}
              isCompleted={!!formData.featureImage}
              color="text-blue-400"
              description="Upload feature image"
            >
              <div className="space-y-6">
                <FileUploadArea
                  title="Feature Image"
                  description="1:1 ratio (Square), min 800x800px"
                  file={formData.featureImage}
                  onFileUpload={handleFileUpload}
                  dragActive={dragActive}
                  onDrag={handleDrag}
                  onDrop={handleDrop}
                  required
                  uploadProgress={uploadProgress}
                  error={validationErrors.featureImage}
                />
              </div>
            </CollectionSection>

            {/* Settings */}
            <CollectionSection
              title="Royalties & Earnings"
              icon={DollarSign}
              isExpanded={expandedSections.settings}
              onToggle={() => toggleSection("settings")}
              isCompleted={formData.royaltyPercentage >= 0}
              color="text-green-400"
              description="Configure secondary market royalties"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">Royalty Percentage: {formData.royaltyPercentage}%</Label>
                  <Slider value={[formData.royaltyPercentage]} onValueChange={(value) => setFormData((prev) => ({ ...prev, royaltyPercentage: value[0] }))} max={10} step={0.5} className="w-full" />
                  <p className="text-xs text-gray-400">Percentage of secondary sales revenue.</p>
                </div>
              </div>
            </CollectionSection>

            {/* Programmable IP (Optional) */}
            <div className="pt-4 border-t border-white/10">
              <Button variant="ghost" className="w-full justify-between text-gray-400 hover:text-white" onClick={() => toggleSection("programmableIP")}>
                <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Advanced IP Settings</span>
                <ChevronRight className={cn("w-4 h-4 transition-transform", expandedSections.programmableIP ? "rotate-90" : "")} />
              </Button>
              <AnimatePresence>
                {expandedSections.programmableIP && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pt-4 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Enable Remixing</Label>
                          <p className="text-xs text-gray-400">Allow others to create derivative works</p>
                        </div>
                        <Switch checked={formData.enableRemixing} onCheckedChange={(c) => setFormData(prev => ({ ...prev, enableRemixing: c }))} />
                      </div>

                      {formData.enableRemixing && (
                        <div className="space-y-2 pl-4 border-l border-white/10">
                          <Label>Remix Royalty: {formData.remixRoyalty}%</Label>
                          <Slider value={[formData.remixRoyalty]} onValueChange={(v) => setFormData(prev => ({ ...prev, remixRoyalty: v[0] }))} max={50} step={1} />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Commercial Use</Label>
                          <p className="text-xs text-gray-400">Allow commercial exploitation of assets</p>
                        </div>
                        <Switch checked={formData.allowCommercialUse} onCheckedChange={(c) => setFormData(prev => ({ ...prev, allowCommercialUse: c }))} />
                      </div>

                      <div className="space-y-2">
                        <Label>License Type</Label>
                        <select value={formData.licenseType} onChange={(e) => setFormData(prev => ({ ...prev, licenseType: e.target.value }))} className="w-full p-2 bg-black/40 border border-white/10 rounded text-sm">
                          {licenseTypes.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Social (Optional) */}
            <div className="pt-2 border-t border-white/10">
              <Button variant="ghost" className="w-full justify-between text-gray-400 hover:text-white" onClick={() => toggleSection("social")}>
                <span className="flex items-center gap-2"><Share2 className="w-4 h-4" /> Social Links</span>
                <ChevronRight className={cn("w-4 h-4 transition-transform", expandedSections.social ? "rotate-90" : "")} />
              </Button>
              <AnimatePresence>
                {expandedSections.social && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Website URL" value={formData.website} onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))} className="bg-black/40" />
                        <Input placeholder="Twitter/X Handle" value={formData.twitter} onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))} className="bg-black/40" />
                        <Input placeholder="Discord Invite" value={formData.discord} onChange={(e) => setFormData(prev => ({ ...prev, discord: e.target.value }))} className="bg-black/40" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Submit */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white py-6 text-lg font-semibold disabled:opacity-50" disabled={completionPercentage < 100 || isProcessing}>
                {isProcessing ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Deploying...</> : <><Layers className="h-5 w-5 mr-2" /> Create Collection</>}
              </Button>
            </motion.div>

            <WalletPinDialog
              open={pinOpen}
              onCancel={() => setPinOpen(false)}
              onSubmit={async (pin) => {
                setPinOpen(false)
                if (formData.featureImage) {
                  await createCollection({
                    name: formData.name,
                    symbol: formData.symbol,
                    description: formData.description,
                    category: formData.category,
                    featureImage: formData.featureImage.file,
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
                  }, pin)
                }
              }}
            />
            <CreateWalletDialog
              open={createWalletOpen}
              onOpenChange={setCreateWalletOpen}
            />

            <div className="mt-8">
              <ChipiDebug />
            </div>
          </div>

          {/* Preview Panel */}
          <div className="xl:col-span-4">
            <div className="sticky top-24">
              <CollectionPreview formData={formData} completionPercentage={completionPercentage} previewMode={previewMode} setPreviewMode={setPreviewMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Subcomponents (Shared styling with Drop page)

interface CollectionSectionProps { title: string; icon: any; isExpanded: boolean; onToggle: () => void; isCompleted: any; color: string; description?: string; children: React.ReactNode }
const CollectionSection = ({ title, icon: Icon, isExpanded, onToggle, isCompleted, color, description, children }: CollectionSectionProps) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("glass-effect rounded-2xl border transition-all duration-300", isExpanded ? "border-white/20" : "border-white/10", isCompleted ? "bg-green-500/5 border-green-500/20" : "")}>
    <div className="p-6 cursor-pointer flex items-center justify-between" onClick={onToggle}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg bg-black/40", isCompleted ? "bg-green-500/20" : "")}>{isCompleted ? <Check className="h-5 w-5 text-green-400" /> : <Icon className={cn("h-5 w-5", color)} />}</div>
        <div><h3 className="text-lg font-semibold">{title}</h3>{description && <p className="text-xs text-gray-500">{description}</p>}</div>
      </div>
      <ChevronRight className={cn("h-5 w-5 transition-transform duration-200", isExpanded ? "rotate-90" : "")} />
    </div>
    <AnimatePresence>{isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden"><div className="px-6 pb-6 space-y-4 border-t border-white/10">{children}</div></motion.div>)}</AnimatePresence>
  </motion.div>
)

interface FileUploadAreaProps { title: string; description: string; file: { url: string; name: string } | undefined | null; onFileUpload: (file: File) => void; dragActive: boolean; onDrag: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void; required?: boolean; uploadProgress?: number; error?: string }
const FileUploadArea = ({ title, description, file, onFileUpload, dragActive, onDrag, onDrop, required = false, uploadProgress = 0, error }: FileUploadAreaProps) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-1">{title}{required && <span className="text-red-400">*</span>}</Label>
    <div className={cn("border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer", dragActive ? "border-purple-400 bg-purple-400/10" : "border-gray-600 hover:border-gray-500", file ? "border-green-400 bg-green-400/10" : "", error ? "border-red-400 bg-red-400/10" : "")} onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop} onClick={() => document.getElementById(`file-${title}`)?.click()}>
      <input id={`file-${title}`} type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])} />
      {file ? (<div className="space-y-2"><img src={file.url || "/placeholder.svg"} alt={title} className="w-16 h-16 object-cover rounded-lg mx-auto" /><p className="text-sm text-green-400 font-medium">{file.name}</p></div>) : (<div className="space-y-2"><Upload className="h-8 w-8 mx-auto text-gray-400" /><p className="text-sm text-gray-400">{description}</p><p className="text-xs text-gray-500">Click or drag to upload</p></div>)}
      {uploadProgress > 0 && uploadProgress < 100 && <p className="text-xs text-purple-400 mt-1">{uploadProgress}%</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  </div>
)

interface CollectionPreviewProps { formData: CollectionFormData; completionPercentage: number; previewMode: string; setPreviewMode: (mode: string) => void }
const CollectionPreview = ({ formData, completionPercentage }: CollectionPreviewProps) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-effect rounded-2xl p-6 border border-white/10 space-y-6">
    <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Collection Preview</h3><Badge variant="secondary" className={cn("bg-purple-500/20", completionPercentage === 100 && "bg-green-500/20")}>{completionPercentage}% Ready</Badge></div>
    <div className="space-y-4 overflow-hidden rounded-xl border border-white/10 bg-black/40">
      {/* Feature Image as Main Display */}
      <div className="relative aspect-square overflow-hidden rounded-lg m-4 mb-0 group">
        {formData.featureImage ?
          <img src={formData.featureImage.url || "/placeholder.svg"} alt="Feature" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> :
          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex flex-col items-center justify-center text-center p-6">
            <ImageIcon className="h-12 w-12 text-gray-600 mb-2" />
            <p className="text-xs text-gray-500">Feature Image</p>
          </div>
        }
        {/* Overlay details */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.category && <Badge className="bg-purple-500/80 backdrop-blur-md border-0">{formData.category}</Badge>}
            {formData.symbol && <Badge variant="outline" className="text-white border-white/30 backdrop-blur-md">{"$" + formData.symbol}</Badge>}
          </div>

          <h4 className="text-2xl font-bold text-white mb-1 leading-tight">{formData.name || "Collection Name"}</h4>
          <p className="text-gray-300 text-sm line-clamp-2">{formData.description || "Your collection description will appear here..."}</p>

          {/* Stats */}
          {formData.royaltyPercentage > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-xs text-gray-400">
              <DollarSign className="w-3 h-3" />
              <span>{formData.royaltyPercentage}% Royalty</span>
            </div>
          )}
        </div>
      </div>

      {/* Attribution / License Preview */}
      <div className="px-4 pb-4">
        {formData.licenseType && (
          <div className="mt-2 flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10 text-xs text-gray-400">
            <Copyright className="w-3 h-3" />
            <span>{formData.licenseType}</span>
            <span className="flex-1 text-right">{formData.allowCommercialUse ? "Commercial" : "Non-Comm."}</span>
          </div>
        )}
      </div>
    </div>
  </motion.div>
)
