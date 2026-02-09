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
    featureImage: File
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

            // 1. Upload feature image (Mock IPFS)
            const featureImageCid = await uploadToIPFS(params.featureImage)
            const featureImageUrl = featureImageCid.replace("ipfs://", "https://ipfs.io/ipfs/")

            // 2. Generate and Upload Collection Metadata
            // This metadata represents the collection itself, often used for setting up the contract URI or initial base URI context
            const collectionMetadata = {
                name: params.name,
                description: params.description,
                image: featureImageUrl,
                external_link: params.website,
                // Store standard collection licensing/traits as attributes for compatibility
                attributes: [
                    { trait_type: "License", value: params.licenseType },
                    { trait_type: "Commercial Use", value: params.allowCommercialUse ? "Allowed" : "Restricted" },
                    { trait_type: "Remixing", value: params.enableRemixing ? "Allowed" : "Restricted" },
                    { trait_type: "Category", value: params.category },
                    ...params.tags.map(tag => ({ trait_type: "Tag", value: tag }))
                ],
                // Legacy fields might be needed depending on indexer
                category: params.category,
                tags: params.tags,
            }

            const metadataCid = await uploadMetadata(collectionMetadata)
            // For standard collections, the base_uri often points to the directory where token metadata WILL be stored.
            // However, in this 'Mint Collection' flow, we might be setting the Contract Level Metadata URI.
            // If the contract uses this URI as a prefix for tokens, it should be a directory.
            // Since we are mocking, we will use the metadata CID as the base for now.
            // User requested: "collection.json contains... baseUri on-chain will point to this JSON file" (from plan)
            // Updated plan says: "ensuring compatibility... metadata compatibility"
            const baseUri = metadataCid.replace("ipfs://", "https://ipfs.io/ipfs/")

            // 3. Prepare contract call
            setStep("sign")
            const call = {
                contractAddress: COLLECTION_CONTRACT_ADDRESS,
                entrypoint: "create_collection",
                calldata: [
                    params.name,
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
                        // Check if data[0] and data[1] are defined before BigInt conversion to avoid TypeError
                        if (event.data[0] && event.data[1]) {
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
                        } else {
                            throw new Error("Event data missing for Collection ID")
                        }
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
