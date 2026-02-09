"use client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";

export default function TxSummaryDialog({
    open,
    onClose,
    onConfirm,
    recipient,
    amount,
    token = "USDC",
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    recipient: string;
    amount: string;
    token?: string;
    network?: string;
    pinMasked?: string;
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen: boolean) => {
                if (!isOpen) onClose();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transaction Summary</DialogTitle>
                    <DialogDescription>Double check everything</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
                    <p>
                        Token
                        <span className="text-right font-medium">{token}</span>
                    </p>

                    <p>
                        Amount
                        <span className="text-right font-medium">{amount}</span>
                    </p>

                    <p>
                        Recipient
                        <span className="text-right font-medium break-all">
                            {recipient}
                        </span>
                    </p>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" type="button" onClick={onClose}>
                            Go back
                        </Button>
                    </DialogClose>
                    <Button type="button" onClick={onConfirm}>
                        Complete transaction
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
