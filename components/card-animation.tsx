"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import UnoCardComponent from "./uno-card"
import { useEffect, useState } from "react"

export default function CardAnimation() {
  const { cardAnimations, removeCardAnimation } = useMultiplayerContext()
  const [visibleAnimations, setVisibleAnimations] = useState<typeof cardAnimations>([])

  // Process animations
  useEffect(() => {
    setVisibleAnimations(cardAnimations)

    // Auto-remove animations after they complete
    cardAnimations.forEach((animation) => {
      const timer = setTimeout(() => {
        removeCardAnimation(animation.id)
      }, 2000) // Animation duration

      return () => clearTimeout(timer)
    })
  }, [cardAnimations, removeCardAnimation])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {visibleAnimations.map((animation) => (
          <motion.div
            key={animation.id}
            className="absolute"
            initial={{
              x: animation.startX,
              y: animation.startY,
              scale: 1,
              rotate: 0,
              opacity: 1,
            }}
            animate={{
              x: animation.endX,
              y: animation.endY,
              scale: animation.type === "play" ? 1.2 : 0.8,
              rotate: animation.type === "play" ? [-5, 5, 0] : 0,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.5,
              times: [0, 0.8, 1],
            }}
          >
            {animation.card && <UnoCardComponent card={animation.card} onClick={() => {}} disabled={true} />}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

