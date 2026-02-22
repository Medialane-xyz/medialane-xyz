"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent } from "@/src/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/src/components/ui/dialog";
import { PinInput } from "@/src/components/pin-input";
import {
    Shield,
    Zap,
    Clock,
    Globe,
    CheckCircle,
    Sparkles,
    ExternalLink,
} from "lucide-react";
import { toast } from "@/src/hooks/use-toast";
import { useCallAnyContract } from "@chipi-stack/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";
import { CONTRACTS } from "@/src/services/constant";
import { useIpfsUpload } from "@/src/hooks/useIpfs";
import { Confetti } from "@/src/components/ui/animation-confetti";
import Image from "next/image";
import { CallData, byteArray } from "starknet";

// Mediolano Protocol default contract address
const MEDIOLANO_CONTRACT = CONTRACTS.MEDIOLANO;

export interface MintDropAsset {
    title: string;
    description: string;
    mediaUrl: string;
    externalUrl: string;
    author: string;
    type: string;
    tags: string[];
    collection: string;
    collectionId?: string;
    licenceType: string;
    licenseDetails: string;
    ipVersion: string;
    commercialUse: boolean;
    modifications: boolean;
    attribution: boolean;
    registrationDate: string;
    protectionStatus: string;
    protectionScope: string;
    protectionDuration: string;
}

// Pre-configured Asset Data (Default)
export const DEMO_MINT_DROP_ASSET: MintDropAsset = {
    title: "Tec de Monterrey Campus CEM, Ship your first dapp",
    description: "Ship your first dapp onchain, powered by Chipipay and Starknet",
    mediaUrl: "/mint.jpg",
    externalUrl: "https://chipipay.com",
    author: "Chipipay",
    type: "event",
    tags: ["event", "starknet", "chipipay"],
    collection: "Chipipay",
    licenceType: "exclusive",
    licenseDetails: "Non-transferable rights to Alpha access.",
    ipVersion: "1.0",
    commercialUse: false,
    modifications: false,
    attribution: true,
    registrationDate: new Date().toISOString().split("T")[0],
    protectionStatus: "Protected",
    protectionScope: "Global",
    protectionDuration: "Onchain",
};

interface MintEventAssetProps {
    asset?: MintDropAsset;
    contractAddress?: string;
}

