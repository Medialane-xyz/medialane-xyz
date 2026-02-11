"use client";

import { useAuth } from "@clerk/nextjs";
import { Button } from "@/src/components/ui/button";

// Stub component for revert compatibility
export function BuySkuDialog({ sku }: { sku: any }) {
    console.warn("BuySkuDialog is disabled in this version.");
    return (
        <Button disabled>Buy Disabled</Button>
    );
}
