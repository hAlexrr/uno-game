"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BarChart, ChevronUp } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"

export default function GameStats() {
  const { gameState } = useMultiplayerContext()
  const [showStats, setShowStats] = useState(false)

  if (!gameState || !gameState.gameStarted) return null

  // Calculate statistics
  const totalCards = gameState.players.reduce((sum, player) => sum + player.cards.length, 0) + gameState.cardsRemaining
  const cardsInPlay = gameState.players.reduce((sum, player) => sum + player.cards.length, 0)
  const cardsPercentage = Math.round((cardsInPlay / totalCards) * 100)

  if (!showStats) {
    return (
      <motion.div
        className="absolute top-20 right-2" // Changed from left-2 to right-2
        initial={{ x: 50, opacity: 0 }} // Changed from x: -50 to x: 50
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => setShowStats(true)}>
          <BarChart size={14} />
          Stats
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="absolute top-20 right-2 w-48" // Changed from left-2 to right-2
      initial={{ x: 50, opacity: 0 }} // Changed from x: -50 to x: 50
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-sm">
            <BarChart size={14} />
            <span className="font-medium">Game Stats</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowStats(false)}>
            <ChevronUp size={14} />
          </Button>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Players:</span>
            <span className="font-medium">{gameState.players.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Cards in deck:</span>
            <span className="font-medium">{gameState.cardsRemaining}</span>
          </div>
          <div className="flex justify-between">
            <span>Cards in play:</span>
            <span className="font-medium">{cardsInPlay}</span>
          </div>
          <div className="flex justify-between">
            <span>Cards played:</span>
            <span className="font-medium">{totalCards - cardsInPlay - gameState.cardsRemaining}</span>
          </div>

          <div className="mt-2">
            <div className="flex justify-between mb-1">
              <span>Game progress:</span>
              <span className="font-medium">{cardsPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cardsPercentage}%` }}></div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

