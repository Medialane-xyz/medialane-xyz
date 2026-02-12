"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import {
    Share2, Copy, Flag, ShoppingCart,
    HandshakeIcon, GitBranch, Zap, Eye, Loader2,
    Sparkles, ImageIcon, TrendingUp, History, ShieldCheck, Scale, FileText, Info, Globe
} from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Badge } from "@/src/components/ui/badge"
import { RemixGenealogyTree } from "@/src/components/remix-genealogy-tree"
import { useToken, useTokenByAddress } from "@/src/lib/hooks/use-collection-tokens"
import { ListingDialog } from "@/src/components/listing-dialog"
import { AssetsSkeleton } from "@/src/components/assets-skeleton"
import { useAuth, useUser } from "@clerk/nextjs"
import { useGetWallet } from "@chipi-stack/nextjs"

// Glass Stat Card Component
const GlassStatCard = ({ label, value, icon, subtext }: { label: string, value: string | number, icon?: React.ReactNode, subtext?: string }) => (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 transition-all hover:border-primary/30 group hover:shadow-lg hover:shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                {icon && <div className="text-muted-foreground/70 group-hover:text-primary transition-colors">{icon}</div>}
            </div>
            <div className="text-2xl font-bold tracking-tight">{value}</div>
            {subtext && <div className="text-xs text-muted-foreground mt-1">{subtext}</div>}
        </div>
    </div>
)

