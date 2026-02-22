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
    Loader2,
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Label } from "@/src/components/ui/label"
import { useToast } from "@/src/components/ui/use-toast"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/src/components/ui/sheet"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/src/components/ui/accordion"
import { useMobile } from "@/src/hooks/use-mobile"
import PageTransition from "@/src/components/page-transition"

import { useAuth, useUser } from "@clerk/nextjs"
import { useCallAnyContract } from "@chipi-stack/nextjs"
import { useIpfsUpload } from "@/src/hooks/useIpfs"
import { CONTRACTS } from "@/src/services/constant"
import { PinInput } from "@/src/components/pin-input"
import { CallData, byteArray } from "starknet"
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
    const [eventLocation, setEventLocation] = useState("")
    const [eventDate, setEventDate] = useState("")
    const [customTraits, setCustomTraits] = useState<{ trait_type: string, value: string }[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDragOver, setIsDragOver] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

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
        return assetFile && assetName.length >= 3 && assetDescription.length > 0
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
            const baseAttributes = [
                { trait_type: "Type", value: "event" },
                { trait_type: "Platform", value: "Medialane" },
            ]

            if (eventLocation.trim()) baseAttributes.push({ trait_type: "Location", value: eventLocation.trim() })
            if (eventDate) baseAttributes.push({ trait_type: "Date", value: eventDate })

            // Filter out empty custom traits
            const validCustomTraits = customTraits.filter(t => t.trait_type.trim() !== "" && t.value.trim() !== "")

            const metadata = {
                name: assetName,
                description: assetDescription,
                image: "", // Will be replaced by IPFS URL of assetFile
                external_url: "https://medialane.xyz",
                attributes: [...baseAttributes, ...validCustomTraits],
                properties: {
                    creator: publicKey,
                    registration_date: new Date().toISOString().split("T")[0],
                },
            }

            // Upload both file and metadata to IPFS
            const result = await uploadToIpfs(assetFile, metadata)

            // Format parameters to Starknet types and compile to raw felts
            const formattedCalldata = CallData.compile([
                byteArray.byteArrayFromString(assetName), // name
                byteArray.byteArrayFromString("DROP"), // symbol
                byteArray.byteArrayFromString(result.cid), // base_uri
            ]);

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
                            calldata: formattedCalldata,
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
            <div className="aspect-square rounded-xl overflow-hidden bg-muted/30 border border-border/50">
                {assetPreview ? (
                    <img src={assetPreview || "/placeholder.svg"} alt="Drop preview" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <ImageIcon className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Upload file to preview</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Asset Info */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-1">{assetName || "Untitled Drop"}</h3>
                    <Badge variant="secondary" className="text-xs font-normal">Mint Drop</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {assetDescription || "Add a description to see it here..."}
                </p>
            </div>

            {/* Benefits */}
            <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    Frictionless Mint
                </h4>
                <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/80"></div>
                        <span>Zero gas fees for claimants</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/80"></div>
                        <span>Seamless ChipiPay onboarding</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500/80"></div>
                        <span>ERC-721 Starknet Standard</span>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                {/* Mobile Header */}
                {isMobile && (
                    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
                        <div className="flex items-center justify-between px-4 py-3">
                            <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <h1 className="text-base font-medium">Setup Mint Drop</h1>
                            <Sheet open={showPreview} onOpenChange={setShowPreview}>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
                                    <SheetHeader className="mb-4">
                                        <SheetTitle className="text-left">Live Preview</SheetTitle>
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
                    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
                        <div className="flex flex-col mb-2 max-w-2xl">
                            <Badge variant="secondary" className="w-fit mb-4 font-normal text-xs px-3 py-1">
                                <Sparkles className="w-3 h-3 mr-2 text-primary" />
                                Exclusive Drop
                            </Badge>
                            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-foreground">
                                Setup Your Mint Drop
                            </h1>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Launch a frictionless ERC721 mint page for milestones or exclusive rewards powered by our IP Collections Protocol.
                            </p>
                        </div>
                    </div>
                )}

                <div className={`${isMobile ? "px-4 pb-20 mt-6" : "px-4 md:px-8 pb-24 md:pb-32"}`}>
                    <div className={`max-w-6xl mx-auto ${isMobile ? "" : "grid grid-cols-1 lg:grid-cols-3 gap-10 items-start"}`}>
                        {/* Main Form */}
                        <div className={isMobile ? "" : "lg:col-span-2 space-y-8"}>

                            <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
                                <CardContent className={`${isMobile ? "p-5" : "p-8"} space-y-8`}>
                                    {/* Upload Section */}
                                    <div className="space-y-4">
                                        <div className="flex flex-col mb-1">
                                            <h2 className="text-lg font-semibold text-foreground">Drop Media</h2>
                                            <p className="text-sm text-muted-foreground">Upload the cover file representing your drop</p>
                                        </div>

                                        {!assetFile ? (
                                            <div
                                                className={`border-2 border-dashed rounded-xl ${isMobile ? "p-8" : "p-12"} text-center transition-all duration-200 ${isDragOver
                                                    ? "border-primary bg-muted/50 scale-[1.01]"
                                                    : "border-border/60 hover:border-border hover:bg-muted/30"
                                                    }`}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                            >
                                                <div className="space-y-4">
                                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground mb-1">
                                                            {isMobile ? "Tap to upload media" : "Drag and drop your media here"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
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
                                            <div className="relative group w-full aspect-video sm:aspect-[2/1] rounded-xl overflow-hidden border border-border/50 bg-black/5 flex items-center justify-center">
                                                {assetPreview ? (
                                                    <img src={assetPreview} alt="Uploaded Media Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                                        <span className="text-sm font-medium text-muted-foreground">{assetFile.name} ({(assetFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setAssetFile(null)
                                                            setAssetPreview(null)
                                                        }}
                                                        className="shadow-xl"
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Remove Media
                                                    </Button>
                                                </div>

                                                {/* Mobile quick-remove (visible without hover) */}
                                                {isMobile && (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        onClick={() => {
                                                            setAssetFile(null)
                                                            setAssetPreview(null)
                                                        }}
                                                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Drop Details */}
                                    <div className="space-y-4 pt-2">
                                        <div className="flex flex-col mb-1">
                                            <h2 className="text-lg font-semibold text-foreground">Drop Details</h2>
                                            <p className="text-sm text-muted-foreground">Configure the metadata for your new collection</p>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="assetName" className="text-sm font-medium text-foreground">
                                                    Drop Name <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="assetName"
                                                    placeholder="E.g., Devcon Attendance, Hacker House Access"
                                                    value={assetName}
                                                    onChange={(e) => setAssetName(e.target.value)}
                                                    className="h-11 bg-background"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="assetDescription" className="text-sm font-medium text-foreground">
                                                    Description <span className="text-destructive">*</span>
                                                </Label>
                                                <Textarea
                                                    id="assetDescription"
                                                    placeholder="Describe the milestone or event for this mint drop..."
                                                    rows={4}
                                                    value={assetDescription}
                                                    onChange={(e) => setAssetDescription(e.target.value)}
                                                    className="resize-none bg-background"
                                                />
                                                <div className="flex justify-end">
                                                    <p className="text-xs text-muted-foreground">{assetDescription.length}/500</p>
                                                </div>
                                            </div>

                                            {/* Advanced Details Accordion */}
                                            <Accordion type="single" collapsible className="w-full pt-2">
                                                <AccordionItem value="advanced-details" className="border-border/50">
                                                    <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span>Advanced Details (Optional)</span>
                                                            <span className="text-xs text-muted-foreground font-normal overflow-hidden whitespace-nowrap overflow-ellipsis">Add specific attributes to your drop metadata</span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="space-y-6 pt-4 pb-2">

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="eventLocation" className="text-sm font-medium text-foreground">
                                                                    Location
                                                                </Label>
                                                                <Input
                                                                    id="eventLocation"
                                                                    placeholder="e.g. Bogota, Colombia"
                                                                    value={eventLocation}
                                                                    onChange={(e) => setEventLocation(e.target.value)}
                                                                    className="h-10 bg-background"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label htmlFor="eventDate" className="text-sm font-medium text-foreground">
                                                                    Date
                                                                </Label>
                                                                <Input
                                                                    id="eventDate"
                                                                    type="date"
                                                                    value={eventDate}
                                                                    onChange={(e) => setEventDate(e.target.value)}
                                                                    className="h-10 bg-background"
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* Custom Traits Section */}
                                                        <div className="space-y-3 pt-4 border-t border-border/50">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <Label className="text-sm font-medium text-foreground">Other Custom Traits</Label>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => setCustomTraits([...customTraits, { trait_type: "", value: "" }])}
                                                                    className="text-xs"
                                                                >
                                                                    <Plus className="h-3 w-3 mr-1" /> Add Trait
                                                                </Button>
                                                            </div>

                                                            {customTraits.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {customTraits.map((trait, index) => (
                                                                        <div key={index} className="flex items-center gap-2">
                                                                            <Input
                                                                                placeholder="Type (e.g. Tier)"
                                                                                value={trait.trait_type}
                                                                                onChange={(e) => {
                                                                                    const newTraits = [...customTraits];
                                                                                    newTraits[index].trait_type = e.target.value;
                                                                                    setCustomTraits(newTraits);
                                                                                }}
                                                                                className="h-9 bg-background text-sm"
                                                                            />
                                                                            <Input
                                                                                placeholder="Value (e.g. VIP)"
                                                                                value={trait.value}
                                                                                onChange={(e) => {
                                                                                    const newTraits = [...customTraits];
                                                                                    newTraits[index].value = e.target.value;
                                                                                    setCustomTraits(newTraits);
                                                                                }}
                                                                                className="h-9 bg-background text-sm"
                                                                            />
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                                                                                onClick={() => {
                                                                                    const newTraits = [...customTraits];
                                                                                    newTraits.splice(index, 1);
                                                                                    setCustomTraits(newTraits);
                                                                                }}
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-4 rounded-xl border border-dashed border-border text-sm text-muted-foreground bg-muted/20">
                                                                    Click 'Add Trait' to define extra key-value pairs.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </div>
                                    </div>

                                    {/* Desktop Create Button */}
                                    {!isMobile && (
                                        <div className="pt-6 border-t border-border/50">
                                            <Button
                                                size="lg"
                                                onClick={handleSubmit}
                                                disabled={!isFormValid() || isSubmitting}
                                                className="w-full text-base font-medium h-12 rounded-xl"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Deploying Drop...
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
                                </CardContent>
                            </Card>
                        </div>

                        {/* Desktop Preview Panel */}
                        {!isMobile && (
                            <div className="lg:col-span-1">
                                <div className="sticky top-24 space-y-6">
                                    <div className="flex flex-col space-y-4">
                                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Preview</h3>
                                        <PreviewContent />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Bottom Action Bar */}
                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border/50 p-4">
                        <Button
                            size="lg"
                            onClick={handleSubmit}
                            disabled={!isFormValid() || isSubmitting}
                            className="w-full text-base font-medium h-12 rounded-xl"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deploying...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Launch Drop
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
