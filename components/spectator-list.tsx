"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Eye, X } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SpectatorList() {
  const { gameState } = useMultiplayerContext()
  const [expanded, setExpanded] = useState(false)

  // Get spectators from the game state
  const spectators = gameState?.players.filter((p) => p.isSpectator) || []

  if (spectators.length === 0) return null

  return (
    <div className="absolute top-4 right-4 z-30">
      <AnimatePresence>
        {expanded ? (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 min-w-[200px]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium flex items-center gap-1">
                <Eye size={14} />
                Spectators ({spectators.length})
              </h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpanded(false)}>
                <X size={14} />
              </Button>
            </div>

            <ul className="space-y-1">
              {spectators.map((spectator) => (
                <li key={spectator.id} className="text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {spectator.name}
                </li>
              ))}
            </ul>

            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
              Spectators can watch and chat, but cannot play until the next game.
            </div>
          </motion.div>
        ) : (
          <motion.button
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-1.5 flex items-center gap-1.5"
            onClick={() => setExpanded(true)}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Eye size={14} />
            <span className="text-sm">
              {spectators.length} Spectator{spectators.length !== 1 ? "s" : ""}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

