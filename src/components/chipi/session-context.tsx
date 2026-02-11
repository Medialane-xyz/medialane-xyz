"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useGetWallet, useChipiSession, SessionKeyData, CreateSessionKeyParams } from "@chipi-stack/nextjs";
import { toast } from "sonner";
import { Call } from "starknet";

interface SessionContextType {
    hasActiveSession: boolean;
    session: SessionKeyData | null;
    activateSession: (pin: string) => Promise<void>;
    executeWithSession: (calls: Call[]) => Promise<string>;
    isLoadingSession: boolean;
    isCreatingSession: boolean;
    isExecutingSession: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { userId, getToken, isLoaded } = useAuth();
    // We need wallet data to use sessions
    const { data: wallet } = useGetWallet({
        getBearerToken: () => getToken({ template: "chipipay" }).then(t => t || ""),
        params: { externalUserId: userId || "" },
        queryOptions: { enabled: !!userId && isLoaded }
    });

    const [pin, setPin] = useState<string>("");

    // Initialize session hook with empty pin initially
    const {
        session,
        hasActiveSession,
        createSession,
        registerSession,
        executeWithSession: executeChipiSession,
        isLoadingStatus,
        isCreating: isCreatingSession,
        isExecuting: isExecutingSession,
    } = useChipiSession({
        wallet: wallet?.wallet || null,
        encryptKey: pin,
        getBearerToken: () => getToken({ template: "chipipay" }).then(t => t || ""),
    });

    const activateSession = async (userPin: string) => {
        if (!wallet) {
            toast.error("Wallet not loaded");
            return;
        }
        setPin(userPin);
        try {
            // If session is already active, we just needed the PIN.
            // If not, we create one.
            if (!hasActiveSession) {
                await createSession({ encryptKey: userPin });
                // Register the session on-chain so it's valid for verifying signatures
                await registerSession();
                toast.success("Session activated!");
            } else {
                toast.success("Session unlocked!");
            }
        } catch (e) {
            console.error("Failed to activate session", e);
            toast.error("Failed to activate session. Check PIN.");
            setPin(""); // Clear invalid PIN
            throw e;
        }
    };

    const handleExecute = async (calls: Call[]) => {
        if (!pin) {
            throw new Error("Session locked. Please enter PIN.");
        }
        return executeChipiSession(calls);
    };

    return (
        <SessionContext.Provider value={{
            hasActiveSession,
            session,
            activateSession,
            executeWithSession: handleExecute,
            isLoadingSession: isLoadingStatus,
            isCreatingSession,
            isExecutingSession
        }}>
            {children}
        </SessionContext.Provider>
    );
}

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) throw new Error("useSession must be used within SessionProvider");
    return context;
};
