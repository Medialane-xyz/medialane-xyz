"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Switch } from "@/src/components/ui/switch"
import { Separator } from "@/src/components/ui/separator"
import { mockAssets } from "@/src/lib/data/mock-data"
import { useToast } from "@/src/hooks/use-toast"
import { Check, CheckCircle2, ImageIcon, Shield, Sparkles, Wand2, ChevronRight, ChevronLeft } from "lucide-react"
import { createOffer, type LicensingOffer } from "@/src/lib/offers-store"

type Asset = (typeof mockAssets)[number]

function parseStrkPrice(x: string | number | null | undefined): number {
  if (typeof x === "number") return x
  if (!x) return 0
  const n = Number.parseFloat(String(x))
  return Number.isFinite(n) ? n : 0
}

function suggestPrice(opts: {
  basePrice: number
  licenseType: "standard" | "extended"
  duration: "perpetual" | "1y" | "5y"
  territory: "worldwide" | "na" | "eu" | "custom"
}): number {
  const { basePrice, licenseType, duration, territory } = opts
  const typeMult = licenseType === "extended" ? 0.6 : 0.2
  const durationMult = duration === "perpetual" ? 2 : duration === "5y" ? 1.5 : 1
  const terrMult = territory === "worldwide" ? 1.2 : territory === "na" || territory === "eu" ? 1.1 : 1
  const v = basePrice * typeMult * durationMult * terrMult
  // minimum floor to keep UX sane
  return Math.max(0.01, Number(v.toFixed(2)))
}

