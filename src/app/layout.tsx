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

const inter = Inter({ subsets: ["latin"], display: "swap" })

import type { Metadata } from "next"

export const viewport = {
  themeColor: 'black',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://medialane.xyz"),
  alternates: {
    canonical: './',
  },
  title: {
    default: "MediaLane",
    template: "%s | MediaLane",
  },
  description: "Monetization hub for the integrity web. Launch, share and monetize your creative works",
  keywords: ["NFT", "Marketplace", "Starknet", "IP", "Intellectual Property", "Remix", "Creative Works", "Trade"],
  authors: [{ name: "MediaLane" }],
  creator: "MediaLane",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "MediaLane",
    description: "Monetization hub for the integrity web. Launch, share and monetize your creative works",
    siteName: "MediaLane",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MediaLane",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MediaLane",
    description: "Monetization hub for the integrity web. Launch, share and monetize your creative works",
    images: ["/og-image.jpg"],
    creator: "@medialane_xyz",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      afterSignOutUrl="/"
    >
      <Providers>
        <html lang="en" suppressHydrationWarning>
          <body className={`${inter.className}`}>
            <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
              <FramerMotionProvider>
                <div className="relative min-h-screen flex flex-col">
                  <FloatingNav />
                  <main className="flex-1">{children}</main>
                  {/* <Footer /> */}
                  <Toaster />
                </div>
              </FramerMotionProvider>
            </ThemeProvider>
          </body>
        </html>
      </Providers>
    </ClerkProvider>
  )
}
