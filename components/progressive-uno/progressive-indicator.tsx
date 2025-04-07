"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"

export default function ProgressiveIndicator() {
  const { gameState } = useMultiplayerContext()
  const [drawCount, setDrawCount] = useState(0)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    if (!gameState || !gameState.progressiveDrawCount) {
      setDrawCount(0)
      setShowIndicator(false)
      return
    }

    if (gameState.progressiveDrawCount > 0) {
      setDrawCount(gameState.progressiveDrawCount)
      setShowIndicator(true)

      // Hide the indicator after a while if it doesn't change
      const timeout = setTimeout(() => {
        setShowIndicator(false)
      }, 5000)

      return () => clearTimeout(timeout)
    } else {
      setShowIndicator(false)
    }
  }, [gameState])

  // If progressive UNO is not enabled or there's no draw count, don't show anything
  if (!gameState?.gameSettings.progressive || !showIndicator || drawCount === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", damping: 12 }}
      >
        <motion.div
          className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
        >
          <AlertTriangle size={20} className="animate-pulse" />
          <div className="font-bold text-xl">Draw stack: +{drawCount}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

