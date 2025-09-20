"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Separator } from "@/src/components/ui/separator"
import { GitBranch, Zap, ExternalLink, ChevronRight, ChevronDown, Info } from "lucide-react"
import { useMockData } from "@/src/lib/hooks/use-mock-data"
import Link from "next/link"

interface RemixGenealogyTreeProps {
  assetId: string
  className?: string
}

interface TreeNode {
  asset: any
  children: TreeNode[]
  generation: number
  isExpanded?: boolean
}

export function RemixGenealogyTree({ assetId, className = "" }: RemixGenealogyTreeProps) {
  const { assets } = useMockData()
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())

  // Build the remix tree using useMemo to prevent infinite loops
  const remixTree = useMemo(() => {
    if (!assets || !assetId) return null

    const currentAsset = assets.find((a) => a.id === assetId)
    if (!currentAsset) return null

    // Find the root asset (original creation)
    let rootAsset = currentAsset
    while (rootAsset.originalAssetId) {
      const parent = assets.find((a) => a.id === rootAsset.originalAssetId)
      if (!parent) break
      rootAsset = parent
    }

    // Build tree recursively
    const buildTree = (asset: any, generation = 0): TreeNode => {
      const remixes = assets.filter((a) => a.originalAssetId === asset.id)
      return {
        asset,
        generation,
        children: remixes.map((remix) => buildTree(remix, generation + 1)),
        isExpanded: expandedNodes.has(asset.id),
      }
    }

    return buildTree(rootAsset)
  }, [assets, assetId, expandedNodes])

  // Calculate tree statistics
  const treeStats = useMemo(() => {
    if (!remixTree) return { totalNodes: 0, maxGeneration: 0, totalCreators: 0 }

    const calculateStats = (node: TreeNode): any => {
      const childStats = node.children.map(calculateStats)
      const totalNodes = 1 + childStats.reduce((sum, stats) => sum + stats.totalNodes, 0)
      const maxGeneration = Math.max(node.generation, ...childStats.map((stats) => stats.maxGeneration))
      const creators = new Set([node.asset.creatorId, ...childStats.flatMap((stats) => Array.from(stats.creators))])

      return { totalNodes, maxGeneration, creators }
    }

    const stats = calculateStats(remixTree)
    return {
      totalNodes: stats.totalNodes,
      maxGeneration: stats.maxGeneration,
      totalCreators: stats.creators.size,
    }
  }, [remixTree])

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId)
      } else {
        newSet.add(nodeId)
      }
      return newSet
    })
  }

  const TreeNodeComponent = ({ node, isCurrentAsset = false }: { node: TreeNode; isCurrentAsset?: boolean }) => {
    const hasChildren = node.children.length > 0
    const isExpanded = expandedNodes.has(node.asset.id)

    return (
      <div className="space-y-2">
        <Card className={`transition-all hover:shadow-md ${isCurrentAsset ? "ring-2 ring-primary ring-offset-2" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <Button variant="ghost" size="sm" onClick={() => toggleNode(node.asset.id)} className="h-6 w-6 p-0">
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              )}

              {/* Generation Icon */}
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  node.generation === 0 ? "bg-green-100 dark:bg-green-900" : "bg-blue-100 dark:bg-blue-900"
                }`}
              >
                {node.generation === 0 ? (
                  <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <GitBranch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>

              {/* Asset Info */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={node.asset.image || "/placeholder.svg"} alt={node.asset.name} />
                <AvatarFallback>{node.asset.name?.substring(0, 2) || "AS"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="truncate font-medium">{node.asset.name}</h4>
                  {isCurrentAsset && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                  {node.generation === 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      Original
                    </Badge>
                  )}
                  {node.generation > 0 && <Badge variant="outline">Gen {node.generation}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">by {node.asset.creator}</p>
                <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{node.asset.views?.toLocaleString() || 0} views</span>
                  <span>{node.asset.likes?.toLocaleString() || 0} likes</span>
                  {hasChildren && (
                    <span>
                      {node.children.length} remix{node.children.length !== 1 ? "es" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{node.asset.price}</span>
                <Link href={`/assets/${node.asset.id}`}>
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-8 space-y-2 border-l-2 border-muted pl-4">
            {node.children.map((child) => (
              <TreeNodeComponent key={child.asset.id} node={child} isCurrentAsset={child.asset.id === assetId} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!remixTree) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Info className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-medium">No Remix Tree Available</h3>
              <p className="text-sm text-muted-foreground">Unable to load the remix genealogy for this asset.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Tree Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Remix Genealogy Tree
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{treeStats.totalNodes}</div>
              <div className="text-sm text-muted-foreground">Total Assets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{treeStats.maxGeneration}</div>
              <div className="text-sm text-muted-foreground">Max Generation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{treeStats.totalCreators}</div>
              <div className="text-sm text-muted-foreground">Unique Creators</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span>Original Creation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              <span>Remix</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary"></div>
              <span>Current Asset</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree Visualization */}
      <Card>
        <CardContent className="p-6">
          <TreeNodeComponent node={remixTree} isCurrentAsset={remixTree.asset.id === assetId} />
        </CardContent>
      </Card>
    </div>
  )
}

// Named export for flexibility

// Default export
export default RemixGenealogyTree
