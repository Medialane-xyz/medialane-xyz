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
    Shuffle,
    DollarSign,
    Loader2,
    X,
    CalendarClock,
    Eye,
    Rocket,
    Lock,
    Users
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

// Define types for Drop
interface DropFormData {
    name: string
    description: string
    category: string
    tags: string[]
    featureImage: { file: File; url: string; name: string; type: string; size: number } | undefined
    royaltyPercentage: number
    mintPrice: number
    currency: string

    // Drop Specific
    maxSupply: number | undefined // undefined for unlimited
    isLimited: boolean
    presaleEnabled: boolean
    presaleDate: string
    publicSaleDate: string
    revealEnabled: boolean
    revealDate: string
    placeholderImage: { file: File; url: string; name: string; type: string; size: number } | undefined

    // Programmable IP
    enableRemixing: boolean
    remixRoyalty: number
    allowCommercialUse: boolean
    requireAttribution: boolean
    licenseType: string

    // Social
    website: string
    twitter: string
    discord: string
}

export default function CreateDropCollectionPage() {
    const { toast } = useToast()
    const isMobile = useMobile()
    // const { createCollection, isProcessing } = useCreateCollection() // Temporarily disabled for debugging
    const isProcessing = false

    const [formData, setFormData] = useState<DropFormData>({
        // Basic Information
        name: "",
        description: "",
        category: "",
        tags: [],

        // Media
        featureImage: undefined,
        placeholderImage: undefined,

        // Collection Settings
        royaltyPercentage: 5,
        mintPrice: 0.1,
        currency: "ETH",

        // Drop Specific
        isLimited: true,
        maxSupply: 10000,
        presaleEnabled: true,
        presaleDate: "",
        publicSaleDate: "",
        revealEnabled: true,
        revealDate: "",

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
        dropSettings: true, // New section
        monetization: false,
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

    // Calculate completion percentage
    const calculateCompletion = () => {
        let completed = 0
        let total = 5 // Reduced since banner is gone
        if (formData.name && formData.description) completed++
        if (formData.featureImage) completed++
        if (formData.category) completed++
        if (formData.publicSaleDate) completed++
        if (!formData.isLimited || (formData.isLimited && (formData.maxSupply || 0) > 0)) completed++
        return Math.round((completed / total) * 100)
    }

    const completionPercentage = calculateCompletion()

    // Validation
    const validateForm = useCallback(() => {
        const errors: Record<string, string> = {}
        if (!formData.name.trim()) errors.name = "Collection name is required"
        if (!formData.description.trim()) errors.description = "Description is required"
        if (!formData.category) errors.category = "Category is required"
        if (!formData.featureImage) errors.featureImage = "Feature image is required"
        if (!formData.publicSaleDate) errors.publicSaleDate = "Public sale date is required"
        if (formData.isLimited && (formData.maxSupply === undefined || formData.maxSupply <= 0)) errors.maxSupply = "Max supply must be greater than 0"
        if (formData.revealEnabled && !formData.placeholderImage) errors.placeholderImage = "Placeholder image is required for delayed reveal"

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }, [formData])

    // Handle file upload (Reuse existing logic)
    const handleFileUpload = async (file: File, type: "featureImage" | "placeholderImage") => {
        setIsUploading(true)
        setUploadProgress((prev) => ({ ...prev, [type]: 0 }))

        if (!file.type.startsWith("image/")) {
            toast({ title: "Invalid File Type", description: "Please upload an image file", variant: "destructive" })
            setIsUploading(false)
            return
        }

        if (file.size > 10 * 1024 * 1024) {
            toast({ title: "File Too Large", description: "Please upload an image smaller than 10MB", variant: "destructive" })
            setIsUploading(false)
            return
        }

        // Simulate upload
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
                            url: URL.createObjectURL(file), // Local preview
                        },
                    }))
                    return { ...prev, [type]: 100 }
                }
                return { ...prev, [type]: currentProgress + 10 }
            })
        }, 100)
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
        else if (e.type === "dragleave") setDragActive(false)
    }

    const handleDrop = (e: React.DragEvent, type: "featureImage" | "placeholderImage") => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0], type)
    }

    const addTag = () => {
        if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 10) {
            setFormData((prev) => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }))
            setCurrentTag("")
        }
    }

    const removeTag = (tagToRemove: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }))
    }

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
    }

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" })
            return
        }
        // Logic to submit Drop data would go here
        toast({ title: "Drop Created", description: "Your drop has been scheduled!" })
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
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-3">
                                <Rocket className="w-4 h-4" /> Drop Launchpad
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                                Launch a Collection Drop
                            </h1>
                            <p className="text-gray-400 text-lg max-w-2xl">
                                Schedule a multi-phase release with allowlists, reveals, and limited supplies.
                            </p>
                        </motion.div>

                        {/* Essential Fields Section */}
                        <CollectionSection
                            title="Drop Information"
                            icon={FileText}
                            isExpanded={expandedSections.basic}
                            onToggle={() => toggleSection("basic")}
                            isCompleted={formData.name && formData.description && formData.category}
                            color="text-purple-400"
                            description="Name, description, and category"
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2">Collection Name <span className="text-red-400">*</span></Label>
                                    <Input id="name" placeholder="e.g., Cyber Punks 2077" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className={cn("bg-black/40 border-white/10 focus:border-purple-400", validationErrors.name && "border-red-400")} />
                                    {validationErrors.name && <p className="text-xs text-red-400">{validationErrors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="flex items-center gap-2">Description <span className="text-red-400">*</span></Label>
                                    <Textarea id="description" placeholder="Tell the story behind your drop..." value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} className={cn("bg-black/40 border border-white/10 rounded-lg text-white focus:border-purple-400 min-h-[100px]", validationErrors.description && "border-red-400")} />
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

                        {/* Drop Mechanics & Schedule */}
                        <CollectionSection
                            title="Drop Mechanics & Schedule"
                            icon={CalendarClock}
                            isExpanded={expandedSections.dropSettings}
                            onToggle={() => toggleSection("dropSettings")}
                            isCompleted={formData.publicSaleDate && (!formData.isLimited || (formData.maxSupply || 0) > 0)}
                            color="text-pink-400"
                            description="Supply, phases, and reveal settings"
                        >
                            <div className="space-y-6">
                                {/* Supply Settings */}
                                <div className="space-y-4 border-b border-white/10 pb-6">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-base">Limited Supply</Label>
                                        <Switch checked={formData.isLimited} onCheckedChange={(c) => setFormData(prev => ({ ...prev, isLimited: c }))} />
                                    </div>
                                    {formData.isLimited && (
                                        <div className="space-y-2">
                                            <Label>Max Supply (Total Items)</Label>
                                            <Input type="number" value={formData.maxSupply || ""} onChange={(e) => setFormData(prev => ({ ...prev, maxSupply: parseInt(e.target.value) || 0 }))} className="bg-black/40 border-white/10 focus:border-pink-400" />
                                            <p className="text-xs text-gray-400">Fixed number of items in this drop.</p>
                                        </div>
                                    )}
                                    {!formData.isLimited && <p className="text-sm text-yellow-400">Open Edition: Unlimited items can be minted.</p>}
                                </div>

                                {/* Schedule */}
                                <div className="space-y-4 border-b border-white/10 pb-6">
                                    <h4 className="font-medium text-pink-400">Mint Schedule</h4>

                                    {/* Presale */}
                                    <div className="p-4 bg-black/40 rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Lock className="w-4 h-4 text-pink-400" />
                                                <Label>Presale / Allowlist Stage</Label>
                                            </div>
                                            <Switch checked={formData.presaleEnabled} onCheckedChange={(c) => setFormData(prev => ({ ...prev, presaleEnabled: c }))} />
                                        </div>
                                        {formData.presaleEnabled && (
                                            <div className="space-y-2 pl-6 border-l-2 border-pink-500/20">
                                                <Label>Start Date & Time</Label>
                                                <Input type="datetime-local" value={formData.presaleDate} onChange={(e) => setFormData(prev => ({ ...prev, presaleDate: e.target.value }))} className="bg-black/20 border-white/10" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Public Sale */}
                                    <div className="p-4 bg-black/40 rounded-lg space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-green-400" />
                                                <Label>Public Sale Stage</Label>
                                            </div>
                                            {/* Always enabled for drops usually, but maybe togglable */}
                                        </div>
                                        <div className="space-y-2 pl-6 border-l-2 border-green-500/20">
                                            <Label>Start Date & Time <span className="text-red-400">*</span></Label>
                                            <Input type="datetime-local" value={formData.publicSaleDate} onChange={(e) => setFormData(prev => ({ ...prev, publicSaleDate: e.target.value }))} className="bg-black/20 border-white/10" />
                                        </div>
                                    </div>
                                </div>

                                {/* Reveal */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-cyan-400" />
                                            <Label>Delayed Reveal</Label>
                                        </div>
                                        <Switch checked={formData.revealEnabled} onCheckedChange={(c) => setFormData(prev => ({ ...prev, revealEnabled: c }))} />
                                    </div>
                                    <p className="text-xs text-gray-400">Hide stats and artwork until a specific date.</p>
                                    {formData.revealEnabled && (
                                        <div className="space-y-2 mt-2">
                                            <Label>Reveal Date</Label>
                                            <Input type="datetime-local" value={formData.revealDate} onChange={(e) => setFormData(prev => ({ ...prev, revealDate: e.target.value }))} className="bg-black/40 border-white/10 focus:border-cyan-400" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CollectionSection>

                        {/* Media Section (Same as before) */}
                        {/* Media Section */}
                        <CollectionSection
                            title="Artwork & Media"
                            icon={ImageIcon}
                            isExpanded={expandedSections.media}
                            onToggle={() => toggleSection("media")}
                            isCompleted={!!formData.featureImage}
                            color="text-blue-400"
                            description="Upload feature image and pre-reveal placeholder"
                        >
                            <div className="space-y-6">
                                <FileUploadArea
                                    title="Feature Image"
                                    description="1:1 ratio (Square), min 800x800px"
                                    file={formData.featureImage}
                                    onFileUpload={(file) => handleFileUpload(file, "featureImage")}
                                    dragActive={dragActive}
                                    onDrag={handleDrag}
                                    onDrop={(e) => handleDrop(e, "featureImage")}
                                    required
                                    uploadProgress={uploadProgress.featureImage}
                                    error={validationErrors.featureImage}
                                />

                                <div className={cn("p-6 rounded-lg border transition-all duration-300", formData.revealEnabled ? "bg-cyan-500/5 border-cyan-500/20 opacity-100" : "bg-zinc-900/50 border-zinc-800 opacity-50 pointer-events-none")}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Eye className="w-5 h-5 text-cyan-400" />
                                        <Label className="text-base text-cyan-100">Pre-reveal Placeholder</Label>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-6">
                                        {formData.revealEnabled
                                            ? "This image will be displayed for all tokens until the reveal date. Make sure it builds hype!"
                                            : "Enable 'Delayed Reveal' in the schedule settings to use a placeholder."}
                                    </p>
                                    {formData.revealEnabled && (
                                        <FileUploadArea
                                            title="Placeholder Image"
                                            description="1:1 ratio (Hidden Content)"
                                            file={formData.placeholderImage}
                                            onFileUpload={(file) => handleFileUpload(file, "placeholderImage")}
                                            dragActive={dragActive}
                                            onDrag={handleDrag}
                                            onDrop={(e) => handleDrop(e, "placeholderImage")}
                                            required
                                            uploadProgress={uploadProgress.placeholderImage}
                                            error={validationErrors.placeholderImage}
                                        />
                                    )}
                                </div>
                            </div>
                        </CollectionSection>

                        {/* Monetization Settings */}
                        <CollectionSection
                            title="Mint Price & Royalties"
                            icon={DollarSign}
                            isExpanded={expandedSections.monetization}
                            onToggle={() => toggleSection("monetization")}
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
                                                <Input id="mintPrice" type="number" step="0.001" value={formData.mintPrice} onChange={(e) => setFormData((prev) => ({ ...prev, mintPrice: Number.parseFloat(e.target.value) || 0 }))} className="bg-black/40 border-white/10 focus:border-green-400" min="0" />
                                                <select value={formData.currency} onChange={(e) => setFormData((prev) => ({ ...prev, currency: e.target.value }))} className="p-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-green-400">
                                                    <option value="ETH">ETH</option>
                                                    <option value="STRK">STRK</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">Secondary Royalty: {formData.royaltyPercentage}%</Label>
                                        <Slider value={[formData.royaltyPercentage]} onValueChange={(value) => setFormData((prev) => ({ ...prev, royaltyPercentage: value[0] }))} max={10} step={0.5} className="w-full" />
                                    </div>
                                </div>
                            </div>
                        </CollectionSection>

                        {/* Submit */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4">
                            <Button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white py-6 text-lg font-semibold disabled:opacity-50" disabled={completionPercentage < 100 || isProcessing}>
                                {isProcessing ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Launching...</> : <><Rocket className="h-5 w-5 mr-2" /> Launch Drop</>}
                            </Button>
                            <Button variant="outline" className="px-8 py-6 bg-transparent" disabled={isProcessing}>Save Draft</Button>
                        </motion.div>
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

// Subcomponents (reused/adapted)

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

interface CollectionPreviewProps { formData: DropFormData; completionPercentage: number; previewMode: string; setPreviewMode: (mode: string) => void }
const CollectionPreview = ({ formData, completionPercentage }: CollectionPreviewProps) => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-effect rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Drop Preview</h3><Badge variant="secondary" className={cn("bg-purple-500/20", completionPercentage === 100 && "bg-green-500/20")}>{completionPercentage}% Ready</Badge></div>
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
                    {formData.category && <Badge className="self-start mb-2 bg-purple-500/80 backdrop-blur-md border-0">{formData.category}</Badge>}

                    <h4 className="text-2xl font-bold text-white mb-1 leading-tight">{formData.name || "Collection Name"}</h4>
                    <p className="text-gray-300 text-sm line-clamp-2">{formData.description || "Your drop description will appear here..."}</p>


                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/20">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Price</span>
                            <span className="text-base font-bold text-white">{formData.mintPrice} {formData.currency}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Launch</span>
                            <span className="text-base font-bold text-green-400">
                                {formData.publicSaleDate ? new Date(formData.publicSaleDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "TBA"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Supply Badge */}
                {formData.isLimited && <div className="absolute top-4 right-4"><Badge className="bg-black/60 backdrop-blur-md border border-white/10">{formData.maxSupply} Items</Badge></div>}
            </div>

            {/* Additional Info / Placeholder Preview */}
            <div className="px-4 pb-4">
                {formData.revealEnabled && (
                    <div className="flex items-center gap-3 p-3 bg-cyan-950/30 rounded-lg border border-cyan-900/50 mt-2">
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-cyan-900/50 flex items-center justify-center">
                            {formData.placeholderImage ? <img src={formData.placeholderImage.url} className="w-full h-full object-cover opacity-50" /> : <Eye className="w-4 h-4 text-cyan-500/50" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-cyan-200">Hidden until reveal</p>
                            <p className="text-[10px] text-cyan-500/70 truncate">{formData.revealDate ? `Reveals ${new Date(formData.revealDate).toLocaleDateString()}` : "Set reveal date"}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </motion.div>
)
