"use client"

import { useState, useCallback, useRef } from "react"
import { useAuth, useUser } from "@clerk/nextjs"
import { useCallAnyContract } from "@chipi-stack/nextjs"
import { provider } from "@/src/services/constant"

// ─── Types ────────────────────────────────────────────────────────────────

/** A single Starknet call (matches the ChipiPay SDK Call type) */
export type ChipiCall = {
    contractAddress: string
    entrypoint: string
    calldata: string[]
}

/** Input for executeTransaction */
export type ChipiTransactionParams = {
    pin: string
    contractAddress: string
    calls: ChipiCall[]
    /** Override wallet data (used by use-create-collection which gets wallet from useGetWallet) */
    wallet?: {
        publicKey: string
        encryptedPrivateKey: string
    }
}

/** Result returned after transaction execution */
export type ChipiTransactionResult = {
    txHash: string
    status: "confirmed" | "reverted"
    revertReason?: string
}

/** Transaction lifecycle status */
export type ChipiTransactionStatus =
    | "idle"
    | "submitting"
    | "confirming"
    | "confirmed"
    | "reverted"
    | "error"

// ─── Debug Logger ─────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV === "development"

function chipiLog(...args: any[]) {
    if (isDev) console.log("[ChipiTx]", ...args)
}

function chipiError(...args: any[]) {
    console.error("[ChipiTx]", ...args)
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function useChipiTransaction() {
    const { getToken } = useAuth()
    const { user } = useUser()
    const { callAnyContractAsync } = useCallAnyContract()

    const [status, setStatus] = useState<ChipiTransactionStatus>("idle")
    const [txHash, setTxHash] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Prevent double-submission
    const isSubmittingRef = useRef(false)

    /**
     * Get wallet credentials from Clerk user metadata.
     * Can be overridden by passing wallet directly in params.
     */
    const getWallet = useCallback(
        (override?: ChipiTransactionParams["wallet"]) => {
            if (override) return override

            const publicKey = user?.publicMetadata?.publicKey as string | undefined
            const encryptedPrivateKey = user?.publicMetadata?.encryptedPrivateKey as string | undefined

            if (!publicKey || !encryptedPrivateKey) {
                throw new Error("Wallet data not available. Please ensure your account is set up.")
            }

            return { publicKey, encryptedPrivateKey }
        },
        [user]
    )

    /**
     * Execute a transaction through ChipiPay with L2 confirmation.
     *
     * @param params - Transaction parameters (pin, contract, calls)
     * @returns Result with txHash and confirmed/reverted status
     * @throws Error with descriptive message on failure
     */
    const executeTransaction = useCallback(
        async (params: ChipiTransactionParams): Promise<ChipiTransactionResult> => {
            if (isSubmittingRef.current) {
                throw new Error("A transaction is already in progress")
            }

            isSubmittingRef.current = true
            setStatus("submitting")
            setError(null)
            setTxHash(null)

            try {
                // 1. Get bearer token
                const token = await getToken({
                    template: process.env.NEXT_PUBLIC_CLERK_TEMPLATE_NAME,
                })

                if (!token) {
                    throw new Error("No bearer token found. Please try to login again.")
                }

                // 2. Get wallet credentials
                const wallet = getWallet(params.wallet)

                chipiLog("Submitting transaction:", {
                    contractAddress: params.contractAddress,
                    calls: params.calls.map((c) => ({
                        entrypoint: c.entrypoint,
                        contractAddress: c.contractAddress,
                        calldataLength: c.calldata.length,
                    })),
                })

                // 3. Call ChipiPay SDK
                const result = await callAnyContractAsync({
                    params: {
                        encryptKey: params.pin,
                        wallet: {
                            publicKey: wallet.publicKey,
                            encryptedPrivateKey: wallet.encryptedPrivateKey,
                        },
                        contractAddress: params.contractAddress,
                        calls: params.calls,
                    },
                    bearerToken: token,
                })

                chipiLog("SDK response:", result, "type:", typeof result)

                // 4. Validate response is a real tx hash
                if (!result || typeof result !== "string" || !result.startsWith("0x") || result.length < 10) {
                    throw new Error(`Invalid transaction response: ${JSON.stringify(result)}`)
                }

                setTxHash(result)
                setStatus("confirming")

                chipiLog("Tx hash received, waiting for L2 confirmation:", result)

                // 5. Wait for L2 confirmation
                try {
                    const receipt = await provider.waitForTransaction(result, {
                        retryInterval: 3000,
                    })

                    chipiLog("Receipt:", receipt)

                    // Check execution status
                    const executionStatus = (receipt as any)?.execution_status || (receipt as any)?.status
                    const isReverted =
                        executionStatus === "REVERTED" ||
                        executionStatus === "REJECTED" ||
                        (receipt as any)?.revert_reason

                    if (isReverted) {
                        const revertReason =
                            (receipt as any)?.revert_reason ||
                            `Transaction reverted (status: ${executionStatus})`

                        chipiError("Transaction reverted:", revertReason)
                        setStatus("reverted")
                        setError(revertReason)

                        return { txHash: result, status: "reverted", revertReason }
                    }

                    chipiLog("Transaction confirmed on L2")
                    setStatus("confirmed")
                    return { txHash: result, status: "confirmed" }
                } catch (receiptError: any) {
                    // waitForTransaction can throw if the transaction is rejected
                    chipiError("Failed waiting for receipt:", receiptError?.message)
                    setStatus("reverted")
                    const reason = receiptError?.message || "Transaction failed on L2"
                    setError(reason)
                    return { txHash: result, status: "reverted", revertReason: reason }
                }
            } catch (err: any) {
                chipiError("Transaction error:", err?.message)
                chipiError("Full error:", err)

                setStatus("error")
                const errorMessage = err instanceof Error ? err.message : "Transaction failed"
                setError(errorMessage)
                throw err
            } finally {
                isSubmittingRef.current = false
            }
        },
        [getToken, getWallet, callAnyContractAsync]
    )

    /** Reset state back to idle */
    const reset = useCallback(() => {
        setStatus("idle")
        setTxHash(null)
        setError(null)
        isSubmittingRef.current = false
    }, [])

    // Human-readable status message for UI display
    const statusMessage = (() => {
        switch (status) {
            case "submitting":
                return "Submitting transaction..."
            case "confirming":
                return "Confirming on blockchain..."
            case "confirmed":
                return "Transaction confirmed!"
            case "reverted":
                return "Transaction reverted"
            case "error":
                return "Transaction failed"
            default:
                return undefined
        }
    })()

    return {
        executeTransaction,
        reset,
        status,
        statusMessage,
        txHash,
        error,
        isSubmitting: status === "submitting" || status === "confirming",
    }
}
