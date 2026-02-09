"use client"

import { useState, useEffect } from "react"
import { useAccount, useSendTransaction, useTransactionReceipt } from "@starknet-react/core"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/components/ui/use-toast"
import { uploadToIPFS, uploadMetadata } from "@/src/lib/services/upload"

const COLLECTION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS || ""

type CreateCollectionParams = {
    name: string
    symbol: string
    description: string
    coverImage: File
    bannerImage: File
    category: string
    tags: string[]
    royaltyPercentage: number
    mintPrice: number
    currency: string
    enableRemixing: boolean
    remixRoyalty: number
    allowCommercialUse: boolean
    requireAttribution: boolean
    licenseType: string
    website?: string
    twitter?: string
    discord?: string
}

export function useCreateCollection() {
    const { address } = useAccount()
    const { toast } = useToast()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const [step, setStep] = useState<"idle" | "upload" | "sign" | "mining" | "indexing">("idle")
    const [txHash, setTxHash] = useState<string | undefined>(undefined)

    const { sendAsync: createCollectionOnChain } = useSendTransaction({
        calls: undefined,
    })

    // Wait for transaction
    const { data: receipt, isError: isTxError, error: txError } = useTransactionReceipt({
        hash: txHash,
        watch: true,
    })

    // Handle creation flow
    const createCollection = async (params: CreateCollectionParams) => {
        if (!address) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to create a collection.",
                variant: "destructive",
            })
            return
        }

        try {
            setIsProcessing(true)
            setStep("upload")

            // 1. Upload images (Mock IPFS)
            const coverCid = await uploadToIPFS(params.coverImage)
            // const bannerCid = await uploadToIPFS(params.bannerImage) // Not used in contract but good for metadata

            // 2. Upload metadata (Mock)
            const baseUri = coverCid.replace("ipfs://", "https://ipfs.io/ipfs/")

            // 3. Prepare contract call
            setStep("sign")
            const call = {
                contractAddress: COLLECTION_CONTRACT_ADDRESS,
                entrypoint: "create_collection",
                calldata: [
                    params.name, // Starknet.js handles string -> ByteArray auto-encoding in v6+, hopefully v5 too
                    params.symbol,
                    baseUri,
                ],
            }

            // @ts-ignore - Starknet React v5 sendAsync expects Call[]
            const { transaction_hash } = await createCollectionOnChain([call])
            setTxHash(transaction_hash)
            setStep("mining")

            toast({
                title: "Transaction Submitted",
                description: "Waiting for confirmation...",
            })

            return transaction_hash

        } catch (e) {
            console.error("Creation error:", e)
            toast({
                title: "Creation Failed",
                description: e instanceof Error ? e.message : "An error occurred during collection creation",
                variant: "destructive",
            })
            setIsProcessing(false)
            setStep("idle")
        }
    }

    // Effect to handle transaction completion
    useEffect(() => {
        if (receipt && step === "mining") {
            setStep("indexing")

            // Check if receipt has events (type guard)
            // @ts-ignore - complex union type
            const events = receipt.events || []

            // Try to find the event
            // @ts-ignore
            const ourEvents = events.filter(e => {
                // Normalize addresses for comparison
                const eventAddress = e.from_address.toLowerCase().replace(/^0x0+/, "0x")
                const contractAddress = COLLECTION_CONTRACT_ADDRESS.toLowerCase().replace(/^0x0+/, "0x")
                return eventAddress === contractAddress
            })

            if (ourEvents.length > 0) {
                // CollectionCreated is likely the last event
                const event = ourEvents[ourEvents.length - 1]

                // Extract ID (first u256 in data)
                if (event.data && event.data.length >= 2) {
                    try {
                        const idLow = BigInt(event.data[0])
                        const idHigh = BigInt(event.data[1])
                        // u256 is (low, high)
                        const id = idLow + (idHigh << BigInt(128))

                        toast({
                            title: "Collection Created! 🎉",
                            description: "Redirecting to your new collection...",
                        })

                        setTimeout(() => {
                            router.push(`/collections/${id.toString()}`)
                        }, 1500)
                    } catch (e) {
                        console.error("Error parsing event data", e)
                        toast({
                            title: "Transaction Confirmed",
                            description: "Collection created. Check your profile.",
                        })
                    } finally {
                        setIsProcessing(false)
                        setStep("idle")
                    }
                }
            } else {
                // Fallback
                toast({
                    title: "Transaction Confirmed",
                    description: "Collection created. Check your profile.",
                })
                setIsProcessing(false)
                setStep("idle")
            }
        }
    }, [receipt, step, router, toast])

    return {
        createCollection,
        isProcessing,
        step,
        txHash
    }
}
