"use client"

import { motion } from "framer-motion"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import PlayerHand from "./player-hand"
import { AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function HumanPlayer() {
  const { gameState, playerId, showEmoji, isCurrentPlayerTurn, callUnoAction } = useMultiplayerContext()

  const currentPlayer = gameState?.players.find((p) => p.id === playerId)

  if (!currentPlayer) return null

  const hasOneCard = currentPlayer.cards.length === 1

  return (
    <div className="w-full flex flex-col items-center">
      {/* Player name and status */}
      <motion.div
        className={`px-4 py-1 rounded-full mb-2 flex items-center gap-2 ${
          isCurrentPlayerTurn() ? "bg-primary text-primary-foreground" : "bg-gray-200 dark:bg-gray-700"
        }`}
        animate={
          isCurrentPlayerTurn()
            ? {
                scale: [1, 1.05, 1],
                y: [0, -5, 0],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: isCurrentPlayerTurn() ? Number.POSITIVE_INFINITY : 0,
        }}
      >
        <span className="font-medium">{currentPlayer.name} (You)</span>
        {isCurrentPlayerTurn() && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Your Turn</span>}

        {/* UNO call button - now always visible when player has one card */}
        {hasOneCard && (
          <Button
            size="sm"
            variant="destructive"
            onClick={callUnoAction}
            className="ml-2 flex items-center gap-1"
            disabled={!isCurrentPlayerTurn()}
          >
            <AlertTriangle size={14} />
            Call UNO!
          </Button>
        )}

        {/* Emoji reaction */}
        <AnimatePresence>
          {showEmoji && showEmoji.playerId === playerId && (
            <motion.div
              className="text-2xl ml-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring" }}
            >
              {showEmoji.emoji}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Player's hand */}
      <PlayerHand />
    </div>
  )
}

