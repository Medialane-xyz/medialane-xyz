"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Settings, Bell, Zap, Heart, ShoppingCart, Users, MessageCircle, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Switch } from "@/src/components/ui/switch"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { useToast } from "@/src/components/ui/use-toast"
import PageTransition from "@/src/components/page-transition"

export default function NotificationSettingsPage() {
  const { toast } = useToast()
  const [emailFrequency, setEmailFrequency] = useState("daily")

  // Notification settings
  const [settings, setSettings] = useState({
    // Push notifications
    push_bids: true,
    push_sales: true,
    push_follows: true,
    push_mentions: true,
    push_collections: true,
    push_events: false,
    push_platform: true,

    // Email notifications
    email_bids: true,
    email_sales: true,
    email_follows: false,
    email_mentions: false,
    email_collections: true,
    email_events: true,
    email_platform: true,

    // In-app notifications
    inapp_bids: true,
    inapp_sales: true,
    inapp_follows: true,
    inapp_mentions: true,
    inapp_collections: true,
    inapp_events: true,
    inapp_platform: true,
  })

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your notification preferences have been updated",
      duration: 3000,
    })
  }

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
            <Bell className="w-4 h-4 mr-2 text-primary" />
            <span className="text-sm font-medium">Notification Preferences</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 gradient-text">Notification Settings</h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl">
            Customize how and when you receive notifications about your IP assets and activity
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="push" className="w-full">
            <TabsList className="mb-6 glass-effect">
              <TabsTrigger value="push">Push Notifications</TabsTrigger>
              <TabsTrigger value="email">Email Notifications</TabsTrigger>
              <TabsTrigger value="inapp">In-App Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="push">
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Push Notification Settings</CardTitle>
                  <CardDescription>
                    Configure which push notifications you want to receive on your device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                      <Label htmlFor="push_bids">Bids and Offers</Label>
                    </div>
                    <Switch
                      id="push_bids"
                      checked={settings.push_bids}
                      onCheckedChange={() => handleToggle("push_bids")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <Label htmlFor="push_sales">Sales and Purchases</Label>
                    </div>
                    <Switch
                      id="push_sales"
                      checked={settings.push_sales}
                      onCheckedChange={() => handleToggle("push_sales")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <Label htmlFor="push_follows">New Followers</Label>
                    </div>
                    <Switch
                      id="push_follows"
                      checked={settings.push_follows}
                      onCheckedChange={() => handleToggle("push_follows")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-orange-500" />
                      <Label htmlFor="push_mentions">Mentions and Comments</Label>
                    </div>
                    <Switch
                      id="push_mentions"
                      checked={settings.push_mentions}
                      onCheckedChange={() => handleToggle("push_mentions")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <Label htmlFor="push_collections">Collection Updates</Label>
                    </div>
                    <Switch
                      id="push_collections"
                      checked={settings.push_collections}
                      onCheckedChange={() => handleToggle("push_collections")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <Label htmlFor="push_events">Events and Announcements</Label>
                    </div>
                    <Switch
                      id="push_events"
                      checked={settings.push_events}
                      onCheckedChange={() => handleToggle("push_events")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-cyan-500" />
                      <Label htmlFor="push_platform">Platform Updates</Label>
                    </div>
                    <Switch
                      id="push_platform"
                      checked={settings.push_platform}
                      onCheckedChange={() => handleToggle("push_platform")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email">
              <Card className="glass-effect border-white/10 mb-6">
                <CardHeader>
                  <CardTitle>Email Digest Frequency</CardTitle>
                  <CardDescription>Choose how often you want to receive email notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={emailFrequency} onValueChange={setEmailFrequency}>
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="realtime" id="realtime" />
                      <Label htmlFor="realtime">Real-time (as they happen)</Label>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily">Daily digest</Label>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly">Weekly digest</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="none" id="none" />
                      <Label htmlFor="none">Don't send emails</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>Email Notification Settings</CardTitle>
                  <CardDescription>Configure which email notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                      <Label htmlFor="email_bids">Bids and Offers</Label>
                    </div>
                    <Switch
                      id="email_bids"
                      checked={settings.email_bids}
                      onCheckedChange={() => handleToggle("email_bids")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <Label htmlFor="email_sales">Sales and Purchases</Label>
                    </div>
                    <Switch
                      id="email_sales"
                      checked={settings.email_sales}
                      onCheckedChange={() => handleToggle("email_sales")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <Label htmlFor="email_follows">New Followers</Label>
                    </div>
                    <Switch
                      id="email_follows"
                      checked={settings.email_follows}
                      onCheckedChange={() => handleToggle("email_follows")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <Label htmlFor="email_collections">Collection Updates</Label>
                    </div>
                    <Switch
                      id="email_collections"
                      checked={settings.email_collections}
                      onCheckedChange={() => handleToggle("email_collections")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <Label htmlFor="email_events">Events and Announcements</Label>
                    </div>
                    <Switch
                      id="email_events"
                      checked={settings.email_events}
                      onCheckedChange={() => handleToggle("email_events")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inapp">
              <Card className="glass-effect border-white/10">
                <CardHeader>
                  <CardTitle>In-App Notification Settings</CardTitle>
                  <CardDescription>Configure which notifications you want to see within the app</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                      <Label htmlFor="inapp_bids">Bids and Offers</Label>
                    </div>
                    <Switch
                      id="inapp_bids"
                      checked={settings.inapp_bids}
                      onCheckedChange={() => handleToggle("inapp_bids")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-500" />
                      <Label htmlFor="inapp_sales">Sales and Purchases</Label>
                    </div>
                    <Switch
                      id="inapp_sales"
                      checked={settings.inapp_sales}
                      onCheckedChange={() => handleToggle("inapp_sales")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <Label htmlFor="inapp_follows">New Followers</Label>
                    </div>
                    <Switch
                      id="inapp_follows"
                      checked={settings.inapp_follows}
                      onCheckedChange={() => handleToggle("inapp_follows")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4 text-orange-500" />
                      <Label htmlFor="inapp_mentions">Mentions and Comments</Label>
                    </div>
                    <Switch
                      id="inapp_mentions"
                      checked={settings.inapp_mentions}
                      onCheckedChange={() => handleToggle("inapp_mentions")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <Label htmlFor="inapp_collections">Collection Updates</Label>
                    </div>
                    <Switch
                      id="inapp_collections"
                      checked={settings.inapp_collections}
                      onCheckedChange={() => handleToggle("inapp_collections")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-indigo-500" />
                      <Label htmlFor="inapp_events">Events and Announcements</Label>
                    </div>
                    <Switch
                      id="inapp_events"
                      checked={settings.inapp_events}
                      onCheckedChange={() => handleToggle("inapp_events")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-cyan-500" />
                      <Label htmlFor="inapp_platform">Platform Updates</Label>
                    </div>
                    <Switch
                      id="inapp_platform"
                      checked={settings.inapp_platform}
                      onCheckedChange={() => handleToggle("inapp_platform")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave}>Save Preferences</Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
