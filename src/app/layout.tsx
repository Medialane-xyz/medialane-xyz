import type React from "react"
import "@/src/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/src/components/theme-provider"
import { Toaster } from "@/src/components/ui/toaster"
import { MockDataProvider } from "@/src/lib/context/mock-data-context"
import FloatingNav from "@/src/components/floating-nav"
import Footer from "@/src/components/footer"
import FramerMotionProvider from "@/src/lib/framer-motion-provider"
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from "./providers";
import StarknetProviderWrapper from "./starknet-provider-wrapper";

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata = {
  title: "MediaLane",
  description: "The permissionless marketplace for the integrity web",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignOutUrl="/"
    >
      <Providers>
          <StarknetProviderWrapper>
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <MockDataProvider>
            <FramerMotionProvider>
              <div className="relative min-h-screen flex flex-col">
                <FloatingNav />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster />
              </div>
            </FramerMotionProvider>
          </MockDataProvider>
        </ThemeProvider>
      </body>
    </html>
    </StarknetProviderWrapper>
        </Providers>
    </ClerkProvider>
  )
}
