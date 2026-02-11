"use client";

import { ChipiDebug } from "@/src/components/debug/chipi-debug";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AccountDebugPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/account">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold neon-text">Account Debugger</h1>
                    <p className="text-muted-foreground">Diagnose wallet connection issues.</p>
                </div>
            </div>

            <ChipiDebug />
        </div>
    );
}
