"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/src/lib/utils"
import * as Collapsible from "@radix-ui/react-collapsible"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
  hash?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { label: "Quick Start", href: "/docs", hash: "#quick-start" },
      { label: "Authentication", href: "/docs", hash: "#authentication" },
      { label: "Rate Limits", href: "/docs", hash: "#rate-limits" },
      { label: "Error Codes", href: "/docs", hash: "#error-codes" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { label: "Orders", href: "/docs/api", hash: "#orders" },
      { label: "Collections", href: "/docs/api", hash: "#collections" },
      { label: "Tokens", href: "/docs/api", hash: "#tokens" },
      { label: "Activities", href: "/docs/api", hash: "#activities" },
      { label: "Intents", href: "/docs/api", hash: "#intents" },
      { label: "Metadata", href: "/docs/api", hash: "#metadata" },
      { label: "Search", href: "/docs/api", hash: "#search" },
      { label: "Portal", href: "/docs/api", hash: "#portal" },
    ],
  },
  {
    title: "SDK",
    items: [
      { label: "Install", href: "/docs/sdk", hash: "#install" },
      { label: "Configure", href: "/docs/sdk", hash: "#configure" },
      { label: "Marketplace", href: "/docs/sdk", hash: "#marketplace" },
      { label: "API Client", href: "/docs/sdk", hash: "#api-client" },
    ],
  },
]

function isItemActive(pathname: string, item: NavItem) {
  if (item.href === "/docs") return pathname === "/docs"
  return pathname.startsWith(item.href)
}

function SidebarSection({ section, pathname }: { section: NavSection; pathname: string }) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger className="flex w-full items-center justify-between py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
        {section.title}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", open ? "rotate-180" : "")} />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <ul className="pb-3 space-y-0.5">
          {section.items.map((item) => (
            <li key={item.label}>
              <Link
                href={item.hash ? `${item.href}${item.hash}` : item.href}
                className={cn(
                  "block px-3 py-1.5 rounded-lg text-sm transition-colors",
                  isItemActive(pathname, item)
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-muted-foreground hover:text-white hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}

export function DocsSidebar() {
  const pathname = usePathname()

  return (
    <nav className="space-y-4">
      {NAV.map((section) => (
        <SidebarSection key={section.title} section={section} pathname={pathname} />
      ))}
    </nav>
  )
}
