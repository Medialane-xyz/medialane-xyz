"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Loader2, Search, Zap, Info, AlertCircle, CheckCircle2, Copy, ExternalLink, Bug } from "lucide-react";
import { useCallAnyContract } from "@chipi-stack/nextjs";
import { useAuth, useUser } from "@clerk/nextjs";
import { CallData, byteArray, RpcProvider } from "starknet";
import { CONTRACTS, provider as defaultProvider } from "@/src/services/constant";
import { toast } from "@/src/hooks/use-toast";

export default function ChipiDebugger() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const publicKey = user?.publicMetadata?.publicKey as string;
    const encryptedPrivateKey = user?.publicMetadata?.encryptedPrivateKey as string;
    const { callAnyContractAsync, isLoading: isCalling } = useCallAnyContract();

    // State for debugging
    const [txHashToCheck, setTxHashToCheck] = useState("");
    const [lookupResult, setLookupResult] = useState<any>(null);
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [logs, setLogs] = useState<{ time: string, msg: string, data?: any }[]>([]);
    const [lastSubmission, setLastSubmission] = useState<any>(null);

    const addLog = (msg: string, data?: any) => {
        const entry = { time: new Date().toLocaleTimeString(), msg, data };
        setLogs(prev => [entry, ...prev].slice(0, 50));
        console.log(`[ChipiDebug] ${msg}`, data || "");
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard" });
    };

    const checkTransaction = async (hash?: string) => {
        const target = hash || txHashToCheck;
        if (!target) return;

        setIsLookingUp(true);
        setLookupResult(null);
        addLog(`Checking status for: ${target}`);

        try {
            // Check via our default provider and a backup one
            const providers = [
                { name: "App Default", provider: defaultProvider },
                { name: "Public dRPC", provider: new RpcProvider({ nodeUrl: "https://starknet.drpc.org" }) },
                { name: "Nethermind", provider: new RpcProvider({ nodeUrl: "https://free-rpc.nethermind.io/mainnet-juno/v0_7" }) }
            ];

            const results = await Promise.all(providers.map(async (p) => {
                try {
                    const status = await p.provider.getTransactionStatus(target);
                    const receipt = await p.provider.getTransactionReceipt(target).catch(() => null);
                    return { source: p.name, status, receipt };
                } catch (e: any) {
                    return { source: p.name, error: e.message };
                }
            }));

            setLookupResult(results);
            addLog("Lookup completed", results);
        } catch (error: any) {
            addLog("Check failed", error.message);
            toast({ title: "Check failed", description: error.message, variant: "destructive" });
        } finally {
            setIsLookingUp(false);
        }
    };

    const handleTestCreate = async () => {
        if (!user || !publicKey) {
            toast({ title: "Login required", variant: "destructive" });
            return;
        }

        addLog("Starting Test Collection Creation...");

        try {
            const token = await getToken({ template: process.env.NEXT_PUBLIC_CLERK_TEMPLATE_NAME });
            if (!token) throw new Error("No token");

            const assetName = "DEBUG_" + Date.now();
            const symbol = "DBUG";
            const baseUri = "ipfs://test_debug_cid";

            const formattedCalldata = CallData.compile([
                byteArray.byteArrayFromString(assetName),
                byteArray.byteArrayFromString(symbol),
                byteArray.byteArrayFromString(baseUri),
            ]);

            const payload = {
                params: {
                    encryptKey: "DEBUG_PIN_REQUIRED_IF_REAL", // This will fail if not using real PIN from user
                    wallet: { publicKey, encryptedPrivateKey },
                    contractAddress: CONTRACTS.COLLECTION_FACTORY,
                    calls: [{
                        contractAddress: CONTRACTS.COLLECTION_FACTORY,
                        entrypoint: "create_collection",
                        calldata: formattedCalldata,
                    }],
                },
                bearerToken: token,
            };

            addLog("Prepared Payload (check PIN logic):", payload);
            setLastSubmission(payload);

            // Note: This needs the real PIN to work. We ask the user to use the form normally
            // but we'll log what would be sent if we had the PIN.
            addLog("To test real submission, use the actual Mint Drop form and look at console logs.");

            toast({ title: "Debug payload logged to console", description: "Open dev tools to see details" });
        } catch (error: any) {
            addLog("Test preparation failed", error.message);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4">
            <div className="flex items-center space-x-2 mb-4">
                <Bug className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">ChipiPay Logic Debugger</h1>
            </div>

            {/* Network Diagnostic */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                        <Info className="w-4 h-4 mr-2" />
                        Network Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="space-y-1">
                        <p><span className="text-muted-foreground">Network:</span> {process.env.NEXT_PUBLIC_STARKNET_NETWORK || "N/A"}</p>
                        <p><span className="text-muted-foreground">Explorer:</span> {process.env.NEXT_PUBLIC_EXPLORER_URL || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                        <p><span className="text-muted-foreground">Factory:</span> {CONTRACTS.COLLECTION_FACTORY}</p>
                        <p><span className="text-muted-foreground">Mediolano:</span> {CONTRACTS.MEDIOLANO}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hash Checker */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Transaction Explorer</CardTitle>
                        <CardDescription>Track status across multiple RPCs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex space-x-2">
                            <Input
                                placeholder="0x..."
                                value={txHashToCheck}
                                onChange={(e) => setTxHashToCheck(e.target.value)}
                                className="font-mono text-xs"
                            />
                            <Button onClick={() => checkTransaction()} disabled={isLookingUp}>
                                {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            </Button>
                        </div>

                        {lookupResult && (
                            <div className="space-y-2 mt-4">
                                {lookupResult.map((res: any, i: number) => (
                                    <div key={i} className="p-2 border rounded text-xs bg-muted/50">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-bold">{res.source}</span>
                                            {res.error ? (
                                                <Badge variant="destructive">Error</Badge>
                                            ) : (
                                                <Badge variant="outline">{res.status?.finality_status || res.status?.execution_status || "Unknown"}</Badge>
                                            )}
                                        </div>
                                        {res.error ? (
                                            <p className="text-red-500">{res.error}</p>
                                        ) : (
                                            <pre className="overflow-x-auto whitespace-pre-wrap max-h-32 text-[10px]">
                                                {JSON.stringify(res.status, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* System Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Submissions Debug</CardTitle>
                        <CardDescription>Inspect payload generation</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" onClick={handleTestCreate}>
                                <Zap className="w-3 h-3 mr-1" /> Log Create Tx
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setLogs([])}>
                                Clear Logs
                            </Button>
                        </div>

                        {lastSubmission && (
                            <div className="text-[10px] font-mono p-2 border rounded bg-black text-green-400 overflow-x-auto">
                                <p className="mb-1 text-white underline">Last Payload (Wait for PIN):</p>
                                <pre>{JSON.stringify(lastSubmission.params.calls[0].calldata, null, 2)}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Logs Area */}
            <Card className="min-h-[300px]">
                <CardHeader>
                    <CardTitle className="text-lg">Event Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto font-mono text-[11px]">
                        {logs.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8 italic">No events recorded yet</p>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="border-l-2 border-primary/50 pl-3 py-1 bg-muted/20">
                                    <div className="flex items-center text-muted-foreground mb-1">
                                        <span className="bg-primary/10 px-1 rounded mr-2">{log.time}</span>
                                        <span className="text-foreground font-semibold">{log.msg}</span>
                                    </div>
                                    {log.data && (
                                        <pre className="mt-1 p-2 bg-background/50 rounded overflow-x-auto max-h-40">
                                            {JSON.stringify(log.data, null, 2)}
                                        </pre>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
