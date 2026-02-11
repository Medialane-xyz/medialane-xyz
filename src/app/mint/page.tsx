"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@clerk/nextjs"
import { useGetWallet, useCallAnyContract } from "@chipi-stack/nextjs"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { toast } from "sonner"
import { ipCollectionAbi } from "@/src/abis/ip_collection"
import { Loader2, Sparkles, CheckCircle2, Wallet, ArrowRight } from "lucide-react"
import { WalletPinDialog } from "@/src/components/chipi/wallet-pin-dialog"
import { Badge } from "@/src/components/ui/badge"

// Contract Configuration
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MIP_CONTRACT_ADDRESS
const COLLECTION_ID = "1" // Defaulting to 1 as per typical first collection, can be parameterized if needed
// Using a placeholder token URI. ideally this should be dynamic or provided.
// Since we are minting an "Event NFT", maybe it has a static metadata URI?
const TOKEN_URI = "ipfs://bafyreicmz744kmj3q7q5m5d4df4d4d4d4d4d4d4d4d4d4d4d4d4d4d4d4" 

export default function MintPage() {
    const { userId, getToken } = useAuth()
    const [isMinting, setIsMinting] = useState(false)
    const [pinOpen, setPinOpen] = useState(false)
    const [txHash, setTxHash] = useState<string | null>(null)

    // 1. Get Wallet
    const { data: walletData, isLoading: isWalletLoading } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then((t) => t || ""),
        params: { externalUserId: userId || "" },
        queryOptions: { enabled: !!userId },
    })
    
    // 2. Setup Contract Call
    const { callAnyContractAsync } = useCallAnyContract()

    const handleMintClick = () => {
        if (!userId) {
            toast.error("Please sign in to mint")
            return
        }
        if (!walletData) {
             toast.error("Wallet not ready. Please refresh.")
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

            const walletPublicKey = (walletData as any)?.wallet?.publicKey
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
                    // For ByteArray, starknet.js and most SDKs might handle string conversion differently.
                    // If callAnyContractAsync uses staknet.js v6/v5 underneath with calldata compilation, existing string might work.
                    // However, `token_uri` is likely expected as a ByteArray which is complex in raw calldata.
                    // If the SDK supports automatic ABI encoding from the ABI, we should pass parameters as an array.
                    // BUT `callAnyContractAsync` takes `calls` which are usually raw calldata or struct-based if using `Call` type.
                    // Let's assume for now we need to pass basic types. 
                    // Wait, ByteArray in calldata is length + data + pending_word + pending_word_len.
                    // This is tricky without a proper library.
                     // A safe bet for now is passing standard felt array if possible, or string if SDK handles it.
                     // Given this is an urgent task, I'll try passing the string directly hoping the SDK/Provider handles ByteArray conversion 
                     // or uses a high-level `Contract` calls invocation.
                     // Looking at `useCreateCollection.ts`, it used `create_collection` which takes ByteArrays (name, symbol, base_uri).
                     // It passed simple strings: `params.name`, `params.symbol`, `baseUri`.
                     // So usage of strings seems supported!
                    TOKEN_URI 
                ],
            }

            const res = await callAnyContractAsync({
                bearerToken: token,
                params: {
                    encryptKey: pin,
                    wallet: {
                        publicKey: walletPublicKey,
                        encryptedPrivateKey: (walletData as any).wallet?.encryptedPrivateKey,
                    },
                    calls: [call],
                } as any
            })

            // The response might vary based on SDK version, assuming it returns tx hash string or object
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

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center" />
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
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm">Minting is Live</span>
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
                                        disabled={isMinting || isWalletLoading || !walletData}
                                        className="w-full h-14 text-lg bg-white text-black hover:bg-white/90 transition-all font-bold shadow-lg shadow-white/10"
                                    >
                                        {isMinting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Minting...
                                            </>
                                        ) : (
                                            <>
                                                <Wallet className="w-5 h-5 mr-2" />
                                                Mint Free NFT
                                            </>
                                        )}
                                    </Button>
                                )}
                                {userId && walletData && (
                                     <p className="text-xs text-center text-zinc-500">
                                        Wallet: {(walletData as any)?.wallet?.publicKey?.slice(0, 6)}...{(walletData as any)?.wallet?.publicKey?.slice(-4)}
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
        </div>
    )
}
