"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    Upload,
    FileText,
    ImageIcon,
    X,
    Sparkles,
    Zap,
    ArrowLeft,
    Eye,
    Check,
    Plus,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Label } from "@/src/components/ui/label"
import { useToast } from "@/src/components/ui/use-toast"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/src/components/ui/sheet"
import { useMobile } from "@/src/hooks/use-mobile"
import PageTransition from "@/src/components/page-transition"
import { CollectionSelector } from "@/src/components/collection-selector"

import { useAuth, useUser } from "@clerk/nextjs"
import { useCallAnyContract } from "@chipi-stack/nextjs"
import { useIpfsUpload } from "@/src/hooks/useIpfs"
import { CONTRACTS } from "@/src/services/constant"
import { PinInput } from "@/src/components/pin-input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/src/components/ui/dialog"

export default function CreateMintDropPage() {
    const [assetFile, setAssetFile] = useState<File | null>(null)
    const [assetPreview, setAssetPreview] = useState<string | null>(null)
    const [assetName, setAssetName] = useState("")
    const [assetDescription, setAssetDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null)

    const router = useRouter()
    const { toast } = useToast()
    const isMobile = useMobile()

    const { getToken } = useAuth()
    const { user } = useUser()
    const publicKey = user?.publicMetadata?.publicKey as string
    const encryptedPrivateKey = user?.publicMetadata?.encryptedPrivateKey as string

    const { callAnyContractAsync } = useCallAnyContract()
    const { uploadToIpfs } = useIpfsUpload()

    const [showPinDialog, setShowPinDialog] = useState(false)
    const [isPinSubmitting, setIsPinSubmitting] = useState(false)
    const [pinError, setPinError] = useState("")

    const handleFileChange = useCallback(
        (file: File) => {
            setAssetFile(file)

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
        return assetFile && assetName.length >= 3 && assetDescription.length >= 10
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

        if (!user) {
            toast({
                title: "Wallet not connected",
                description: "Please login to launch a Drop.",
                variant: "destructive",
            })
            return
        }

        setShowPinDialog(true)
    }

    const handlePinSubmit = async (pin: string) => {
        if (!user || !assetFile) {
            setPinError("Wallet data or file not available")
            return
        }

        setIsPinSubmitting(true)
        setPinError("")
        setIsSubmitting(true)

        try {
            const token = await getToken({
                template: process.env.NEXT_PUBLIC_CLERK_TEMPLATE_NAME,
            })

            if (!token) {
                throw new Error("No bearer token found. Please try to login again.")
            }

            // Create metadata object
            const metadata = {
                name: assetName,
                description: assetDescription,
                image: "", // Will be replaced by IPFS URL of assetFile
                external_url: "https://medialane.xyz",
                attributes: [
                    { trait_type: "Type", value: "event" },
                    { trait_type: "Platform", value: "Medialane" },
                ],
                properties: {
                    creator: publicKey,
                    registration_date: new Date().toISOString().split("T")[0],
                },
            }

            // Upload both file and metadata to IPFS
            const result = await uploadToIpfs(assetFile, metadata)

            // Call create_collection on factory
            const txHash = await callAnyContractAsync({
                params: {
                    encryptKey: pin,
                    wallet: {
                        publicKey: publicKey,
                        encryptedPrivateKey: encryptedPrivateKey,
                    },
                    contractAddress: CONTRACTS.COLLECTION_FACTORY,
                    calls: [
                        {
                            contractAddress: CONTRACTS.COLLECTION_FACTORY,
                            entrypoint: "create_collection",
                            calldata: [
                                assetName, // name
                                "DROP",    // symbol
                                result.cid, // base_uri
                            ],
                        },
                    ],
                },
                bearerToken: token,
            })

            if (txHash) {
                setShowPinDialog(false)
                toast({
                    title: "Mint Drop Created! 🎉",
                    description: "Your Mint Drop has been deployed to Starknet. Please allow a few minutes for the blockchain indexer to catch up.",
                })

                // Redirect to portfolio
                setTimeout(() => {
                    router.push("/mint/portfolio")
                }, 3000)
            }
        } catch (error) {
            console.error("Deployment failed:", error)
            setPinError(error instanceof Error ? error.message : "Deployment failed")
            toast({
                title: "Deployment Failed",
                description: "PIN incorrect or network error. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsPinSubmitting(false)
            setIsSubmitting(false)
        }
    }

    const PreviewContent = () => (
        <div className="space-y-4">
            {/* NFT Preview */}
            <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10">
                {assetPreview ? (
                    <img src={assetPreview || "/placeholder.svg"} alt="Drop preview" className="w-full h-full object-cover" />
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
                    <h3 className="font-bold text-lg">{assetName || "Untitled Drop"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge className="text-xs bg-primary/20 text-primary border-primary/20">Mint Drop</Badge>
                    </div>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                    {assetDescription || "Add a description to see it here..."}
                </p>
            </div>

            {/* Benefits */}
            <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Frictionless Mint
                </h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span>Zero gas fees for claimants</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span>Seamless ChipiPay onboarding</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span>ERC-721 Starknet Standard</span>
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
                            <h1 className="text-lg font-semibold">Setup Mint Drop</h1>
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
                            <span className="text-sm font-medium">Exclusive Drop</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
                            Setup Your Mint Drop
                        </h1>
                        <p className="text-sm text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                            Launch a frictionless ERC721 mint page for milestones or exclusive rewards powered by our IP Collections Protocol.
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
                                        <span className="text-xs font-medium">Mint Drop</span>
                                    </div>
                                    <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
                                        Create Exclusive Mint
                                    </h1>
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
                                                <h2 className={`${isMobile ? "text-base" : "text-xl"} font-semibold`}>Drop Media</h2>
                                                <p className="text-xs text-zinc-400">Choose the file representing your drop</p>
                                            </div>
                                        </div>

                                        {!assetFile ? (
                                            <div
                                                className={`border-2 border-dashed rounded-xl ${isMobile ? "p-6" : "p-12"} text-center transition-all duration-300 ${isDragOver
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
                                                            {isMobile ? "Tap to upload" : "Drag and drop your media here"}
                                                        </p>
                                                        <p className="text-zinc-400 mb-4 text-sm">
                                                            {!isMobile && "or "}
                                                            <label className="text-primary cursor-pointer hover:underline font-medium">
                                                                browse files
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*,video/*"
                                                                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                                                                />
                                                            </label>
                                                        </p>
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

                                    {/* Drop Details */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h2 className={`${isMobile ? "text-base" : "text-xl"} font-semibold`}>Drop Details</h2>
                                                <p className="text-xs text-zinc-400">Name and description</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="assetName" className="text-sm font-medium">
                                                    Drop Name <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="assetName"
                                                    placeholder="E.g., Devcon Attendance, Hacker House Access"
                                                    value={assetName}
                                                    onChange={(e) => setAssetName(e.target.value)}
                                                    className={`${isMobile ? "h-11" : "h-12"} text-sm`}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="assetDescription" className="text-sm font-medium">
                                                    Description <span className="text-red-500">*</span>
                                                </Label>
                                                <Textarea
                                                    id="assetDescription"
                                                    placeholder="Describe the milestone or event for this mint drop..."
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
                                        </div>
                                    </div>

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
                                                        Deploying Match Drop...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="mr-3 h-6 w-6" />
                                                        Launch Mint Drop
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
                                    Deploying...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Launch Mint Drop
                                </>
                            )}
                        </Button>
                    </div>
                )}

                <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="sr-only">Confirm Deployment</DialogTitle>
                            <DialogDescription className="sr-only">Enter your wallet PIN to confirm the collection deployment.</DialogDescription>
                        </DialogHeader>
                        <PinInput
                            onSubmit={handlePinSubmit}
                            isLoading={isPinSubmitting}
                            error={pinError}
                            title="Enter Wallet PIN"
                            description="This transaction creates a new ERC721 collection."
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </PageTransition>
    )
}
