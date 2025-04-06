"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Eye, AlertTriangle } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Button } from "@/components/ui/button"

export default function OtherPlayers() {
  const { getPlayerPositions, animation, viewPlayerHand, showEmoji, callUnoOnPlayerAction } = useMultiplayerContext()

  return (
    <>
      {getPlayerPositions().map(({ player, x, y }) => (
        <motion.div
          key={player.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${x}%`, top: `${y}%` }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <motion.div
            className={`flex flex-col items-center`}
            animate={
              player.isCurrentTurn
                ? {
                    scale: [1, 1.05, 1],
                    y: [0, -5, 0],
                  }
                : {}
            }
            transition={{ duration: 1, repeat: player.isCurrentTurn ? Number.POSITIVE_INFINITY : 0 }}
          >
            {/* Player name above cards */}
            <div
              className={`px-3 py-1 rounded-full mb-2 flex items-center gap-1 ${
                player.isCurrentTurn ? "bg-primary text-primary-foreground" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span className="text-sm font-medium">{player.name}</span>
              <span className="text-xs bg-black/20 dark:bg-white/20 px-1 rounded-full">{player.cards.length}</span>

              <button
                onClick={() => viewPlayerHand(player.id)}
                className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title={`View ${player.name}'s hand`}
              >
                <Eye size={14} />
              </button>
            </div>

            {/* Show 3 cards from the back to represent their hand */}
            <div className="relative h-8 flex items-center">
              {[...Array(Math.min(3, player.cards.length))].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-8 h-12 rounded-md bg-blue-600 border-2 border-white shadow-md"
                  style={{
                    left: `${i * 4}px`,
                    zIndex: i,
                  }}
                  animate={{
                    rotate: (i - 1) * 5,
                    y: animation.type === "playCard" && animation.playerId === player.id ? -10 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                    UNO
                  </div>
                </motion.div>
              ))}
              {player.cards.length > 3 && (
                <span className="absolute left-16 text-xs text-gray-600 dark:text-gray-400">
                  +{player.cards.length - 3}
                </span>
              )}
            </div>

            {/* Add UNO call button when player has exactly one card - now positioned above the cards */}
            {player.cards.length === 1 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => callUnoOnPlayerAction(player.id)}
                className="mt-2 flex items-center gap-1"
                title={`Call UNO on ${player.name}`}
              >
                <AlertTriangle size={14} />
                <span className="text-xs font-bold">Call UNO!</span>
              </Button>
            )}

            {/* Emoji reaction */}
            <AnimatePresence>
              {showEmoji && showEmoji.playerId === player.id && (
                <motion.div
                  className="absolute -top-8 text-2xl"
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring" }}
                >
                  {showEmoji.emoji}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ))}
    </>
  )
}

