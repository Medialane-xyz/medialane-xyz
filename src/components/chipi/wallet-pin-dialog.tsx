"use client";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/src/components/ui/dialog";
import { Label } from "@/src/components/ui/label";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/src/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export function WalletPinDialog({
    open,
    onSubmit,
    onCancel,
}: {
    open: boolean;
    onSubmit: (pin: string) => void;
    onCancel: () => void;
}) {
    const [pin, setPin] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = () => {
        setIsSubmitting(true);
        onSubmit(pin);
        setPin("");
        setIsSubmitting(false);
    };

    const disabled = pin?.length !== 4 || isSubmitting;

    return (
        <Dialog
            open={open}
            onOpenChange={(v: boolean) => {
                if (!v) onCancel();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Enter your PIN</DialogTitle>
                    <DialogDescription>
                        Your wallet is protected — enter your PIN to continue.
                    </DialogDescription>
                    <Label>PIN (4 digits)</Label>
                    <InputOTP
                        maxLength={4}
                        value={pin}
                        onChange={(value: string) => setPin(value)}
                        pattern={REGEXP_ONLY_DIGITS}
                        inputMode="numeric"
                        autoComplete="off"
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                        </InputOTPGroup>
                    </InputOTP>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" disabled={disabled} onClick={handleSubmit}>
                        {isSubmitting ? "Submitting..." : "Continue"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
