"use client"

import { useState, useMemo } from "react"
import { Plus, ChevronDown, Check, Zap } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/src/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { mockCollections } from "@/src/lib/data/mock-data"

interface CollectionSelectorProps {
  selectedCollection: string | null
  onCollectionSelect: (collectionId: string) => void
  creatorId?: string
}

export function CollectionSelector({
  selectedCollection,
  onCollectionSelect,
  creatorId = "1",
}: CollectionSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState("")

  // Filter collections by creator and search query
  const userCollections = useMemo(() => {
    return mockCollections
      .filter((col) => col.creatorId === creatorId)
      .filter((col) => col.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [creatorId, searchQuery])

  const selectedCollectionData = mockCollections.find((col) => col.id === selectedCollection)

  const handleCreateCollection = () => {
    if (newCollectionName.trim()) {
      // In a real app, this would call an API
      console.log("[v0] Creating new collection:", newCollectionName)
      setNewCollectionName("")
      setShowCreateDialog(false)
      // Simulate collection creation
      const newId = String(mockCollections.length + 1)
      onCollectionSelect(newId)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
          <Zap className="h-4 w-4" />
        </div>
        <div>
          <label className="text-sm font-medium">Asset Collection</label>
          <p className="text-xs text-zinc-400">Organize your asset into a collection</p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-zinc-900/50 border-white/10 hover:bg-zinc-800/50"
          >
            <div className="flex items-center gap-2 text-left">
              {selectedCollectionData ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/50 to-purple-600/50 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{selectedCollectionData.name}</p>
                    <p className="text-xs text-zinc-400">{selectedCollectionData.totalItems} items</p>
                  </div>
                </>
              ) : (
                <span className="text-zinc-400">Select or create a collection</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-72">
          <div className="p-2">
            <Input
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>

          <DropdownMenuSeparator />

          {userCollections.length > 0 ? (
            <>
              <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider">
                Your Collections
              </DropdownMenuLabel>
              {userCollections.map((collection) => (
                <DropdownMenuItem
                  key={collection.id}
                  onClick={() => onCollectionSelect(collection.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/50 to-purple-600/50 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{collection.name}</p>
                      <p className="text-xs text-zinc-400">
                        {collection.totalItems} items • {collection.owners} owners
                      </p>
                    </div>
                    {selectedCollection === collection.id && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                  </div>
                </DropdownMenuItem>
              ))}
            </>
          ) : searchQuery ? (
            <div className="px-2 py-6 text-center text-sm text-zinc-400">No collections found</div>
          ) : (
            <div className="px-2 py-4 text-center text-sm text-zinc-400">No collections yet</div>
          )}

          <DropdownMenuSeparator />

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setShowCreateDialog(true)
                }}
                className="cursor-pointer text-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Collection
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Collection Name</label>
                  <Input
                    placeholder="Enter collection name..."
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-sm text-blue-400">
                    Create a new collection now, or go to the full collection creator for more advanced options.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection} disabled={!newCollectionName.trim()}>
                    Create Collection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false)
                      window.location.href = "/create/collection"
                    }}
                  >
                    Advanced Options
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
