"use client"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { useRouter } from "next/navigation"

export default function CreateCollectionPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md text-center p-8 bg-card/50 backdrop-blur border-primary/20">
        <CardContent className="space-y-6">
          <h1 className="text-3xl font-bold text-primary">Coming Soon</h1>
          <p className="text-muted-foreground">
            Collection creation is currently being upgraded to support the new Chipi wallet integration.
            Please check back later!
          </p>
          <Button onClick={() => router.back()} className="w-full">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
