"use client"

import { useEffect, useRef } from "react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import confetti from "canvas-confetti"

// Special effects for different card types
const cardEffects = {
  skip: (container: HTMLDivElement) => {
    // Create a circular barrier effect
    const canvas = document.createElement("canvas")
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "50"
    container.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw circular barrier
    ctx.strokeStyle = "rgba(255, 0, 0, 0.7)"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2)
    ctx.stroke()

    // Add cross in the middle
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 40, canvas.height / 2)
    ctx.lineTo(canvas.width / 2 + 40, canvas.height / 2)
    ctx.stroke()

    // Remove after animation completes
    setTimeout(() => {
      canvas.remove()
    }, 1000)
  },

  reverse: (container: HTMLDivElement) => {
    // Create spinning arrows effect
    const canvas = document.createElement("canvas")
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "50"
    container.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let rotation = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 70

    const drawArrow = (x: number, y: number, angle: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)

      ctx.beginPath()
      ctx.moveTo(0, -15)
      ctx.lineTo(15, 0)
      ctx.lineTo(0, 15)
      ctx.closePath()
      ctx.fillStyle = "rgba(0, 150, 255, 0.8)"
      ctx.fill()

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw circular path
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(0, 150, 255, 0.3)"
      ctx.stroke()

      // Draw arrows along the path
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + rotation
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius
        drawArrow(x, y, angle + Math.PI / 2)
      }

      rotation += 0.05

      if (rotation < Math.PI * 4) {
        // Spin for 2 full rotations
        requestAnimationFrame(animate)
      } else {
        canvas.remove()
      }
    }

    animate()
  },

  draw2: (container: HTMLDivElement) => {
    // Create cards flying effect
    const canvas = document.createElement("canvas")
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "50"
    container.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cards = [
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: 3,
        vy: -3,
        width: 30,
        height: 40,
        rotation: 0,
        rotationSpeed: 0.05,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: -3,
        vy: -3,
        width: 30,
        height: 40,
        rotation: 0,
        rotationSpeed: -0.05,
      },
    ]

    const drawCard = (x: number, y: number, width: number, height: number, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)

      // Card body
      ctx.fillStyle = "rgba(0, 100, 255, 0.8)"
      ctx.fillRect(-width / 2, -height / 2, width, height)

      // Card border
      ctx.strokeStyle = "white"
      ctx.lineWidth = 2
      ctx.strokeRect(-width / 2, -height / 2, width, height)

      // Card text
      ctx.fillStyle = "white"
      ctx.font = "12px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("+2", 0, 0)

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      let allOffscreen = true

      cards.forEach((card) => {
        // Update position
        card.x += card.vx
        card.y += card.vy
        card.rotation += card.rotationSpeed

        // Draw card
        drawCard(card.x, card.y, card.width, card.height, card.rotation)

        // Check if any card is still on screen
        if (
          card.x > -card.width &&
          card.x < canvas.width + card.width &&
          card.y > -card.height &&
          card.y < canvas.height + card.height
        ) {
          allOffscreen = false
        }
      })

      if (!allOffscreen) {
        requestAnimationFrame(animate)
      } else {
        canvas.remove()
      }
    }

    animate()
  },

  wild: (container: HTMLDivElement) => {
    // Create color burst effect
    const colors = ["red", "blue", "green", "yellow"]

    // Use confetti for a colorful burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.5 },
      colors: colors,
      disableForReducedMotion: true,
    })
  },

  wild4: (container: HTMLDivElement) => {
    // Create more intense color burst effect
    const colors = ["red", "blue", "green", "yellow"]

    // First burst
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors: colors,
      disableForReducedMotion: true,
    })

    // Second burst after a short delay
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { x: 0.5, y: 0.5 },
        colors: colors,
        disableForReducedMotion: true,
      })
    }, 200)
  },
}

export default function CardAnimations() {
  const { gameState, animation } = useMultiplayerContext()
  const containerRef = useRef<HTMLDivElement>(null)

  // Track the last played card to trigger effects
  useEffect(() => {
    if (!containerRef.current || !gameState?.topCard) return

    // Check if a card was just played (animation.type === "playCard")
    if (animation.type === "playCard" && animation.card) {
      const card = animation.card

      // Trigger special effects based on card type/value
      if (card.value === "skip" && cardEffects.skip) {
        cardEffects.skip(containerRef.current)
      } else if (card.value === "reverse" && cardEffects.reverse) {
        cardEffects.reverse(containerRef.current)
      } else if (card.value === "draw2" && cardEffects.draw2) {
        cardEffects.draw2(containerRef.current)
      } else if (card.value === "wild" && cardEffects.wild) {
        cardEffects.wild(containerRef.current)
      } else if (card.value === "wild4" && cardEffects.wild4) {
        cardEffects.wild4(containerRef.current)
      }
    }
  }, [gameState?.topCard, animation])

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-40" />
}

