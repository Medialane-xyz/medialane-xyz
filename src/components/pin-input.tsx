"use client";

import * as React from "react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";

interface PinInputProps {
    onSubmit: (pin: string) => Promise<void>;
    isLoading?: boolean;
    title?: string;
    description?: string;
    submitText?: string;
    error?: string;
    onCancel?: () => void;
}

export function PinInput({
    onSubmit,
    isLoading = false,
    title = "Enter PIN",
    description = "Enter your wallet PIN to authenticate this transaction",
    submitText = "Confirm",
    error,
    onCancel,
}: PinInputProps) {
    const [pin, setPin] = React.useState("");
    const [showPin, setShowPin] = React.useState(false);
    const [pinError, setPinError] = React.useState("");

    // PIN validation function
    const validatePin = (pin: string): string => {
        if (!pin || pin.trim() === '') {
            return 'PIN is required';
        }
        if (!/^\d+$/.test(pin)) {
            return 'PIN must contain only numbers';
        }
        if (pin.length < 6) {
            return 'PIN must be at least 6 characters';
        }
        if (pin.length > 12) {
            return 'PIN must be no more than 12 characters';
        }
        return '';
    };

    // Handle PIN input change for real-time validation
    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPin = e.target.value;
        setPin(newPin);
        const error = validatePin(newPin);
        setPinError(error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validatePin(pin);
        if (validationError) {
            setPinError(validationError);
            return;
        }

        try {
            await onSubmit(pin);
            setPin(""); // Clear PIN after successful submission
        } catch (error) {
            console.error('PIN submission error:', error);
        }
    };

    const isFormValid = pin && !pinError && !isLoading;

    return (
        <Card className="w-full max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">{title}</CardTitle>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-red-400/10 border border-red-300/20 rounded-lg"
                    >
                        <p className="text-red-300 text-sm font-medium">❌ {error}</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="pin" className="text-sm font-semibold flex items-center space-x-2">
                            <Lock className="w-4 h-4 text-primary" />
                            <span>Wallet PIN</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="pin"
                                type={showPin ? "text" : "password"}
                                inputMode="numeric"
                                pattern="[0-9]{6,12}"
                                minLength={6}
                                maxLength={12}
                                value={pin}
                                onChange={handlePinChange}
                                placeholder="Enter your 6~12 digit PIN"
                                className={`pr-10 text-lg tracking-wider transition-all ${pinError
                                    ? 'border-red-300/50 focus:ring-red-300/50 focus:border-red-300'
                                    : 'border-border/20 focus:ring-primary/50 focus:border-primary'
                                    }`}
                                disabled={isLoading}
                                autoFocus
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted/50"
                                onClick={() => setShowPin(!showPin)}
                                disabled={isLoading}
                            >
                                {showPin ? (
                                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                )}
                            </Button>
                        </div>

                        {pinError && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-300 text-sm font-medium"
                            >
                                ⚠️ {pinError}
                            </motion.p>
                        )}

                        {!pinError && pin && (
                            <p className="text-green-400 text-sm font-medium">
                                ✅ PIN format is valid
                            </p>
                        )}
                    </div>

                    <div className="flex space-x-3 pt-2">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={!isFormValid}
                            className={`${onCancel ? 'flex-1' : 'w-full'} ${!isFormValid
                                ? 'bg-gray-400/20 text-gray-300 cursor-not-allowed'
                                : 'bg-primary hover:bg-primary/90'
                                }`}
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                submitText
                            )}
                        </Button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        🔒 Your PIN is encrypted and never stored
                    </p>
                </div>
            </CardContent>
        </Card>
    );
} 