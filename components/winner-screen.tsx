"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { useEffect } from "react"

export default function WinnerScreen() {
  const { winner, gameState, playerId, playAgainAction, resetGame } = useMultiplayerContext()

  // Check if the current player is the host
  const isHost = gameState?.players.find((p) => p.id === playerId)?.isHost || false

  // Reset winner when game starts again
  useEffect(() => {
    if (gameState?.gameStarted && winner) {
      // This will clear the winner when a new game starts
      playAgainAction()
    }
  }, [gameState?.gameStarted, winner])

  return (
    <AnimatePresence>
      {winner && !gameState?.gameStarted && (
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center"
            initial={{ scale: 0, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 50 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">{winner.id === playerId ? "You Win!" : `${winner.name} Wins!`}</h2>
            <p className="mb-6">
              {winner.id === playerId
                ? "Congratulations! You've won the game!"
                : `${winner.name} has played all their cards!`}
            </p>
            <div className="flex gap-4 justify-center">
              {isHost && <Button onClick={playAgainAction}>Play Again</Button>}
              <Button variant="outline" onClick={resetGame}>
                Exit Game
              </Button>
            </div>
            {!isHost && <p className="mt-4 text-sm text-gray-500">Waiting for the host to start a new game...</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

