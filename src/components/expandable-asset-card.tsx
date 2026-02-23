"use client"

import { useState } from "react"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
  Share,
  Copy,
  Flag,
  Shield,
  CheckCircle,
  XCircle,
  Globe,
} from "lucide-react"
import type { AssetIP } from "@/src/types/asset"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { ReportAssetDialog } from "@/src/components/report-asset-dialog"
import { LazyMedia } from "@/src/components/ui/lazy-media"

interface ExpandableAssetCardProps {
  asset: AssetIP
  variant?: "grid" | "list"
  isOwner?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────

function PermissionDot({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <CheckCircle className="w-3 h-3 text-emerald-500" />
  ) : (
    <XCircle className="w-3 h-3 text-muted-foreground/40" />
  )
}

// ─── Main Component ──────────────────────────────────────────────────────

export function ExpandableAssetCard({
  asset,
  variant = "grid",
  isOwner = false,
}: ExpandableAssetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleShare = () => {
    const url = `${window.location.origin}/asset/${asset.slug}`
    navigator.clipboard.writeText(url)
  }

  const explorerUrl = (() => {
    const base = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://voyager.online"
    if (asset.contractAddress && asset.tokenId) {
      return `${base}/nft/${asset.contractAddress}/${asset.tokenId}`
    }
    return `${base}/nft/${asset.contractAddress}`
  })()

  const menuItems = (
    <>
      <DropdownMenuItem onClick={handleShare}>
        <Share className="w-3.5 h-3.5 mr-2" />
        Share
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/asset/${asset.slug}`)}>
        <Copy className="w-3.5 h-3.5 mr-2" />
        Copy Link
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => window.open(explorerUrl, "_blank")}>
        <ExternalLink className="w-3.5 h-3.5 mr-2" />
        Explorer
      </DropdownMenuItem>
      {!isOwner && (
        <>
          <DropdownMenuSeparator />
          <ReportAssetDialog
            contentType="asset"
            contentId={asset.id}
            contentTitle={asset.title}
            contentCreator={asset.author}
          >
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={(e) => e.preventDefault()}
            >
              <Flag className="w-3.5 h-3.5 mr-2" />
              Report
            </DropdownMenuItem>
          </ReportAssetDialog>
        </>
      )}
    </>
  )

  // ─── Expandable Details (Shared) ────────────────────────────────────

  const detailsPanel = (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-4 mt-4 border-t border-border/20 text-sm">
      <div className="space-y-2.5">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Info</h4>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network</span>
            <span className="text-foreground">{asset.blockchain}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Token</span>
            <span className="font-mono text-xs text-foreground">{asset.tokenId || asset.id}</span>
          </div>
          {asset.registrationDate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registered</span>
              <span className="text-foreground">{asset.registrationDate}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">License</h4>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Commercial</span>
            <PermissionDot allowed={asset.commercialUse} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Modify</span>
            <PermissionDot allowed={asset.modifications} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Attribution</span>
            <PermissionDot allowed={asset.attribution} />
          </div>
        </div>
      </div>

      {asset.externalUrl && (
        <div className="col-span-2 pt-1">
          <a
            href={asset.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Globe className="w-3 h-3" />
            External link
          </a>
        </div>
      )}
    </div>
  )

  // ─── List Variant ───────────────────────────────────────────────────

  if (variant === "list") {
    return (
      <div className="group rounded-xl border border-border/40 bg-card/50 hover:border-border/60 transition-colors">
        <div className="p-4">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-muted">
              <LazyMedia
                src={asset.mediaUrl || "/placeholder.svg"}
                alt={asset.title}
                width={64}
                height={64}
                className="w-16 h-16 object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {asset.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {asset.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-7 h-7 p-0">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">{menuItems}</DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 capitalize">
                  {asset.type}
                </Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  {asset.protectionStatus}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {asset.blockchain}
                </span>
              </div>
            </div>
          </div>

          {/* Expandable details */}
          {isExpanded && detailsPanel}
        </div>
      </div>
    )
  }

  // ─── Grid Variant ───────────────────────────────────────────────────

  return (
    <div className="group rounded-xl border border-border/40 bg-card/50 overflow-hidden hover:border-border/60 hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <LazyMedia
          src={asset.mediaUrl || "/placeholder.svg"}
          alt={asset.title}
          width={400}
          height={400}
          className="w-full h-full object-cover"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Type badge */}
        <Badge
          variant="outline"
          className="absolute bottom-2.5 left-2.5 bg-background/80 backdrop-blur-sm border-border/50 text-[10px] capitalize"
        >
          {asset.type}
        </Badge>

        {/* Menu button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2.5 right-2.5 w-7 h-7 p-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">{menuItems}</DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {asset.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {asset.description}
          </p>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>{asset.protectionStatus}</span>
            <span className="text-border">•</span>
            <span>{asset.blockchain}</span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded hover:bg-muted/50 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Expandable details */}
        {isExpanded && detailsPanel}
      </div>
    </div>
  )
}
