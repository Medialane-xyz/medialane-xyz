"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/src/components/ui/select"
import { toast } from "@/src/hooks/use-toast"
import { useAccount } from "@starknet-react/core"
import { useRegisterOrder } from "@/src/lib/hooks/use-marketplace"
import { useToast } from "@/src/components/ui/use-toast"
import { ItemType } from "@/src/abis/medialane"
import { uint256 } from "starknet"
import { Gavel, Loader2, Tag } from "lucide-react"

const STRK_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
const COLLECTION_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS || ""

interface ListingDialogProps {
    assetId: string
    assetName: string
    trigger?: React.ReactNode
}

export function ListingDialog({ assetId, assetName, trigger }: ListingDialogProps) {
    const { account } = useAccount()
    const { registerOrder, isPending } = useRegisterOrder()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [price, setPrice] = useState("")
    const [duration, setDuration] = useState("7")

    const handleList = async () => {
        if (!account) {
            toast({
                title: "Wallet Required",
                description: "Please connect your wallet to list items.",
                variant: "destructive"
            })
            return
        }

        if (!price || parseFloat(price) <= 0) {
            toast({
                title: "Invalid Price",
                description: "Please enter a valid price.",
                variant: "destructive"
            })
            return
        }

        try {
            const now = Math.floor(Date.now() / 1000)
            const expiry = now + (parseInt(duration) * 24 * 60 * 60)

            // For listing:
            // Offer: The NFT (ERC721 or ERC1155)
            // Consideration: The payment (ERC20/STRK) to the maker (offerer)

            const priceBigInt = BigInt(Math.floor(parseFloat(price) * 1e18))
            const priceUint256 = uint256.bnToUint256(priceBigInt)
            const priceStruct = { low: priceUint256.low.toString(), high: priceUint256.high.toString() }

            // Offer Item (The Asset)
            const tokenIdStruct = { low: assetId, high: "0" } // Simple assumption

            const params: any = {
                offerer: account.address,
                offer: {
                    item_type: ItemType.ERC721,
                    token: COLLECTION_ADDRESS,
                    identifier_or_criteria: tokenIdStruct,
                    start_amount: { low: "1", high: "0" },
                    end_amount: { low: "1", high: "0" },
                },
                consideration: {
                    item_type: ItemType.ERC20, // STRK
                    token: STRK_ADDRESS,
                    identifier_or_criteria: { low: "0", high: "0" },
                    start_amount: priceStruct,
                    end_amount: priceStruct,
                    recipient: account.address,
                },
                start_time: now.toString(),
                end_time: expiry.toString(),
                salt: Math.floor(Math.random() * 1000000).toString(),
                nonce: Date.now().toString(),
            }

            console.log("Listing Params:", params)
            await registerOrder(params)

            toast({
                title: "Listing Created!",
                description: `${assetName} is now listed for ${price} STRK`,
            })
            setOpen(false)
        } catch (error) {
            console.error("Listing failed:", error)
            toast({
                title: "Listing Failed",
                description: "Something went wrong. Check console.",
                variant: "destructive"
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="w-full">
                        <Tag className="mr-2 h-4 w-4" />
                        List for Sale
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>List Item for Sale</DialogTitle>
                    <DialogDescription>
                        Set a fixed price for {assetName}. You can cancel at any time.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="price">Price (STRK)</Label>
                        <Input
                            id="price"
                            type="number"
                            placeholder="0.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="duration">Duration</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 Day</SelectItem>
                                <SelectItem value="3">3 Days</SelectItem>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleList} disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Listing...
                            </>
                        ) : (
                            "Complete Listing"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