export default function MintEventAsset({ asset, contractAddress }: MintEventAssetProps) {
    const { getToken } = useAuth();
    const { user } = useUser();
    const publicKey = user?.publicMetadata?.publicKey as string;
    const encryptedPrivateKey = user?.publicMetadata
        ?.encryptedPrivateKey as string;
    const {
        callAnyContractAsync,
        isLoading: isMinting,
    } = useCallAnyContract();
    const { uploadToIpfs, loading } = useIpfsUpload();

    const [showPinDialog, setShowPinDialog] = useState(false);
    const [isPinSubmitting, setIsPinSubmitting] = useState(false);
    const [pinError, setPinError] = useState("");
    const [txHash, setTxHash] = useState("");
    const [tokenId, setTokenId] = useState("");

    const activeAsset = asset || DEMO_MINT_DROP_ASSET;
    const activeContract = contractAddress || MEDIOLANO_CONTRACT;

    // Handle PIN submission for minting
    const handlePinSubmit = async (pin: string) => {
        if (!user) {
            setPinError("Wallet data not available");
            return;
        }

        setIsPinSubmitting(true);
        setPinError("");

        try {
            const token = await getToken({
                template: process.env.NEXT_PUBLIC_CLERK_TEMPLATE_NAME,
            });

            if (!token) {
                throw new Error("No bearer token found. Please try to login again.");
            }

            // Fetch the default image to upload it to IPFS
            const response = await fetch(activeAsset.mediaUrl);
            const blob = await response.blob();
            const file = new File([blob], "founders_key.jpg", { type: "image/jpeg" });

            // Create metadata object
            const metadata = {
                name: activeAsset.title,
                description: activeAsset.description,
                image: activeAsset.mediaUrl, // Will be replaced by IPFS URL
                external_url: activeAsset.externalUrl,
                attributes: [
                    { trait_type: "Type", value: activeAsset.type },
                    { trait_type: "License", value: activeAsset.licenceType },
                    { trait_type: "Scope", value: activeAsset.protectionScope },
                    { trait_type: "Tags", value: activeAsset.tags.join(", ") },
                ],
                properties: {
                    creator: activeAsset.author,
                    collection: activeAsset.collection,
                    license_details: activeAsset.licenseDetails,
                    registration_date: activeAsset.registrationDate,
                },
            };

            // Upload both file and metadata to IPFS
            const result = await uploadToIpfs(file, metadata);

            // Format parameters to Starknet types and compile to raw felts
            const formattedCalldata = CallData.compile([
                { low: activeAsset.collectionId || "0", high: "0" }, // collection_id
                publicKey, // recipient
                byteArray.byteArrayFromString(result.cid), // token_uri
            ]);

            // Mint NFT using Chipi SDK's callAnyContract to the IP Collection Protocol Contract
            console.log("[ChipiDebug] Submitting mint:", {
                contractAddress: CONTRACTS.COLLECTION_FACTORY,
                entrypoint: "mint",
                calldata: formattedCalldata,
            });

            const mintResult = await callAnyContractAsync({
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
                            entrypoint: "mint",
                            calldata: formattedCalldata,
                        },
                    ],
                },
                bearerToken: token,
            });

            console.log("[ChipiDebug] Mint Result Hash:", mintResult);

            console.log("Mint result:", mintResult);

            if (mintResult) {
                setTxHash(mintResult);
                setTokenId(Date.now().toString()); // Mock ID for UI until indexed
                setShowPinDialog(false);

                toast({
                    title: "Asset Created!",
                    description: "Your NFT has been minted.",
                });

                // Redirect to portfolio
                setTimeout(function () {
                    window.location.assign("/mint/portfolio");
                }, 7000);
            }
        } catch (error) {
            console.error("Minting failed:", error);
            const errorMessage =
                error instanceof Error ? error.message : "Minting failed";
            setPinError(errorMessage);

            toast({
                title: "Minting Failed",
                description: "PIN incorrect or network error. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsPinSubmitting(false);
        }
    };

    const handleMintClick = useCallback(async () => {
        if (!user) {
            toast({
                title: "Wallet not connected",
                description: "Please login to mint.",
                variant: "destructive",
            });
            return;
        }
        setShowPinDialog(true);
    }, [user]);

    return (
        <div className="min-h-screen py-20 bg-gradient-to-br from-green-500 via-silver-500 to-red-500">
            <main className="px-4 pt-4">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="grid md:grid-cols-2 gap-12 items-center">

                        {/* Asset Preview / Hero Card */}
                        <div className="relative group perspective-1000">
                            <div className="absolute -inset-1 rounded-md group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                            <Card className="p-4 relative bg-card/10 backdrop-blur-xl border-green-500/50 overflow-hidden transform transition-all duration-500 hover:rotate-y-12 shadow-2xl">
                                <div className="aspect-square relative flex items-center justify-center overflow-hidden bg-black/50 rounded-md">
                                    <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-20" />
                                    <Sparkles className="w-32 h-32 text-primary/20 animate-pulse absolute" />

                                    {activeAsset.mediaUrl && (
                                        <Image
                                            src={activeAsset.mediaUrl}
                                            alt={activeAsset.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    )}
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-foreground">Collection</span>
                                        <span className="font-medium">{activeAsset.collection}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-foreground">License</span>
                                        <span className="font-medium">{activeAsset.licenceType}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                        <div className="bg-white/10 p-2 rounded">
                                            <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
                                            <span>Onchain</span>
                                        </div>
                                        <div className="bg-white/10 p-2 rounded">
                                            <Globe className="w-4 h-4 mx-auto mb-1 text-green-500" />
                                            <span>Global</span>
                                        </div>
                                        <div className="bg-white/10 p-2 rounded">
                                            <Zap className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                                            <span>Instant</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Mint Action / Details */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-semibold">{activeAsset.title}</h2>
                                <p className="text-foreground leading-relaxed">
                                    {activeAsset.description}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {activeAsset.tags?.map(tag => (
                                        <Badge key={tag} variant="outline" className="text-xs border-white/10">
                                            #{tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-4 mb-6">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-foreground">Immutable ownership proved by zero-knowledge proofs on Starknet</p>
                                        </div>
                                    </div>

                                    {txHash ? (
                                        <div className="space-y-4 animate-fade-in">
                                            <Confetti />
                                            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                                <div>
                                                    <h4 className="font-medium text-green-700 dark:text-green-300">Successfully Minted!</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-muted-foreground">Tx: {txHash.slice(0, 6)}...{txHash.slice(-4)}</span>
                                                        <ExternalLink className="w-3 h-3 text-muted-foreground cursor-pointer" onClick={() => window.open(`${process.env.NEXT_PUBLIC_EXPLORER_URL}/tx/${txHash}`, "_blank")} />
                                                    </div>
                                                </div>
                                            </div>
                                            <Button className="w-full" variant="outline" onClick={() => window.location.assign("/mint/portfolio")}>
                                                View in Portfolio
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm">
                                                <span>Protocol Fee</span>
                                                <span className="text-green-500 font-medium">Zero-fee</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Gas Fee</span>
                                                <span className="text-green-500 font-medium">Sponsored</span>
                                            </div>
                                            <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="lg"
                                                        className="w-full text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                                                        onClick={handleMintClick}
                                                        disabled={!user || isMinting}
                                                    >
                                                        {isMinting ? "Minting..." : "Mint Drop"}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle className="sr-only">Confirm via Chipipay</DialogTitle>
                                                        <DialogDescription className="sr-only">Enter your wallet PIN to confirm the transaction.</DialogDescription>
                                                    </DialogHeader>
                                                    <PinInput
                                                        onSubmit={handlePinSubmit}
                                                        isLoading={isPinSubmitting}
                                                        error={pinError}
                                                        title="Enter Wallet PIN"
                                                        description="This transaction is gasless."
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                            {!user && (
                                                <p className="text-xs text-center text-muted-foreground">
                                                    Please connect your wallet to continue.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Separator() {
    return <div className="h-px w-full bg-border/50 my-2" />;
}
