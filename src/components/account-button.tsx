"use client"

import { Button } from "@/src/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { SignInButton, useUser, useClerk } from "@clerk/nextjs"
import { useToast } from "@/src/hooks/use-toast"

export function AccountButton() {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "Come back soon!",
      })
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  if (!isLoaded) {
    return (
      <Button size="sm" variant="secondary" className="rounded-full">
        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
      </Button>
    )
  }

  if (isSignedIn && user) {
    return (
      <div className="glass-card rounded-full px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt={user.fullName || "User"} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
              {user.firstName?.charAt(0) || "U"}
            </div>
          )}
          <span className="text-sm font-medium hidden sm:inline">{user.firstName || user.fullName}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleSignOut()}
          className="h-8 w-8 rounded-full"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <SignInButton
      mode="modal"
      fallbackRedirectUrl={typeof window !== "undefined" ? window.location.href : "/"}
      signUpFallbackRedirectUrl={typeof window !== "undefined" ? window.location.href : "/"}
    >
      <Button
        className="glass-card rounded-full hover:scale-105 transition-transform"
        variant="secondary"
      >
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign In
        </div>
      </Button>
    </SignInButton>
  )
}
