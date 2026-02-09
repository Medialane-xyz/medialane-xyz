import Link from "next/link";
import { Button } from "@/src/components/ui/button";

export function PayWithExternalWalletButton({
    usdAmount,
}: {
    usdAmount: number;
}) {
    const merchantWallet = process.env.NEXT_PUBLIC_MERCHANT_WALLET;
    return (
        <Button asChild>
            <Link
                href={`https://pay.chipipay.com/?usdAmount=${usdAmount}&token=USDC&starknetWallet=${merchantWallet}`}
                target="_blank"
            >
                Pay with External Wallet
            </Link>
        </Button>
    );
}
