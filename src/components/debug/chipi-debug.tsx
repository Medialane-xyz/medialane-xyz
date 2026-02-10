"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { useGetWallet } from "@chipi-stack/nextjs";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

export function ChipiDebug() {
    const { isLoaded, userId, getToken } = useAuth();
    const { user } = useUser();
    const [token, setToken] = useState<string | null>(null);
    const [apiKey, setApiKey] = useState<string | null>(null);

    const { data: wallet, error, isLoading, refetch } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then(t => t || ""),
        params: { externalUserId: userId || "" },
        queryOptions: {
            enabled: !!userId,
            retry: false,
        }
    });

    useEffect(() => {
        const fetchToken = async () => {
            if (userId) {
                const t = await getToken();
                setToken(t);
            }
        };
        fetchToken();
        // Check for public key in env (client-side safe only if NEXT_PUBLIC)
        setApiKey(process.env.NEXT_PUBLIC_CHIPI_API_KEY || "NOT SET");
    }, [userId, getToken]);

    if (!isLoaded) return <div>Loading Auth...</div>;

    return (
        <Card className="w-full max-w-2xl mx-auto my-8 border-red-500 border-2">
            <CardHeader>
                <CardTitle className="text-red-500">Chipipay Debugger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 break-all">
                <div>
                    <h3 className="font-bold">Environment</h3>
                    <p>NEXT_PUBLIC_CHIPI_API_KEY: {apiKey}</p>
                </div>

                <div>
                    <h3 className="font-bold">Clerk Auth</h3>
                    <p>User ID: {userId || "Not Logged In"}</p>
                    <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
                    <p>Token: {token ? (token.substring(0, 10) + "...") : "No Token"}</p>
                </div>

                <div>
                    <h3 className="font-bold">Chipipay Wallet</h3>
                    <p>Loading: {isLoading ? "Yes" : "No"}</p>
                    <div className="bg-gray-900 p-2 rounded text-xs font-mono">
                        {error ? (
                            <span className="text-red-400">Error: {JSON.stringify(error, null, 2)}</span>
                        ) : wallet ? (
                            <span className="text-green-400">Success: {JSON.stringify(wallet, null, 2)}</span>
                        ) : (
                            <span className="text-yellow-400">No Data (404 likely means wallet not found for this User ID)</span>
                        )}
                    </div>
                    <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
                        Refetch Wallet
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
