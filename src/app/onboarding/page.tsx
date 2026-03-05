"use client";

import * as React from "react";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useCreateWallet, Chain, isWebAuthnSupported, createWalletPasskey } from "@chipi-stack/nextjs";
import { completeOnboarding } from "./_actions";

export default function OnboardingComponent() {
  const { user } = useUser();
  const { session } = useClerk();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";

  const { createWalletAsync, isLoading, isError } = useCreateWallet();
  const { getToken } = useAuth();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [generalError, setGeneralError] = React.useState<string>("");
  const [showPinFallback, setShowPinFallback] = React.useState(false);
  const [pinError, setPinError] = React.useState<string>("");

  // Computed once on mount — synchronous browser API check
  const [passkeySupported] = React.useState(() =>
    typeof window !== "undefined" && isWebAuthnSupported()
  );

  // ── Shared wallet creation ───────────────────────────────────────────────

  const createWalletWithKey = async (encryptKey: string) => {
    const token = await getToken({ template: process.env.NEXT_PUBLIC_CLERK_TEMPLATE_NAME });
    if (!token) throw new Error("No bearer token found");

    const response = await createWalletAsync({
      params: {
        encryptKey,
        externalUserId: user?.id as string,
        chain: "STARKNET" as Chain,
      },
      bearerToken: token,
    });

    const wallet = (response as any).wallet ?? response;
    if (!wallet?.publicKey) {
      throw new Error(`Failed to create wallet. Response: ${JSON.stringify(response)}`);
    }

    const result = await completeOnboarding({
      publicKey: wallet.publicKey,
      encryptedPrivateKey: wallet.encryptedPrivateKey,
    });

    if (result.error) throw new Error(result.error);

    await user?.reload();
    // Force Clerk to issue a fresh JWT so middleware sees walletCreated: true
    await session?.touch();

    // Non-blocking — provision API key in background
    fetch("/api/portal/provision", { method: "POST" }).catch(() => { });

    window.location.assign(redirectUrl);
  };

  // ── Passkey flow ─────────────────────────────────────────────────────────

  const handlePasskeySetup = async () => {
    setIsSubmitting(true);
    setGeneralError("");
    try {
      const userName =
        user?.primaryEmailAddress?.emailAddress ??
        user?.username ??
        "user";
      const { encryptKey } = await createWalletPasskey(user?.id ?? "", userName);
      await createWalletWithKey(encryptKey);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Passkey setup failed";
      setGeneralError(msg);
      // Passkey failed — reveal PIN fallback automatically
      setShowPinFallback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── PIN fallback flow ────────────────────────────────────────────────────

  const validatePin = (pin: string): string => {
    if (!pin || pin.trim() === "") return "PIN is required";
    if (!/^\d+$/.test(pin)) return "PIN must contain only numbers";
    if (pin.length < 6) return "PIN must be at least 6 characters";
    if (pin.length > 12) return "PIN must be no more than 12 characters";
    return "";
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPinError(validatePin(e.target.value));
    if (generalError) setGeneralError("");
  };

  const handlePinSubmit = async (formData: FormData) => {
    const pin = formData.get("pin") as string;
    const err = validatePin(pin);
    if (err) { setPinError(err); return; }

    setIsSubmitting(true);
    setGeneralError("");
    try {
      await createWalletWithKey(pin);
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────

  if (isLoading || isSubmitting) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-md bg-blue-400/10 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-blue-300/20 text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-300 mx-auto mb-4" />
          <div className="font-semibold">Securing your account…</div>
          <p className="text-sm mt-2">Setting up your secure vault.</p>
        </motion.div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-md bg-red-400/10 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-red-300/20 text-center"
        >
          <div className="text-red-300 font-semibold text-xl mb-2">Error</div>
          <p className="text-red-200/70">Failed to secure account. Please try again or contact support.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-400/20 hover:bg-red-400/30 transition rounded-lg font-medium"
          >
            Try Again
          </button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-md p-8 rounded-2xl shadow-2xl max-w-md w-full border border-blue-300/20"
      >
        <h1 className="text-3xl font-extrabold mb-2">Starknet Account</h1>
        <p className="mb-6 text-sm opacity-70">
          {passkeySupported && !showPinFallback
            ? "Our app will generate an invisible wallet for your account. Use a passkey to protect your wallet — works with Face ID, Touch ID, Windows Hello, hardware security keys, and password managers like 1Password."
            : "Our app will generate an invisible wallet for your account. Create a security PIN to protect your wallet and store it safely, we cannot access or restore your PIN."}
        </p>

        {generalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-red-400/10 border border-red-300/20 rounded-lg"
          >
            <p className="text-red-300 text-sm font-medium">{generalError}</p>
          </motion.div>
        )}

        {/* ── Passkey-first UI ── */}
        {passkeySupported && !showPinFallback ? (
          <div className="space-y-4">
            <button
              onClick={handlePasskeySetup}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-[1.02]"
            >
              <span className="text-2xl">🔑</span>
              <span>Continue with passkey</span>
            </button>

            <button
              onClick={() => { setShowPinFallback(true); setGeneralError(""); }}
              className="w-full text-center text-sm opacity-50 hover:opacity-80 transition py-2"
            >
              Use a PIN instead
            </button>
          </div>
        ) : (
          /* ── PIN fallback form ── */
          <form action={handlePinSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Create Security PIN
                </label>
                <p className="text-xs opacity-60 mb-3">
                  Choose 6–12 digits. This PIN cannot be recovered if lost.
                </p>
                <input
                  type="password"
                  name="pin"
                  inputMode="numeric"
                  pattern="[0-9]{6,12}"
                  minLength={6}
                  maxLength={12}
                  required
                  onChange={handlePinChange}
                  className={`w-full px-3 py-3 bg-blue-200/10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 text-lg tracking-wider transition-all ${pinError
                    ? "border-red-300/50 focus:ring-red-300/50 focus:border-red-300"
                    : "border-blue-200/20 focus:ring-blue-300/50 focus:border-blue-300"
                    }`}
                  placeholder="Enter 6–12 digit PIN"
                />
                {pinError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-red-300 text-sm font-medium"
                  >
                    {pinError}
                  </motion.p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!!pinError || isSubmitting}
              className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${pinError || isSubmitting
                ? "bg-gray-400/20 cursor-not-allowed opacity-50"
                : "bg-blue-400/20 hover:bg-blue-400/30 hover:shadow-lg hover:scale-[1.02]"
                }`}
            >
              {isSubmitting ? "Securing account…" : "Complete Setup"}
            </button>

            {passkeySupported && (
              <button
                type="button"
                onClick={() => { setShowPinFallback(false); setGeneralError(""); setPinError(""); }}
                className="w-full text-center text-sm opacity-50 hover:opacity-80 transition py-2 mt-2"
              >
                Use passkey instead
              </button>
            )}
          </form>
        )}
      </motion.div>
    </main>
  );
}
