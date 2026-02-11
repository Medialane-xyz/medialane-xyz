"use client"

import { Button } from "@/src/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export function ListingDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>List Asset for Sale</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Marketplace features are currently being upgraded for Chipi wallet integration.
                        Please check back soon.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                    <p className="text-sm text-yellow-500">Feature Currently Unavailable</p>
                </div>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
