"use client"

import { useState } from "react"
import Image from "next/image"
import { useAuth } from "@clerk/nextjs"
import { useGetWallet, useCallAnyContract } from "@chipi-stack/nextjs"
import { Button } from "@/src/components/ui/button"
import { toast } from "sonner"
import { Loader2, Sparkles, CheckCircle2, Wallet, ArrowRight, PlusCircle } from "lucide-react"
import { WalletPinDialog } from "@/src/components/chipi/wallet-pin-dialog"
import { CreateWalletDialog } from "@/src/components/chipi/create-wallet-dialog"
import { Badge } from "@/src/components/ui/badge"

// Contract Configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MIP_CONTRACT_ADDRESS
const COLLECTION_ID = "1" // Defaulting to 1 as per typical first collection, can be parameterized if needed
// Using a placeholder token URI. ideally this should be dynamic or provided.
const TOKEN_URI = "ipfs://bafyreicmz744kmj3q7q5m5d4df4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4"

export default function MintPage() {
    const { userId, getToken } = useAuth()
    const [isMinting, setIsMinting] = useState(false)
    const [pinOpen, setPinOpen] = useState(false)
    const [createWalletOpen, setCreateWalletOpen] = useState(false)
    const [txHash, setTxHash] = useState<string | null>(null)

    // 1. Get Wallet
    const { data: walletData, isLoading: isWalletLoading, error: walletError } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then((t) => t || ""),
        params: { externalUserId: userId || "" },
        queryOptions: { enabled: !!userId },
    })

    // Robust wallet access matching account page pattern
    const wallet = walletData as any
    const walletPublicKey = wallet?.publicKey || wallet?.wallet?.publicKey

    // 2. Setup Contract Call
    const { callAnyContractAsync } = useCallAnyContract()

    const handleMintClick = () => {
        if (!userId) {
            toast.error("Please sign in to mint")
            return
        }

        // If wallet failed to load or is missing, prompt creation
        if (!walletPublicKey && !isWalletLoading) {
            setCreateWalletOpen(true)
            return
        }

        setPinOpen(true)
    }

    const onPinSubmit = async (pin: string) => {
        setPinOpen(false)
        setIsMinting(true)
        setTxHash(null)

        try {
            if (!CONTRACT_ADDRESS) throw new Error("Contract address not configured")

            const token = await getToken({ template: "chipipay" })
            if (!token) throw new Error("Authentication failed")

            if (!walletPublicKey) throw new Error("No wallet found")

            // Construct Call
            // mint(collection_id: u256, recipient: ContractAddress, token_uri: ByteArray)
            const call = {
                contractAddress: CONTRACT_ADDRESS,
                entrypoint: "mint",
                calldata: [
                    COLLECTION_ID, // collection_id low
                    "0",           // collection_id high
                    walletPublicKey, // recipient
                    TOKEN_URI
                ],
            }

            const res = await callAnyContractAsync({
                bearerToken: token,
                params: {
                    encryptKey: pin,
                    wallet: {
                        publicKey: walletPublicKey,
                        encryptedPrivateKey: wallet?.encryptedPrivateKey || wallet?.wallet?.encryptedPrivateKey,
                    },
                    calls: [call],
                } as any
            })

            // The response might vary based on SDK version
            const hash = typeof res === 'string' ? res : (res as any)?.transaction_hash

            if (hash) {
                setTxHash(hash)
                toast.success("Mint submitted! 🚀")
            } else {
                throw new Error("No transaction hash returned")
            }

        } catch (error: any) {
            console.error("Minting error:", error)
            toast.error(error.message || "Failed to mint NFT")
        } finally {
            setIsMinting(false)
        }
    }

    const hasWallet = !!walletPublicKey

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Effects - CSS Replacement for grid.svg */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            <div className="container max-w-4xl px-4 relative z-10 py-12">

                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400 px-4 py-1 mb-4 backdrop-blur-md">
                        <Sparkles className="w-3 h-3 mr-2" /> Exclusive Event
                    </Badge>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
                        Mint Your access
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-xl mx-auto">
                        Unlock exclusive perks and proof of attendance with this limited edition digital collectible.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">

                    {/* Visual Side */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 z-10" />
                        <Image
                            src="/placeholder.svg" // Replace with actual event NFT image if available
                            alt="Event NFT"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-4 left-4 z-20">
                            <Badge className="bg-black/50 backdrop-blur border-white/10 text-white hover:bg-black/60">
                                #0001
                            </Badge>
                        </div>
                    </div>

                    {/* Action Side */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">Event Access Pass</h2>
                            <div className="flex items-center space-x-2 text-zinc-400">
                                <span className={`w-2 h-2 rounded-full ${hasWallet ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                                <span className="text-sm">
                                    {isWalletLoading ? "Checking wallet..." : hasWallet ? "Minting is Live" : "Wallet Setup Required"}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-zinc-400">Price</span>
                                <span className="text-xl font-bold text-white">Free</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                                <span className="text-zinc-400">Gas Fees</span>
                                <span className="text-xl font-bold text-green-400">Sponsored by Chipipay</span>
                            </div>
                        </div>

                        {txHash ? (
                            <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-4">
                                <div className="mx-auto w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-400">Mint Successful!</h3>
                                    <p className="text-sm text-green-300/80 mt-1">Your NFT is on its way to your wallet.</p>
                                </div>
                                <Button variant="outline" className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10" onClick={() => window.open(`https://starkscan.co/tx/${txHash}`, '_blank')}>
                                    View Transaction <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {!userId ? (
                                    <Button className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-500/20">
                                        Sign in to Mint
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleMintClick}
                                        disabled={isMinting || isWalletLoading}
                                        className={`w-full h-14 text-lg transition-all font-bold shadow-lg 
                                            ${hasWallet
                                                ? "bg-white text-black hover:bg-white/90 shadow-white/10"
                                                : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/20"
                                            }`}
                                    >
                                        {isMinting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Minting...
                                            </>
                                        ) : hasWallet ? (
                                            <>
                                                <Wallet className="w-5 h-5 mr-2" />
                                                Mint Free NFT
                                            </>
                                        ) : (
                                            <>
                                                <PlusCircle className="w-5 h-5 mr-2" />
                                                Create Wallet to Mint
                                            </>
                                        )}
                                    </Button>
                                )}
                                {hasWallet && (
                                    <p className="text-xs text-center text-zinc-500 font-mono">
                                        Wallet: {walletPublicKey.slice(0, 6)}...{walletPublicKey.slice(-4)}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <WalletPinDialog
                open={pinOpen}
                onCancel={() => setPinOpen(false)}
                onSubmit={onPinSubmit}
            />

            <CreateWalletDialog
                open={createWalletOpen}
                onOpenChange={setCreateWalletOpen}
            />
        </div>
    )
}
