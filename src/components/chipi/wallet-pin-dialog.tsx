"use client";
import { useState, useEffect, useCallback } from "react";
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
import { getWalletEncryptKey, hasWalletPasskey, isWebAuthnSupported } from "@chipi-stack/nextjs";

export function WalletPinDialog({
    open,
    onSubmit,
    onCancel,
}: {
    open: boolean;
    onSubmit: (encryptKey: string) => void;
    onCancel: () => void;
}) {
    const [pin, setPin] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showPinFallback, setShowPinFallback] = useState(false);
    const [passkeyError, setPasskeyError] = useState<string | null>(null);

    // Computed once — these are synchronous checks against browser APIs and localStorage
    const [canUsePasskey] = useState(() => isWebAuthnSupported() && hasWalletPasskey());

    const attemptPasskeyAuth = useCallback(async () => {
        setIsAuthenticating(true);
        setPasskeyError(null);
        try {
            const encryptKey = await getWalletEncryptKey();
            if (encryptKey) {
                onSubmit(encryptKey);
            } else {
                setPasskeyError("Biometric authentication failed. Please use your PIN.");
                setShowPinFallback(true);
            }
        } catch {
            setPasskeyError("Biometric authentication failed. Please use your PIN.");
            setShowPinFallback(true);
        } finally {
            setIsAuthenticating(false);
        }
    }, [onSubmit]);

    // When dialog opens, auto-attempt passkey auth if available; reset on close
    useEffect(() => {
        if (!open) {
            setPin("");
            setShowPinFallback(false);
            setPasskeyError(null);
            setIsAuthenticating(false);
            return;
        }

        if (canUsePasskey) {
            attemptPasskeyAuth();
        } else {
            setShowPinFallback(true);
        }
    }, [open, canUsePasskey, attemptPasskeyAuth]);

    return (
        <Dialog
            open={open}
            onOpenChange={(v: boolean) => {
                if (!v) onCancel();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isAuthenticating ? "Authenticating…" : showPinFallback ? "Enter your PIN" : "Authenticate"}
                    </DialogTitle>
                    <DialogDescription>
                        {isAuthenticating
                            ? "Follow the passkey prompt on your device — this may be a biometric scan, password manager, or security key."
                            : showPinFallback
                            ? "Your wallet is protected — enter your PIN to continue."
                            : "Confirm your identity to continue."}
                    </DialogDescription>
                </DialogHeader>

                {isAuthenticating && (
                    <div className="flex flex-col items-center gap-3 py-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                        <p className="text-sm text-muted-foreground">Waiting for biometrics…</p>
                    </div>
                )}

                {showPinFallback && (
                    <>
                        {passkeyError && (
                            <p className="text-sm text-destructive">{passkeyError}</p>
                        )}
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
                    </>
                )}

                <DialogFooter className="flex-col gap-2">
                    {showPinFallback && (
                        <Button
                            type="button"
                            disabled={pin.length !== 4}
                            onClick={() => onSubmit(pin)}
                        >
                            Continue
                        </Button>
                    )}
                    {canUsePasskey && showPinFallback && !isAuthenticating && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-xs"
                            onClick={attemptPasskeyAuth}
                        >
                            Try passkey again
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
