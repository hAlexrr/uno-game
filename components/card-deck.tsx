"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCw } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import UnoCardComponent from "./uno-card"

export default function CardDeck() {
  const { gameState, isCurrentPlayerTurn, winner, drawACard, lastAction } = useMultiplayerContext()

  if (!gameState) return null

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Current color indicator - moved from game-board to here for better visibility */}
      {gameState.currentColor && (
        <motion.div
          className={`w-12 h-12 rounded-full shadow-lg mb-2 border-2 border-white flex items-center justify-center ${
            gameState.currentColor === "red"
              ? "bg-red-600"
              : gameState.currentColor === "blue"
                ? "bg-blue-600"
                : gameState.currentColor === "green"
                  ? "bg-green-600"
                  : gameState.currentColor === "yellow"
                    ? "bg-yellow-500"
                    : "bg-gray-400"
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          key={gameState.currentColor}
          transition={{ type: "spring" }}
        >
          <span className="text-white font-bold text-xs">{gameState.currentColor.toUpperCase()}</span>
        </motion.div>
      )}

      <div className="flex items-center gap-12">
        {" "}
        {/* Increased gap between cards even more */}
        {/* Draw pile */}
        <motion.div
          className="relative w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-inner flex items-center justify-center"
          animate={
            gameState.gameStarted === false
              ? {
                  rotate: [0, 5, -5, 5, -5, 0],
                  x: [0, 5, -5, 5, -5, 0],
                  y: [0, 5, -5, 5, -5, 0],
                }
              : {}
          }
          transition={{ duration: 1, repeat: gameState.gameStarted === false ? Number.POSITIVE_INFINITY : 0 }}
        >
          <Button
            variant="outline"
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white border-2 border-white"
            onClick={() => drawACard()}
            disabled={!isCurrentPlayerTurn() || !!winner}
          >
            <RotateCw className="h-4 w-4 mb-1" />
            <span className="text-xs font-bold">Draw</span>
          </Button>
          {gameState.cardsRemaining > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-blue-500">{gameState.cardsRemaining}</Badge>
          )}
        </motion.div>
        {/* Discard pile */}
        <div className="w-20 h-28 flex items-center justify-center">
          {gameState.topCard ? (
            <motion.div
              key={gameState.topCard.id}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <UnoCardComponent card={gameState.topCard} onClick={() => {}} disabled />
            </motion.div>
          ) : (
            <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400 text-center text-xs">No card played</p>
            </div>
          )}
        </div>
      </div>

      {/* Last action display - moved below the cards with better styling */}
      {lastAction && (
        <motion.div
          className="mt-6 px-4 py-1.5 bg-black/30 dark:bg-white/20 rounded-full text-sm text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={lastAction}
        >
          {lastAction}
        </motion.div>
      )}
    </div>
  )
}

