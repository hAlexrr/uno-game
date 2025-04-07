"use client"

import { motion } from "framer-motion"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import PlayerHand from "./player-hand"
import { AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Volume2, VolumeX, Eye, EyeOff } from "lucide-react"

export default function HumanPlayer() {
  const {
    gameState,
    playerId,
    showEmoji,
    isCurrentPlayerTurn,
    callUnoAction,
    soundEnabled,
    setSoundEnabled,
    showGameLog,
    setShowGameLog,
    showChat,
    setShowChat,
    allowViewingHands,
    setAllowViewingHands,
    resetGame,
    triggerBotTurn,
  } = useMultiplayerContext()

  const currentPlayer = gameState?.players.find((p) => p.id === playerId)

  // Check if there are any bots in the game
  const hasBots = gameState?.players.some((p) => p.isBot) || false

  if (!currentPlayer) return null

  // Fix the UNO call button logic to only appear when it's the player's turn and they have 2 cards
  const hasOneOrTwoCards = currentPlayer.cards.length <= 2
  const canCallUno = hasOneOrTwoCards && isCurrentPlayerTurn() && !currentPlayer.calledUno

  return (
    <div className="w-full flex flex-col items-center">
      {/* Player name, status, and controls */}
      <div className="w-full flex flex-wrap items-center justify-between mb-2 px-2">
        <motion.div
          className={`px-4 py-1 rounded-full flex items-center gap-2 ${
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

          {/* UNO call button - visible when player has one or two cards and hasn't called UNO yet */}
          {canCallUno && (
            <Button
              size="sm"
              variant="destructive"
              onClick={callUnoAction}
              className="ml-2 flex items-center gap-1 h-7 px-2 py-0"
            >
              <AlertTriangle size={12} />
              <span className="text-xs font-bold">UNO!</span>
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

        {/* Game controls - improved layout */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <div className="flex items-center gap-1 mr-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`h-8 w-8 p-0 ${soundEnabled ? "text-green-500" : "text-red-500"}`}
              title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setAllowViewingHands(!allowViewingHands)}
              className={`h-8 w-8 p-0 ${allowViewingHands ? "text-green-500" : "text-red-500"}`}
              title={allowViewingHands ? "Disable Viewing Hands" : "Enable Viewing Hands"}
            >
              {allowViewingHands ? <Eye size={16} /> : <EyeOff size={16} />}
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {hasBots && (
              <Button size="sm" variant="outline" onClick={triggerBotTurn} className="h-8" title="Trigger Bot Turn">
                Trigger Bot
              </Button>
            )}

            <Button size="sm" variant="destructive" onClick={resetGame} className="h-8">
              Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Player's hand */}
      <PlayerHand />
    </div>
  )
}

