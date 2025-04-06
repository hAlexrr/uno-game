"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { useEffect } from "react"
import confetti from "canvas-confetti"
import { Trophy, Star, ArrowRight } from "lucide-react"

export default function WinnerScreen() {
  const { winner, gameState, playerId, playAgainAction, resetGame, gameStats } = useMultiplayerContext()

  // Check if the current player is the host
  const isHost = gameState?.players.find((p) => p.id === playerId)?.isHost || false

  // Reset winner when game starts again
  useEffect(() => {
    if (gameState?.gameStarted && winner) {
      // This will clear the winner when a new game starts
      playAgainAction()
    }
  }, [gameState?.gameStarted, winner])

  // Trigger confetti when winner is set
  useEffect(() => {
    if (winner) {
      const duration = 5 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)

        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      }, 250)
    }
  }, [winner])

  return (
    <AnimatePresence>
      {winner && !gameState?.gameStarted && (
        <motion.div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md w-full mx-4"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="mb-6">
              <motion.div
                className="mx-auto w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center mb-4"
                initial={{ rotate: -10 }}
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" }}
              >
                <Trophy size={40} className="text-yellow-700" />
              </motion.div>

              <h2 className="text-3xl font-bold mb-2">
                {winner.id === playerId ? "You Win!" : `${winner.name} Wins!`}
              </h2>

              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 * i, duration: 0.3 }}
                  >
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                  </motion.div>
                ))}
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {winner.id === playerId
                  ? "Congratulations! You've won the game!"
                  : `${winner.name} has played all their cards!`}
              </p>
            </div>

            {/* Game stats section */}
            <div className="mb-6 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Game Statistics</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-left">Rounds Played:</div>
                <div className="text-right font-medium">{gameStats.rounds}</div>

                <div className="text-left">Cards Played:</div>
                <div className="text-right font-medium">{gameStats.cardsPlayed}</div>

                <div className="text-left">Special Cards:</div>
                <div className="text-right font-medium">{gameStats.specialCardsPlayed}</div>

                <div className="text-left">Most Cards Held:</div>
                <div className="text-right font-medium">{gameStats.mostCardsHeld}</div>

                <div className="text-left">Cards Drawn:</div>
                <div className="text-right font-medium">{gameStats.drawCardCount}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isHost && (
                <Button onClick={playAgainAction} className="flex items-center justify-center gap-2" size="lg">
                  Play Again
                  <ArrowRight size={16} />
                </Button>
              )}
              <Button variant="outline" onClick={resetGame} size="lg">
                Exit Game
              </Button>
            </div>

            {!isHost && (
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                Waiting for the host to start a new game...
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