export function AssetDetailPageClient() {
    const params = useParams()
    const router = useRouter()

    const { user } = useUser() // We need useUser to get metadata
    const { userId, getToken } = useAuth()

    // Get wallet from metadata first (faster, reliable for Chipipay)
    const publicKey = user?.publicMetadata?.publicKey as string;

    const { data: walletData } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then((t) => t || ""),
        params: { externalUserId: userId || "" },
        queryOptions: { enabled: !!userId && !publicKey }, // Only fetch if not in metadata
    })

    // Construct account object using metadata key if available, otherwise wallet fetch result
    const account = {
        address: publicKey || (walletData as any)?.wallet?.publicKey
    }

    // Parse the slug array to determine which format we're using
    const slug = params.slug as string[] | undefined

    // Determine if using on-chain address format (2 segments) or legacy format (1 segment)
    const isOnChainFormat = useMemo(() => {
        if (!slug || slug.length === 0) return false
        // On-chain format has exactly 2 segments: [address, tokenId]
        // Address typically starts with 0x and is much longer than a simple ID
        if (slug.length === 2 && slug[0].startsWith("0x")) return true
        return false
    }, [slug])

    // Extract params based on format
    const collectionAddress = isOnChainFormat && slug ? slug[0] : undefined
    const tokenIdFromAddress = isOnChainFormat && slug ? slug[1] : undefined
    const legacyIdentifier = !isOnChainFormat && slug ? slug.join("/") : undefined

    // Use the appropriate hook based on URL format
    const byAddressResult = useTokenByAddress(collectionAddress, tokenIdFromAddress)
    const byIdentifierResult = useToken(legacyIdentifier)

    // Select the appropriate result
    const { token, isLoading, error, collection } = useMemo(() => {
        if (isOnChainFormat) {
            return {
                token: byAddressResult.token,
                isLoading: byAddressResult.isLoading,
                error: byAddressResult.error,
                collection: byAddressResult.collection
            }
        }
        return {
            token: byIdentifierResult.token,
            isLoading: byIdentifierResult.isLoading,
            error: byIdentifierResult.error,
            collection: null
        }
    }, [isOnChainFormat, byAddressResult, byIdentifierResult])



    // Map token to UI model
    const asset = useMemo(() => {
        if (!token) return null
        const effectiveCollectionAddress = collectionAddress || collection?.ipNft || ""
        return {
            id: token.identifier,
            name: token.name || `${token.token_id.toString()}`,
            image: token.image || "/placeholder.svg",
            description: token.description || "No description provided.",
            category: token.attributes?.find((a: any) => a.trait_type === "type")?.value ||
                token.attributes?.find((a: any) => a.trait_type === "category")?.value ||
                "IP",
            rarity: "Unique",
            verified: false,
            views: 0,
            remixCount: 0,
            holders: 1,
            royalty: 5,
            createdAt: Date.now(),
            tokenId: token.token_id.toString(),
            collectionAddress: effectiveCollectionAddress,
            blockchain: "Starknet",
            tags: [],
            attributes: token.attributes || [],
            price: "Not Listed",
            creator: token.owner ? (token.owner.length > 10 ? `${token.owner.slice(0, 6)}...${token.owner.slice(-4)}` : token.owner) : "Unknown",
            ownerAddress: token.owner,
            timeLeft: null,
            isRemix: false,
            collectionName: collection?.name || "Unknown",
            collectionImage: collection?.image
        }
    }, [token, collection, collectionAddress])

    // Determine if current user is owner
    const isOwner = useMemo(() => {
        if (!account?.address || !asset?.ownerAddress) return false
        // Basic normalization for Starknet addresses
        const addr1 = account.address.toLowerCase().replace(/^0x0+/, "0x")
        const addr2 = asset.ownerAddress.toLowerCase().replace(/^0x0+/, "0x")
        return addr1 === addr2
    }, [account, asset])

    const isListed = useMemo(() => asset?.price !== "Not Listed", [asset])

    const handleShare = async () => {
        const shareData = {
            title: `Check out ${asset?.name} on MediaLane`,
            text: `View ${asset?.name} by ${asset?.creator} on MediaLane`,
            url: window.location.href
        }
        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                console.error("Error sharing:", err)
            }
        } else {
            handleCopy()
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href)
        // could add toast here
        alert("Link copied to clipboard!")
    }

    const handleExplorer = () => {
        if (asset?.collectionAddress && asset?.tokenId) {
            // Default to Starkscan for now
            window.open(`https://voyager.online/nft/${asset.collectionAddress}/${asset.tokenId}`, "_blank")
        }
    }

    if (isLoading) {
        return <AssetsSkeleton />
    }

    if (error || !asset || !token) {
        return (
            <div className="min-h-screen flex items-center justify-center pt-20">
                <Card className="w-full max-w-md border-white/10 bg-black/40 backdrop-blur">
                    <CardContent className="p-8 text-center">
                        <h2 className="text-xl font-semibold mb-2">Not Found</h2>
                        <p className="text-muted-foreground mb-6">
                            {error ? error.message : "The asset you're looking for doesn't exist or hasn't been indexed yet."}
                        </p>
                        <Button onClick={() => router.back()}>Go Back</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Build canonical asset URL (always use on-chain format for consistency)
    const assetUrl = asset.collectionAddress
        ? `/assets/${asset.collectionAddress}/${asset.tokenId}`
        : `/assets/${asset.id}`

    return (
        <div className="min-h-screen bg-background pt-20">
            {/* Fixed Background Image with Blur Effect - YouTube Ambient Mode Style */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Ambient Glow */}
                <div className="absolute inset-0 overflow-hidden">
                    <img
                        src={asset.image}
                        alt=""
                        className="w-full h-full object-cover scale-150 blur-[100px] opacity-50 saturate-200"
                    />
                </div>
                {/* subtle gradient overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/80 to-background" />
            </div>

            <div className="container mx-auto px-3 md:px-6 py-6 md:py-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">

                    {/* BLOCK 1: Main Image (Top Left) */}
                    <div className="w-full relative group">
                        <div className="rounded-2xl overflow-hidden bg-muted/20 border border-white/10 shadow-2xl relative aspect-square">
                            <Image
                                src={asset.image}
                                alt={asset.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                {asset.verified && <Badge className="bg-green-500/90 text-white text-xs backdrop-blur-md border-0"><ShieldCheck className="w-3 h-3 mr-1" /> Verified</Badge>}
                                {asset.rarity && (
                                    <Badge variant="secondary" className="text-xs bg-blue-500/90 text-white backdrop-blur-md border-0">
                                        <Sparkles className="w-3 h-3 mr-1" /> {asset.rarity}
                                    </Badge>
                                )}
                                {asset.isRemix && <Badge className="bg-purple-500/90 text-white text-xs backdrop-blur-md border-0"><GitBranch className="w-3 h-3 mr-1" /> Remix</Badge>}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs backdrop-blur-md">
                                        Zero Fees
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BLOCK 2: Main Info & Actions (Top Right) */}
                    <div className="space-y-8 min-w-0">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-xs py-1 px-3 border-primary/20 bg-primary/5 text-primary">
                                    {asset.category}
                                </Badge>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <span className="h-1 w-1 rounded-full bg-muted-foreground mx-2"></span>
                                    {asset.blockchain}
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 leading-tight">
                                {asset.name}
                            </h1>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push(`/creators/${asset.ownerAddress}`)}>
                                    <div className="h-10 w-10 rounded-full border border-white/10 bg-muted overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Creator</p>
                                        <p className="text-sm font-medium group-hover:text-primary transition-colors flex items-center">
                                            {asset.creator} {asset.verified && <ShieldCheck className="w-3 h-3 ml-1 text-blue-400" />}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={handleShare} className="rounded-full hover:bg-white/10" title="Share">
                                        <Share2 className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={handleCopy} className="rounded-full hover:bg-white/10" title="Copy Link">
                                        <Copy className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={handleExplorer} className="rounded-full hover:bg-white/10" title="View on Explorer">
                                        <Globe className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-red-500" title="Report">
                                        <Flag className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Action Card */}
                        <Card className="border-primary/20 bg-gradient-to-b from-primary/10 to-transparent backdrop-blur-xl overflow-hidden shadow-2xl shadow-primary/5">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    {!isListed && !isOwner ? (
                                        <div className="bg-background/40 border border-primary/20 rounded-xl p-6 text-center space-y-4 backdrop-blur-md">
                                            <div className="flex justify-center">
                                                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-primary/5">
                                                    <Info className="h-6 w-6 text-primary" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-primary">Not Listed For Sale</h3>
                                                <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                                                    Make an offer to signal your interest to the owner.
                                                </p>
                                            </div>
                                            <Button
                                                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                                onClick={() => router.push(`/make-offer/${asset.collectionAddress}/${asset.tokenId}`)}
                                            >
                                                <HandshakeIcon className="h-5 w-5 mr-2" />
                                                Make an Offer
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {isOwner ? (
                                                <ListingDialog
                                                    assetId={asset.tokenId}
                                                    assetName={asset.name}
                                                    trigger={
                                                        <Button className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 cursor-swag">
                                                            <ShoppingCart className="h-5 w-5 mr-2" />
                                                            List for Sale
                                                        </Button>
                                                    }
                                                />
                                            ) : (
                                                <Button
                                                    onClick={() => router.push(`/checkout/${asset.collectionAddress}/${asset.tokenId}`)}
                                                    className="w-full h-14 text-lg font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20"
                                                    disabled={asset.price === "Not Listed"}
                                                >
                                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                                    {asset.price === "Not Listed" ? "Not Listed" : `Buy Now - ${asset.price}`}
                                                </Button>
                                            )}

                                            {isListed && !isOwner && (
                                                <div className="flex gap-3">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => router.push(`/make-offer/${asset.collectionAddress}/${asset.tokenId}`)}
                                                        className="flex-1 h-12 bg-transparent border-white/10 hover:bg-white/5"
                                                    >
                                                        <HandshakeIcon className="h-4 w-4 mr-2" />
                                                        Make Offer
                                                    </Button>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                                                <ShieldCheck className="w-3 h-3" />
                                                <span>Protected by Medialane Protocol</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t border-white/10">
                                        <Button
                                            onClick={() => router.push(`/remix/${asset.collectionAddress}/${asset.tokenId}`)}
                                            className="w-full h-12 bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 backdrop-blur-sm"
                                        >
                                            <GitBranch className="h-5 w-5 mr-2" />
                                            Remix This Asset
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Glass Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <GlassStatCard label="Remixes" value={asset.remixCount || 0} icon={<GitBranch className="h-4 w-4" />} />
                            <GlassStatCard label="Holders" value={asset.holders || 1} icon={<Zap className="h-4 w-4" />} />
                            <GlassStatCard label="Views" value={asset.views || 0} icon={<Eye className="h-4 w-4" />} />
                            <GlassStatCard label="Royalty" value={`${asset.royalty}%`} icon={<Scale className="h-4 w-4" />} />
                        </div>
                    </div>

                    {/* BLOCK 3: Left Tabs (Details & Provenance) */}
                    <div className="h-full min-w-0">
                        <Tabs defaultValue="details" className="w-full h-full flex flex-col">
                            <TabsList className="w-full grid grid-cols-2 bg-muted/20 backdrop-blur-md p-1 rounded-xl">
                                <TabsTrigger value="details" className="rounded-lg py-2">Details</TabsTrigger>
                                <TabsTrigger value="provenance" className="rounded-lg py-2">Provenance</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details" className="mt-4 flex-1 space-y-6">
                                {/* Description Card */}
                                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                                    <CardContent className="p-4 space-y-3">
                                        <h3 className="text-sm font-semibold flex items-center text-muted-foreground"><Info className="w-4 h-4 mr-2" /> About this asset</h3>
                                        <p className="text-sm text-foreground/80 leading-relaxed">
                                            {asset.description}
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Collection Info */}
                                <Card className="border-white/10 bg-white/5 backdrop-blur-sm">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {asset.collectionImage && (
                                                <Image src={asset.collectionImage} alt={asset.collectionName} width={48} height={48} className="rounded-lg" />
                                            )}
                                            <div>
                                                <h4 className="font-semibold">{asset.collectionName}</h4>
                                                <p className="text-xs text-muted-foreground">{asset.collectionAddress?.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => router.push(`/collections/${asset.collectionAddress}`)}>
                                            View Collection
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Market Chart (Moved here) */}
                                <Card className="border-white/10 bg-white/5">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="w-4 h-4 text-primary" />
                                            <h3 className="font-semibold text-sm">Market Activity</h3>
                                        </div>
                                        <div className="h-[200px] w-full flex items-end justify-between gap-2 p-2 relative">
                                            <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between text-xs text-muted-foreground/30 pointer-events-none">
                                                <div className="border-b border-dashed border-white/5 w-full h-1"></div>
                                                <div className="border-b border-dashed border-white/5 w-full h-1"></div>
                                                <div className="border-b border-dashed border-white/5 w-full h-1"></div>
                                                <div className="border-b border-dashed border-white/5 w-full h-1"></div>
                                            </div>
                                            {[...Array(12)].map((_, i) => (
                                                <div key={i} className="flex-1 bg-gradient-to-t from-primary/40 to-primary/5 rounded-t-sm hover:from-primary/60 transition-colors relative group" style={{ height: `${20 + Math.random() * 60}%` }}>
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-xs text-white whitespace-nowrap z-10">
                                                        {(Math.random() * 10).toFixed(2)} ETH
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="provenance" className="mt-4 flex-1 space-y-6">
                                {/* Remix Genealogy */}
                                <div>
                                    <h3 className="text-sm font-semibold mb-3 flex items-center text-muted-foreground"><GitBranch className="w-4 h-4 mr-2" /> Remix Lineage</h3>
                                    <RemixGenealogyTree assetId={token.identifier} />
                                </div>

                                {/* History List */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold flex items-center text-muted-foreground"><History className="w-4 h-4 mr-2" /> Activity Log</h3>
                                    <Card className="border-white/10 bg-white/5">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">M</div>
                                                        <div>
                                                            <div className="font-medium text-sm">Minted</div>
                                                            <div className="text-xs text-muted-foreground">Original creation</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{new Date(asset.createdAt).toLocaleDateString()}</div>
                                                </div>
                                                <p className="text-center text-muted-foreground text-sm py-4">No other activity recorded</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* BLOCK 4: Right Tabs (Traits & License) */}
                    <div className="h-full min-w-0">
                        <Tabs defaultValue="traits" className="w-full h-full flex flex-col">
                            <TabsList className="w-full grid grid-cols-2 bg-muted/20 backdrop-blur-md p-1 rounded-xl">
                                <TabsTrigger value="traits" className="rounded-lg py-2">Traits</TabsTrigger>
                                <TabsTrigger value="license" className="rounded-lg py-2">License</TabsTrigger>
                            </TabsList>

                            <TabsContent value="traits" className="mt-4 flex-1">
                                <div className="space-y-4">
                                    {asset.attributes && asset.attributes.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-3">
                                            {asset.attributes.map((attr: any, index: number) => (
                                                <div key={index} className="px-4 py-3 bg-muted/20 rounded-xl border border-white/5 hover:border-primary/20 transition-colors min-w-0">
                                                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 truncate" title={attr.trait_type}>{attr.trait_type}</div>
                                                    <div className="font-medium truncate" title={attr.value}>{attr.value}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center border border-white/10 rounded-xl bg-white/5">
                                            <p className="text-muted-foreground text-sm">No traits defined for this asset.</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="license" className="mt-4 flex-1 space-y-6">
                                {/* Usage Rights */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Usage Rights</h3>
                                    <div className="grid gap-3">
                                        <div className="flex items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                            <ShieldCheck className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <div className="font-medium text-sm text-green-400 truncate">Commercial Rights Included</div>
                                                <div className="text-xs text-muted-foreground truncate">Owner has full commercial usage rights</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Berne Convention Info */}
                                <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2 text-blue-400 font-medium">
                                        <Globe className="w-4 h-4" />
                                        <h3>Global IP Protection</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed text-justify">
                                        This asset is protected under the <strong>Berne Convention for the Protection of Literary and Artistic Works</strong>.
                                        Your rights as a creator or owner are recognized in 181 countries worldwide, ensuring international copyright protection without the need for formal registration.
                                    </p>
                                    <div className="flex gap-2 pt-2">
                                        <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400">181 Countries</Badge>
                                        <Badge variant="outline" className="text-[10px] border-blue-500/20 text-blue-400">Automatic Protection</Badge>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                </div>
            </div>


        </div>
    )
}
