"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { useMultiplayerContext } from "@/context/multiplayer-context"

export default function TurnTimer() {
  const { gameState, isCurrentPlayerTurn, endTurn, roomCode } = useMultiplayerContext()
  const [timeLeft, setTimeLeft] = useState(30)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!gameState || !gameState.gameStarted) return

    // Reset timer when turn changes
    setTimeLeft(30)

    // Only run timer for the current player
    if (!isCurrentPlayerTurn()) return

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Start a new timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - end the turn
          if (roomCode) {
            endTurn(roomCode)
          }

          // Clear the interval
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }

          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Clean up on unmount or when turn changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState?.currentPlayerId, gameState?.gameStarted, isCurrentPlayerTurn, roomCode, endTurn])

  if (!gameState?.gameStarted || !isCurrentPlayerTurn()) return null

  // Move the timer completely above the cards instead of overlapping
  return (
    <motion.div
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[280px]" // Moved much higher up
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Your turn</span>
          <span className={`text-sm font-bold ${timeLeft <= 10 ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
            {timeLeft}s
          </span>
        </div>
      </div>
    </motion.div>
  )
}