export function LicensingOfferFlow({
  assetId,
  initialStep,
}: {
  assetId?: string
  initialStep?: 1 | 2 | 3
}) {
  const router = useRouter()
  const { toast } = useToast()

  // Steps: 1 Select, 2 Configure, 3 Review
  const [step, setStep] = useState<1 | 2 | 3>(initialStep || 1)
  const [search, setSearch] = useState("")
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  // License configuration
  const [licenseType, setLicenseType] = useState<"standard" | "extended">("standard")
  const [duration, setDuration] = useState<"perpetual" | "1y" | "5y">("perpetual")
  const [territory, setTerritory] = useState<"worldwide" | "na" | "eu" | "custom">("worldwide")
  const [customTerritory, setCustomTerritory] = useState("")
  const [attribution, setAttribution] = useState(true)
  const [derivatives, setDerivatives] = useState(false)
  const [licensedName, setLicensedName] = useState("")
  const [notes, setNotes] = useState("")
  const [amount, setAmount] = useState<number>(0)
  const [expiresInDays, setExpiresInDays] = useState<number>(7)
  const [placing, setPlacing] = useState(false)
  const [success, setSuccess] = useState<LicensingOffer | null>(null)

  // Preselect asset if provided
  useEffect(() => {
    if (assetId) {
      const found = mockAssets.find((a) => String(a.id) === String(assetId)) || null
      setSelectedAsset(found)
      if (found) {
        const base = parseStrkPrice(found.price)
        const suggestion = suggestPrice({ basePrice: base, licenseType, duration, territory })
        setAmount(suggestion)
        setLicensedName(`${found.name} — Licensed`)
      }
      setStep(initialStep || 2)
    }
  }, [assetId, initialStep])

  // Update suggested amount when core knobs change
  useEffect(() => {
    if (!selectedAsset) return
    const base = parseStrkPrice(selectedAsset.price)
    const suggestion = suggestPrice({ basePrice: base, licenseType, duration, territory })
    // Only auto-update if user hasn’t changed from suggestion by more than tiny epsilon
    if (amount === 0 || Math.abs(amount - suggestion) < 0.01) {
      setAmount(suggestion)
    }
    // Derivatives default for extended
    setDerivatives((d) => (licenseType === "extended" ? true : d && false))
  }, [licenseType, duration, territory, selectedAsset])

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

  const territoryLabel =
    territory === "custom" ? (customTerritory.trim() ? customTerritory.trim() : "Custom") : territory.toUpperCase()

  const canNextFromStep1 = !!selectedAsset
  const canPlaceOffer =
    !!selectedAsset && !!licensedName.trim() && Number.isFinite(amount) && amount > 0 && expiresInDays > 0

  function resetFlow() {
    setStep(1)
    setSelectedAsset(null)
    setSuccess(null)
    setSearch("")
    setLicenseType("standard")
    setDuration("perpetual")
    setTerritory("worldwide")
    setCustomTerritory("")
    setAttribution(true)
    setDerivatives(false)
    setLicensedName("")
    setNotes("")
    setAmount(0)
    setExpiresInDays(7)
  }

  function handlePlaceOffer() {
    if (!canPlaceOffer || !selectedAsset) {
      toast({ title: "Missing info", description: "Please complete the configuration first.", duration: 1600 })
      return
    }
    setPlacing(true)
    setTimeout(() => {
      const offer = createOffer({
        assetId: String(selectedAsset.id),
        assetName: String(selectedAsset.name),
        image: selectedAsset.image,
        buyer: "You",
        licenseType,
        duration,
        territory,
        customTerritory: territory === "custom" ? customTerritory.trim() : undefined,
        attribution,
        derivatives,
        notes: notes.trim() || undefined,
        amount,
        expiresInDays,
      })
      setPlacing(false)
      setSuccess(offer)
      toast({
        title: "Offer created",
        description: "Your licensing offer is now pending owner approval.",
        duration: 2400,
      })
    }, 900)
  }

  // Success screen
  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Offer Submitted
            </CardTitle>
            <CardDescription>Your licensing offer is pending the owner’s approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg overflow-hidden border border-white/10">
                <div className="aspect-square">
                  <img
                    src={
                      success.image ||
                      "/placeholder.svg?height=800&width=800&query=licensed-offer-success-preview" ||
                      "/placeholder.svg"
                    }
                    alt={success.assetName}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <InfoPill label="Asset" value={success.assetName} />
                  <InfoPill label="Amount" value={`${success.amount} STRK`} />
                  <InfoPill label="License" value={success.licenseType} />
                  <InfoPill
                    label="Duration"
                    value={
                      success.duration === "perpetual" ? "Perpetual" : success.duration === "1y" ? "1 year" : "5 years"
                    }
                  />
                  <InfoPill
                    label="Territory"
                    value={
                      success.territory === "custom"
                        ? success.customTerritory || "Custom"
                        : success.territory.toUpperCase()
                    }
                  />
                  <InfoPill label="Attribution" value={success.attribution ? "Required" : "Not required"} />
                  <InfoPill label="Derivatives" value={success.derivatives ? "Allowed" : "Not allowed"} />
                  <InfoPill label="Status" value="Pending approval" />
                </div>
                {success.notes && (
                  <div className="p-3 rounded-lg bg-black/5 border border-white/10 text-sm">
                    <div className="text-xs text-muted-foreground mb-1">Notes</div>
                    {success.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-3 rounded-lg border border-emerald-500/30">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-emerald-400 mr-2" />
                <span className="font-medium text-emerald-400">Low-fee Licensing</span>
              </div>
              <p className="text-sm mt-1 text-muted-foreground">
                Licensing offers are recorded on-chain when approved. MediaLane does not charge platform fees.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" onClick={resetFlow}>
                Create another offer
              </Button>
              <Button variant="secondary" onClick={() => router.push("/portfolio/licensings")}>
                View my licensings
              </Button>
              <Button onClick={() => router.push(`/assets/${success.assetId}`)}>Back to asset</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <StepBadge active={step === 1} done={step > 1}>
          1
        </StepBadge>
        <span className="text-sm">Select Asset</span>
        <div className="mx-2 text-muted-foreground">/</div>
        <StepBadge active={step === 2} done={step > 2}>
          2
        </StepBadge>
        <span className="text-sm">Configure Terms</span>
        <div className="mx-2 text-muted-foreground">/</div>
        <StepBadge active={step === 3} done={false}>
          3
        </StepBadge>
        <span className="text-sm">Review & Offer</span>
      </div>

      {/* Step 1: Select asset */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Original Asset</CardTitle>
            <CardDescription>Choose the IP you want to license from</CardDescription>
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
              {filteredAssets.slice(0, 40).map((a) => {
                const isSelected = selectedAsset?.id === a.id
                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      setSelectedAsset(a)
                      setLicensedName(`${a.name} — Licensed`)
                      const base = parseStrkPrice(a.price)
                      setAmount(suggestPrice({ basePrice: base, licenseType, duration, territory }))
                    }}
                    className={`text-left rounded-lg overflow-hidden border transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                      isSelected ? "border-primary/60" : "border-white/10 hover:border-primary/50"
                    }`}
                    aria-label={`Select asset ${a.name}`}
                  >
                    <div className="aspect-square bg-black/5">
                      <img
                        src={a.image || "/placeholder.svg?height=400&width=400&query=asset-card"}
                        alt={String(a.name)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        style={{ contentVisibility: "auto" as any }}
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
                )
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {selectedAsset ? `Selected: ${selectedAsset.name}` : "No asset selected"}
              </div>
              <Button onClick={() => setStep(2)} disabled={!canNextFromStep1} className="inline-flex items-center">
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Configure terms */}
      {step === 2 && selectedAsset && (
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
                <InfoPill label="Original" value={String(selectedAsset.name)} />
                <InfoPill label="Category" value={String(selectedAsset.category)} />
                <InfoPill label="Base Price" value={String(selectedAsset.price)} />
                <InfoPill label="Type" value="Programmable IP" />
              </div>

              <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 p-3 rounded-lg border border-emerald-500/30">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-emerald-400 mr-2" />
                  <span className="font-medium text-emerald-400">Low-fee Licensing</span>
                </div>
                <p className="text-sm mt-1 text-muted-foreground">
                  Your offer will be submitted to the owner for approval. No platform fees are charged by MediaLane.
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
              <CardDescription>Customize terms and your offer amount</CardDescription>
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
                    <RadioCard
                      id="lt-standard"
                      value="standard"
                      title="Standard"
                      desc="Personal + limited commercial"
                    />
                    <RadioCard
                      id="lt-extended"
                      value="extended"
                      title="Extended"
                      desc="Full commercial + derivatives"
                      emphasis
                    />
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <RadioGroup
                    value={duration}
                    onValueChange={(v) => setDuration(v as "perpetual" | "1y" | "5y")}
                    className="grid grid-cols-3 gap-2"
                  >
                    <RadioCard id="d-perp" value="perpetual" title="Perpetual" />
                    <RadioCard id="d-1y" value="1y" title="1 year" />
                    <RadioCard id="d-5y" value="5y" title="5 years" />
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Territory</Label>
                  <RadioGroup
                    value={territory}
                    onValueChange={(v) => setTerritory(v as "worldwide" | "na" | "eu" | "custom")}
                    className="grid grid-cols-4 gap-2"
                  >
                    <RadioCard id="t-world" value="worldwide" title="Worldwide" />
                    <RadioCard id="t-na" value="na" title="NA" />
                    <RadioCard id="t-eu" value="eu" title="EU" />
                    <RadioCard id="t-custom" value="custom" title="Custom" />
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
                  <Label>Notes / Intended Use (optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add optional notes about how you plan to use this licensed asset…"
                  />
                </div>
              </div>

              <Separator />

              {/* Offer controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Offer Amount (STRK)</Label>
                  <Input
                    inputMode="decimal"
                    value={Number.isFinite(amount) ? String(amount) : ""}
                    onChange={(e) => setAmount(Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() =>
                        setAmount(
                          suggestPrice({
                            basePrice: parseStrkPrice(selectedAsset.price),
                            licenseType,
                            duration,
                            territory,
                          }),
                        )
                      }
                    >
                      Use suggestion
                    </button>
                    <span className="text-xs text-muted-foreground">Base: {String(selectedAsset.price)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Offer Expires In (days)</Label>
                  <Input
                    inputMode="numeric"
                    value={Number.isFinite(expiresInDays) ? String(expiresInDays) : ""}
                    onChange={(e) => setExpiresInDays(Number.parseInt(e.target.value || "0") || 0)}
                    placeholder="7"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quick Summary</Label>
                  <div className="p-3 rounded-lg bg-black/5 border border-white/10 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">License</span>
                      <span className="capitalize">{licenseType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span>{duration === "perpetual" ? "Perpetual" : duration === "1y" ? "1 year" : "5 years"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Territory</span>
                      <span>{territory === "worldwide" ? "Worldwide" : territoryLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={() => setStep(1)} className="inline-flex items-center">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!canPlaceOffer} className="inline-flex items-center">
                  Review
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sticky mobile CTA */}
          <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-6xl px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!canPlaceOffer}>
                Review
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && selectedAsset && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Place Offer</CardTitle>
            <CardDescription>Confirm details before submitting to the owner</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg overflow-hidden border border-white/10 md:col-span-1">
                <div className="aspect-square">
                  <img
                    src={selectedAsset.image || "/placeholder.svg?height=800&width=800&query=review-preview"}
                    alt={String(selectedAsset.name)}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-3">
                <InfoPill label="Original" value={String(selectedAsset.name)} />
                <InfoPill label="Category" value={String(selectedAsset.category)} />
                <InfoPill label="Licensed Name" value={licensedName || `${selectedAsset.name} — Licensed`} />
                <InfoPill label="License Type" value={licenseType} />
                <InfoPill
                  label="Duration"
                  value={duration === "perpetual" ? "Perpetual" : duration === "1y" ? "1 year" : "5 years"}
                />
                <InfoPill label="Territory" value={territory === "worldwide" ? "Worldwide" : territoryLabel} />
                <InfoPill label="Attribution" value={attribution ? "Required" : "Not required"} />
                <InfoPill label="Derivatives" value={derivatives ? "Allowed" : "Not allowed"} />
                <InfoPill label="Offer Amount" value={`${amount} STRK`} />
                <InfoPill label="Expires In" value={`${expiresInDays} days`} />
              </div>
            </div>

            {notes.trim() && (
              <div className="p-3 rounded-lg bg-black/5 border border-white/10 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Notes</div>
                {notes}
              </div>
            )}

            <div className="bg-black/5 border border-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500" />
                Zero platform fee. Offer will be recorded on-chain when approved by the owner.
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="inline-flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                onClick={handlePlaceOffer}
                disabled={!canPlaceOffer || placing}
                className="inline-flex items-center"
              >
                {placing ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                    Placing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Place Offer
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

function StepBadge({
  active,
  done,
  children,
}: {
  active?: boolean
  done?: boolean
  children: React.ReactNode
}) {
  return (
    <span
      className={[
        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
        active
          ? "bg-primary text-primary-foreground"
          : done
            ? "bg-green-600/80 text-white"
            : "bg-muted text-foreground/60",
      ].join(" ")}
      aria-current={active ? "step" : undefined}
    >
      {children}
    </span>
  )
}

function RadioCard({
  id,
  value,
  title,
  desc,
  emphasis,
}: {
  id: string
  value: string
  title: string
  desc?: string
  emphasis?: boolean
}) {
  return (
    <div
      className={[
        "p-3 rounded-lg border",
        emphasis ? "border-primary/30 bg-primary/5" : "border-white/10 bg-black/5",
      ].join(" ")}
    >
      <div className="flex items-start gap-2">
        <RadioGroupItem id={id} value={value} className="mt-0.5" />
        <div>
          <Label htmlFor={id} className="font-medium">
            {title}
          </Label>
          {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
        </div>
      </div>
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-black/5 border border-white/10">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-medium text-sm line-clamp-1">{value}</div>
    </div>
  )
}
