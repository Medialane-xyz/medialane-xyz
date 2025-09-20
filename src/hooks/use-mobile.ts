"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window !== "undefined") {
      // Initial check
      setIsMobile(window.innerWidth < 768)

      // Add event listener for resize
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768)
      }

      window.addEventListener("resize", handleResize)

      // Check for touch capability as well
      if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
        setIsMobile(true)
      }

      // Cleanup
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [])

  return isMobile
}
