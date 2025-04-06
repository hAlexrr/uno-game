"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trophy, ChevronUp, ChevronDown } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"

export default function Scoreboard() {
  const { gameState, showScoreboard, setShowScoreboard } = useMultiplayerContext()

  if (!gameState) return null

  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId)

  return (
    <motion.div
      className="absolute top-2 left-2"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-2">
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Current Turn: <span className="font-medium">{currentPlayer?.name || "Waiting..."}</span>
          </p>

          {showScoreboard && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Trophy size={14} className="text-yellow-500" />
                  <span className="font-medium">Scores</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowScoreboard(!showScoreboard)}
                >
                  <ChevronUp size={14} />
                </Button>
              </div>

              <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                {Object.entries(gameState.scores).map(([name, score]) => (
                  <div key={name} className="flex justify-between">
                    <span>{name}</span>
                    <span className="font-medium">{score}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {!showScoreboard && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-full p-0 flex justify-between items-center"
              onClick={() => setShowScoreboard(!showScoreboard)}
            >
              <div className="flex items-center gap-1 text-sm">
                <Trophy size={14} className="text-yellow-500" />
                <span className="font-medium">Scores</span>
              </div>
              <ChevronDown size={14} />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

