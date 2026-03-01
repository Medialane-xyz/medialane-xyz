import type React from "react"
import { DocsSidebar } from "@/src/components/docs/sidebar"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block w-60 flex-shrink-0">
            <div className="sticky top-24 pt-8 pb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6 px-3">
                Documentation
              </p>
              <DocsSidebar />
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 py-8 pb-24">
            <div className="max-w-3xl prose-custom">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
