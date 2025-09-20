"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { PlusCircle, Upload, FileText, Image, Music, Code, Briefcase, ChevronRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Label } from "@/src/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { useToast } from "@/src/components/ui/use-toast"
import PageTransition from "@/src/components/page-transition"

export default function CreateNewIPPage() {
  const [step, setStep] = useState(1)
  const [assetType, setAssetType] = useState("")
  const { toast } = useToast()

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      toast({
        title: "IP Asset Created",
        description: "Your new IP asset has been created successfully!",
        duration: 3000,
      })
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const assetTypes = [
    {
      id: "art",
      name: "Digital Art",
      icon: <Image className="h-8 w-8 text-purple-500" />,
      description: "Digital artwork, illustrations, 3D models, and other visual creations",
    },
    {
      id: "music",
      name: "Music",
      icon: <Music className="h-8 w-8 text-blue-500" />,
      description: "Music compositions, sound recordings, and audio productions",
    },
    {
      id: "patent",
      name: "Patent",
      icon: <Briefcase className="h-8 w-8 text-green-500" />,
      description: "Patents, inventions, and technical innovations",
    },
    {
      id: "literature",
      name: "Literature",
      icon: <FileText className="h-8 w-8 text-yellow-500" />,
      description: "Books, articles, scripts, and other written works",
    },
    {
      id: "code",
      name: "Software",
      icon: <Code className="h-8 w-8 text-cyan-500" />,
      description: "Software, algorithms, and code libraries",
    },
  ]

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-32 px-4 md:px-8">
        <motion.div
          className="flex flex-col items-center text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
            <PlusCircle className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium">Create New IP</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 gradient-text">Tokenize Your IP</h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl">
            Turn your intellectual property into tokenized assets on the Starknet blockchain
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Progress steps */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary" : "bg-zinc-700"}`}
                >
                  <span className="text-white font-medium">1</span>
                </div>
                <span className="text-sm mt-2">Select Type</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-zinc-700">
                <div
                  className={`h-full ${step >= 2 ? "bg-primary" : ""}`}
                  style={{ width: step >= 2 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary" : "bg-zinc-700"}`}
                >
                  <span className="text-white font-medium">2</span>
                </div>
                <span className="text-sm mt-2">Asset Details</span>
              </div>

              <div className="flex-1 h-1 mx-2 bg-zinc-700">
                <div
                  className={`h-full ${step >= 3 ? "bg-primary" : ""}`}
                  style={{ width: step >= 3 ? "100%" : "0%" }}
                ></div>
              </div>

              <div className="flex flex-col items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary" : "bg-zinc-700"}`}
                >
                  <span className="text-white font-medium">3</span>
                </div>
                <span className="text-sm mt-2">Rights & Licensing</span>
              </div>
            </div>
          </motion.div>

          {/* Step content */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
            {step === 1 && (
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Select IP Asset Type</CardTitle>
                  <CardDescription>Choose the type of intellectual property you want to tokenize</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assetTypes.map((type) => (
                      <div
                        key={type.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          assetType === type.id
                            ? "border-primary bg-primary/10"
                            : "border-white/10 hover:border-white/30"
                        }`}
                        onClick={() => setAssetType(type.id)}
                      >
                        <div className="flex items-center mb-2">
                          {type.icon}
                          <h3 className="text-lg font-medium ml-2">{type.name}</h3>
                        </div>
                        <p className="text-sm text-zinc-400">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleNext} disabled={!assetType}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 2 && (
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Asset Details</CardTitle>
                  <CardDescription>Provide information about your intellectual property</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="asset-name">Asset Name</Label>
                      <Input
                        id="asset-name"
                        placeholder="Enter a name for your IP asset"
                        className="bg-transparent border-white/10"
                      />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor="asset-description">Description</Label>
                      <Textarea
                        id="asset-description"
                        placeholder="Describe your intellectual property"
                        className="bg-transparent border-white/10 min-h-[100px]"
                      />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                      <Label>Upload Asset</Label>
                      <div className="border border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-white/40 transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
                        <p className="text-sm text-zinc-400">Drag and drop your file here, or click to browse</p>
                        <p className="text-xs text-zinc-500 mt-2">
                          Supported formats: PNG, JPG, MP3, MP4, PDF, ZIP (max 100MB)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="asset-price">Price (STRK)</Label>
                        <Input
                          id="asset-price"
                          type="number"
                          placeholder="0.00"
                          className="bg-transparent border-white/10"
                        />
                      </div>

                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="asset-royalty">Royalty (%)</Label>
                        <Input
                          id="asset-royalty"
                          type="number"
                          placeholder="10"
                          className="bg-transparent border-white/10"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleNext}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 3 && (
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Rights & Licensing</CardTitle>
                  <CardDescription>Define the rights and licensing terms for your IP asset</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="rights" className="w-full">
                    <TabsList className="mb-4 glass-effect">
                      <TabsTrigger value="rights">Rights</TabsTrigger>
                      <TabsTrigger value="licensing">Licensing</TabsTrigger>
                      <TabsTrigger value="terms">Terms</TabsTrigger>
                    </TabsList>

                    <TabsContent value="rights">
                      <div className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="rights-included">Rights Included</Label>
                          <Select>
                            <SelectTrigger className="bg-transparent border-white/10">
                              <SelectValue placeholder="Select rights to include" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Rights</SelectItem>
                              <SelectItem value="display">Display Rights</SelectItem>
                              <SelectItem value="commercial">Commercial Rights</SelectItem>
                              <SelectItem value="derivative">Derivative Works</SelectItem>
                              <SelectItem value="custom">Custom Rights Bundle</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="rights-excluded">Rights Excluded</Label>
                          <Textarea
                            id="rights-excluded"
                            placeholder="Specify any rights that are explicitly excluded"
                            className="bg-transparent border-white/10"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="licensing">
                      <div className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="license-type">License Type</Label>
                          <Select>
                            <SelectTrigger className="bg-transparent border-white/10">
                              <SelectValue placeholder="Select license type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="exclusive">Exclusive</SelectItem>
                              <SelectItem value="non-exclusive">Non-Exclusive</SelectItem>
                              <SelectItem value="sole">Sole License</SelectItem>
                              <SelectItem value="custom">Custom License</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="license-duration">License Duration</Label>
                          <Select>
                            <SelectTrigger className="bg-transparent border-white/10">
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="perpetual">Perpetual</SelectItem>
                              <SelectItem value="1-year">1 Year</SelectItem>
                              <SelectItem value="2-year">2 Years</SelectItem>
                              <SelectItem value="5-year">5 Years</SelectItem>
                              <SelectItem value="10-year">10 Years</SelectItem>
                              <SelectItem value="custom">Custom Period</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="license-territory">Territory</Label>
                          <Select>
                            <SelectTrigger className="bg-transparent border-white/10">
                              <SelectValue placeholder="Select territory" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="worldwide">Worldwide</SelectItem>
                              <SelectItem value="north-america">North America</SelectItem>
                              <SelectItem value="europe">Europe</SelectItem>
                              <SelectItem value="asia">Asia</SelectItem>
                              <SelectItem value="custom">Custom Region</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="terms">
                      <div className="space-y-4">
                        <div className="grid w-full items-center gap-1.5">
                          <Label htmlFor="terms-conditions">Terms & Conditions</Label>
                          <Textarea
                            id="terms-conditions"
                            placeholder="Specify any additional terms and conditions"
                            className="bg-transparent border-white/10 min-h-[150px]"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>
                    Back
                  </Button>
                  <Button onClick={handleNext}>Create IP Asset</Button>
                </CardFooter>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
