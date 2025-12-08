"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Switch } from "@/src/components/ui/switch"
import { Separator } from "@/src/components/ui/separator"
import { useToast } from "@/src/components/ui/use-toast"
import { mockAssets } from "@/src/lib/data/mock-data"
import { ArrowLeft, Check, ImageIcon, Shield, Sparkles, Wand2 } from "lucide-react"

type Asset = (typeof mockAssets)[number]

export function LicensingDesigner({ assetId }: { assetId?: string }) {
  const router = useRouter()
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [isMinting, setIsMinting] = useState(false)

  // License config
  const [licenseType, setLicenseType] = useState<"standard" | "extended">("standard")
  const [duration, setDuration] = useState<"perpetual" | "1y" | "5y">("perpetual")
  const [territory, setTerritory] = useState<"worldwide" | "na" | "eu" | "custom">("worldwide")
  const [customTerritory, setCustomTerritory] = useState("")
  const [attribution, setAttribution] = useState(true)
  const [derivatives, setDerivatives] = useState(false)
  const [licensedName, setLicensedName] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (assetId) {
      const found = mockAssets.find((a) => String(a.id) === String(assetId)) || null
      setSelectedAsset(found)
    }
  }, [assetId])

  useEffect(() => {
    if (selectedAsset) {
      setLicensedName(`${selectedAsset.name} — Licensed`)
      // Derivatives allowed by default for Extended
      setDerivatives(licenseType === "extended")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAsset, licenseType])

  const filteredAssets = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mockAssets
    return mockAssets.filter(
      (a) =>
        String(a.name).toLowerCase().includes(q) ||
        String(a.category).toLowerCase().includes(q) ||
        String(a.creator).toLowerCase().includes(q),
    )
  }, [search])

  function handleMint() {
    if (!selectedAsset) {
      toast({
        title: "Select an asset first",
        description: "Choose an original asset to license and mint from.",
        duration: 2000,
      })
      return
    }
    if (!licensedName.trim()) {
      toast({ title: "Name required", description: "Please provide a licensed asset name.", duration: 1800 })
      return
    }
    setIsMinting(true)
    setTimeout(() => {
      setIsMinting(false)
      toast({
        title: "Licensed asset minted",
        description: `“${licensedName}” licensed via ${licenseType} terms.`,
        duration: 2600,
      })
      // Navigate to Licensings portfolio section
      router.push("/portfolio/licensings")
    }, 1400)
  }

  const territoryLabel =
    territory === "custom" ? (customTerritory.trim() ? customTerritory.trim() : "Custom") : territory.toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      {!selectedAsset && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold">Create Licensed Asset</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Select Original Asset</CardTitle>
              <CardDescription>Choose an existing asset from the marketplace to license from</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, category, or creator"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredAssets.slice(0, 24).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAsset(a)}
                    className="text-left rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`Select asset ${a.name}`}
                  >
                    <div className="aspect-square bg-black/5">
                      <img
                        src={a.image || "/placeholder.svg?height=400&width=400&query=asset-card"}
                        alt={String(a.name)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="p-2">
                      <div className="text-sm font-medium line-clamp-1">{String(a.name)}</div>
                      <div className="text-xs text-muted-foreground flex items-center justify-between mt-0.5">
                        <span className="line-clamp-1">{String(a.category)}</span>
                        <span className="font-medium">{String(a.price)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedAsset && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Change Asset
              </Button>
              <h1 className="text-xl md:text-2xl font-bold">Mint Licensed Asset</h1>
            </div>
            <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
              Zero Platform Fee
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Preview */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Preview
                </CardTitle>
                <CardDescription>Original asset and licensed metadata</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-white/10">
                  <div className="aspect-square">
                    <img
                      src={selectedAsset.image || "/placeholder.svg?height=800&width=800&query=licensed-preview"}
                      alt={String(selectedAsset.name)}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-black/5 border border-white/10">
                    <div className="text-[11px] text-muted-foreground">Original</div>
                    <div className="font-medium text-sm line-clamp-1">{String(selectedAsset.name)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/5 border border-white/10">
                    <div className="text-[11px] text-muted-foreground">Category</div>
                    <div className="font-medium text-sm">{String(selectedAsset.category)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/5 border border-white/10">
                    <div className="text-[11px] text-muted-foreground">License Type</div>
                    <div className="font-medium text-sm capitalize">{licenseType}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/5 border border-white/10">
                    <div className="text-[11px] text-muted-foreground">Scope</div>
                    <div className="font-medium text-sm">
                      {territory === "worldwide" ? "Worldwide" : territoryLabel}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-3 rounded-lg border border-emerald-500/30">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-emerald-400 mr-2" />
                    <span className="font-medium text-emerald-400">Low-fee Licensing</span>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Licenses are recorded on-chain. No platform fees are charged by the protocol.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Form */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5" />
                  License Configuration
                </CardTitle>
                <CardDescription>Customize terms for your licensed asset</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>License Type</Label>
                    <RadioGroup
                      value={licenseType}
                      onValueChange={(v) => setLicenseType(v as "standard" | "extended")}
                      className="grid grid-cols-2 gap-2"
                    >
                      <div className="p-3 rounded-lg border border-white/10 bg-black/5">
                        <div className="flex items-start gap-2">
                          <RadioGroupItem id="lt-standard" value="standard" className="mt-0.5" />
                          <div>
                            <Label htmlFor="lt-standard" className="font-medium">
                              Standard
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">Personal + limited commercial usage</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
                        <div className="flex items-start gap-2">
                          <RadioGroupItem id="lt-extended" value="extended" className="mt-0.5" />
                          <div>
                            <Label htmlFor="lt-extended" className="font-medium">
                              Extended
                            </Label>
                            <p className="text-xs text-muted-foreground mt-0.5">Full commercial + derivative works</p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <RadioGroup
                      value={duration}
                      onValueChange={(v) => setDuration(v as "perpetual" | "1y" | "5y")}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div className="p-3 rounded-lg border border-white/10 bg-black/5">
                        <div className="flex items-start gap-2">
                          <RadioGroupItem id="d-perp" value="perpetual" className="mt-0.5" />
                          <Label htmlFor="d-perp" className="font-medium">
                            Perpetual
                          </Label>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-white/10 bg-black/5">
                        <div className="flex items-start gap-2">
                          <RadioGroupItem id="d-1y" value="1y" className="mt-0.5" />
                          <Label htmlFor="d-1y" className="font-medium">
                            1 year
                          </Label>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-white/10 bg-black/5">
                        <div className="flex items-start gap-2">
                          <RadioGroupItem id="d-5y" value="5y" className="mt-0.5" />
                          <Label htmlFor="d-5y" className="font-medium">
                            5 years
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Territory</Label>
                    <RadioGroup
                      value={territory}
                      onValueChange={(v) => setTerritory(v as "worldwide" | "na" | "eu" | "custom")}
                      className="grid grid-cols-4 gap-2"
                    >
                      <div className="p-3 rounded-lg border border-white/10 bg-black/5">
                        <div className="flex items-start gap-2">
                          <RadioGroupItem id="t-world" value="worldwide" className="mt-0.5" />
                          <Label htmlFor="t-world" className="font-medium">
                            Worldwide
                          </Label>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-white/10 bg-black/5">
                        <div className="flex items-start gap-2">
                          <RadioGroupItem id="t-na" value="na" className="mt-0.5" />
                          <Label htmlFor="t-na" className="font-medium">
                            NA
                          </Label>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-white/10 bg-black/5">
                        <div className="flex items-start gap-2">
                          <RadioGroupItem id="t-eu" value="eu" className="mt-0.5" />
                          <Label htmlFor="t-eu" className="font-medium">
                            EU
                          </Label>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg border border-white/10 bg-black/5">
                        <div className="flex items-start gap-2">
                          <RadioGroupItem id="t-custom" value="custom" className="mt-0.5" />
                          <Label htmlFor="t-custom" className="font-medium">
                            Custom
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                    {territory === "custom" && (
                      <Input
                        value={customTerritory}
                        onChange={(e) => setCustomTerritory(e.target.value)}
                        placeholder="Specify territory (e.g., APAC, LATAM)"
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Attribution Required</Label>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/5 p-3">
                      <span className="text-sm text-muted-foreground">Creator attribution in usage</span>
                      <Switch checked={attribution} onCheckedChange={setAttribution} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Derivative Works</Label>
                    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/5 p-3">
                      <span className="text-sm text-muted-foreground">
                        Allow derivatives {licenseType === "standard" ? "(Extended only)" : ""}
                      </span>
                      <Switch
                        checked={derivatives}
                        onCheckedChange={setDerivatives}
                        disabled={licenseType === "standard"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Licensed Asset Name</Label>
                    <Input
                      value={licensedName}
                      onChange={(e) => setLicensedName(e.target.value)}
                      placeholder={`${selectedAsset.name} — Licensed`}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label>Notes / Intended Use</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add optional notes about how you plan to use this licensed asset…"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-black/5 border border-white/10">
                    <div className="text-xs text-muted-foreground">License Type</div>
                    <div className="font-medium capitalize">{licenseType}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/5 border border-white/10">
                    <div className="text-xs text-muted-foreground">Duration</div>
                    <div className="font-medium">
                      {duration === "perpetual" ? "Perpetual" : duration === "1y" ? "1 year" : "5 years"}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/5 border border-white/10">
                    <div className="text-xs text-muted-foreground">Territory</div>
                    <div className="font-medium">{territory === "worldwide" ? "Worldwide" : territoryLabel}</div>
                  </div>
                </div>

                <div className="bg-black/5 border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Zero platform fee. Licensing events are recorded on-chain.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setSelectedAsset(null)}>
                    Change Asset
                  </Button>
                  <Button onClick={handleMint} disabled={isMinting}>
                    {isMinting ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                        Minting…
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Mint Licensed Asset
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile sticky action */}
          <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-6xl px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setSelectedAsset(null)}>
                Change
              </Button>
              <Button onClick={handleMint} disabled={isMinting}>
                <Sparkles className="h-4 w-4 mr-2" />
                {isMinting ? "Minting…" : "Mint"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
