"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SortDesc, Lightbulb, MessageSquare } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import UnoCardComponent from "./uno-card"
import { emojis } from "@/lib/game-utils"

export default function PlayerHand() {
  const {
    gameState,
    playerId,
    viewingPlayerId,
    setViewingPlayerId,
    winner,
    sortedHand,
    setSortedHand,
    showHint,
    setShowHint,
    sortCards,
    playACard,
    sendEmojiReaction,
    isCurrentPlayerTurn,
  } = useMultiplayerContext()

  if (!gameState || !playerId) return null

  const currentPlayer = gameState.players.find((p) => p.id === playerId)
  const viewingPlayer = gameState.players.find((p) => p.id === viewingPlayerId)

  if (!currentPlayer) return null

  return (
    <motion.div
      className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg max-w-[90vw] w-full"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {viewingPlayerId !== playerId ? (
        <div className="flex flex-col items-center">
          <p className="text-sm mb-2">Viewing {viewingPlayer?.name}'s hand</p>
          <Button size="sm" onClick={() => setViewingPlayerId(playerId)}>
            Back to Your Hand
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between mb-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSortedHand(!sortedHand)}
                className="flex items-center gap-1"
              >
                <SortDesc size={14} />
                {sortedHand ? "Unsort" : "Sort Cards"}
              </Button>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-1"
                    >
                      <Lightbulb size={14} />
                      Hint
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Highlight playable cards</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    Emojis
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send Emoji Reaction</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-5 gap-2 py-4">
                    {emojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="outline"
                        className="text-xl h-10"
                        onClick={() => {
                          sendEmojiReaction(emoji)
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="overflow-x-auto pb-2 max-w-full">
            <div className="flex gap-2 min-w-min" style={{ width: "max-content" }}>
              <AnimatePresence>
                {sortCards(currentPlayer.cards).map((card) => {
                  const isPlayable =
                    !gameState.topCard ||
                    card.type === "wild" ||
                    card.type === "special" ||
                    gameState.topCard.color === card.color ||
                    gameState.currentColor === card.color ||
                    gameState.topCard.value === card.value

                  return (
                    <motion.div
                      key={card.id}
                      className={`transform hover:-translate-y-2 transition-transform flex-shrink-0 ${
                        showHint && isPlayable ? "ring-2 ring-yellow-400 ring-offset-2" : ""
                      }`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <UnoCardComponent
                        card={card}
                        onClick={() => playACard(card)}
                        disabled={!isCurrentPlayerTurn() || !!winner}
                      />
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </>
      )}

      {/* Show other player's cards if viewing them */}
      {viewingPlayerId !== playerId && viewingPlayer && (
        <div className="overflow-x-auto pb-2 mt-4 max-w-full">
          <div className="flex gap-2 min-w-min" style={{ width: "max-content" }}>
            <AnimatePresence>
              {viewingPlayer.cards.map((card) => (
                <motion.div
                  key={card.id}
                  className="opacity-80 flex-shrink-0"
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 0.8 }}
                  exit={{ rotateY: 180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <UnoCardComponent card={card} onClick={() => {}} disabled={true} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  )
}

