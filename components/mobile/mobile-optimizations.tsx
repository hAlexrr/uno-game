"use client"

import { useEffect, useState } from "react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { useMobile } from "@/hooks/use-mobile"

export default function MobileOptimizations() {
  const { gameState } = useMultiplayerContext()
  const isMobile = useMobile()
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)

  // Apply mobile-specific optimizations
  useEffect(() => {
    if (!isMobile) return

    // Add meta viewport tag to prevent zooming
    const metaViewport = document.querySelector('meta[name="viewport"]')
    if (metaViewport) {
      metaViewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
    }

    // Add touch event listeners for card swiping
    const handleTouchStart = (e: TouchEvent) => {
      setTouchStartX(e.touches[0].clientX)
      setTouchStartY(e.touches[0].clientY)
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches[0]) return

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY

      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY

      // Detect swipe direction
      if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50) {
        // Horizontal swipe - could be used for navigating between cards
        if (deltaX > 0) {
          // Swipe right
          console.log("Swipe right detected")
        } else {
          // Swipe left
          console.log("Swipe left detected")
        }
      } else if (Math.abs(deltaY) > 100 && Math.abs(deltaX) < 50) {
        // Vertical swipe - could be used for playing a card
        if (deltaY < 0) {
          // Swipe up - play card
          console.log("Swipe up detected - could play a card")
        } else {
          // Swipe down - cancel selection
          console.log("Swipe down detected - could cancel selection")
        }
      }
    }

    document.addEventListener("touchstart", handleTouchStart)
    document.addEventListener("touchend", handleTouchEnd)

    // Add mobile-specific CSS
    const style = document.createElement("style")
    style.innerHTML = `
      @media (max-width: 768px) {
        /* Increase touch targets */
        button {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Optimize for smaller screens */
        .card-hand {
          transform: scale(0.9);
        }
        
        /* Prevent text selection */
        * {
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
      document.head.removeChild(style)
    }
  }, [isMobile])

  // Add mobile-specific classes to elements
  useEffect(() => {
    if (!isMobile) return

    // Add mobile classes to card hand
    const cardHand = document.querySelector(".player-hand")
    if (cardHand) {
      cardHand.classList.add("card-hand")
    }

    // Optimize button layout for mobile
    const buttons = document.querySelectorAll("button")
    buttons.forEach((button) => {
      if (button.innerText.length > 10) {
        button.setAttribute("data-full-text", button.innerText)
        button.innerText = button.innerText.substring(0, 10) + "..."
      }
    })

    return () => {
      // Cleanup
      buttons.forEach((button) => {
        const fullText = button.getAttribute("data-full-text")
        if (fullText) {
          button.innerText = fullText
          button.removeAttribute("data-full-text")
        }
      })
    }
  }, [isMobile, gameState])

  // This component doesn't render anything visible
  return null
}

