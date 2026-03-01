import type React from "react"

export function DocH2({
  id,
  children,
  border = false,
}: {
  id: string
  children: React.ReactNode
  border?: boolean
}) {
  return (
    <h2
      id={id}
      className={`text-2xl font-bold text-white mt-12 mb-4 scroll-mt-24${border ? " border-b border-white/10 pb-3 flex items-center gap-3 mt-14 mb-5" : ""}`}
    >
      {children}
    </h2>
  )
}

export function DocH3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-white mt-6 mb-3">{children}</h3>
}

export function DocCodeBlock({ children, lang = "ts" }: { children: string; lang?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden my-4">
      <div className="px-4 py-2 border-b border-white/10 bg-white/[0.02]">
        <span className="text-xs text-muted-foreground font-mono">{lang}</span>
      </div>
      <pre className="p-4 text-xs font-mono text-green-300/90 overflow-x-auto leading-relaxed whitespace-pre">
        {children}
      </pre>
    </div>
  )
}
