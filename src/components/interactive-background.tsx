"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

export default function InteractiveBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    let animationFrameId
    let particles = []

    // Set canvas dimensions with lower resolution for better performance
    const handleResize = () => {
      // Use a lower resolution for better performance
      const scale = 0.5 // 50% of the actual screen size
      canvas.width = window.innerWidth * scale
      canvas.height = window.innerHeight * scale
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(scale, scale)
      initParticles()
    }

    window.addEventListener("resize", handleResize)
    handleResize()

    // Initialize particles with fewer particles for better performance
    function initParticles() {
      particles = []
      // Reduce particle count for better performance
      const particleCount = Math.min(50, Math.floor(window.innerWidth / 40))

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width * 2,
          y: Math.random() * canvas.height * 2,
          radius: Math.random() * 1.5 + 0.5, // Smaller particles
          color: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 50 + 50)}, ${Math.floor(
            Math.random() * 200 + 50,
          )}, ${Math.random() * 0.3 + 0.1})`, // More transparent
          vx: Math.random() * 0.2 - 0.1,
          vy: Math.random() * 0.2 - 0.1,
          originX: Math.random() * canvas.width * 2,
          originY: Math.random() * canvas.height * 2,
        })
      }
    }

    // Animation loop with optimizations
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width * 2, canvas.height * 2)

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width * 2, canvas.height * 2)
      gradient.addColorStop(0, "#0f0f0f")
      gradient.addColorStop(1, "#1a1a1a")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width * 2, canvas.height * 2)

      // Update and draw particles
      particles.forEach((particle) => {
        // Apply slight attraction to original position
        particle.vx += (particle.originX - particle.x) * 0.0002
        particle.vy += (particle.originY - particle.y) * 0.0002

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.fill()
      })

      // Connect particles with lines if they're close
      ctx.strokeStyle = "rgba(120, 80, 200, 0.03)"
      ctx.lineWidth = 0.2

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 80) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full -z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    />
  )
}
