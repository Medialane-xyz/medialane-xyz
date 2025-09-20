"use client"

import type React from "react"
import "@/src/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/src/components/theme-provider"
import { Toaster } from "@/src/components/ui/toaster"
import { MockDataProvider } from "@/src/lib/context/mock-data-context"
import FloatingNav from "@/src/components/floating-nav"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <MockDataProvider>
            <div className="relative min-h-screen">
              <FloatingNav />
              <main>{children}</main>
              <Toaster />
            </div>
          </MockDataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
