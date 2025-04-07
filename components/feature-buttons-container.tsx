"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trophy, Users, Paintbrush, Eye, Bot, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import AchievementsSystem from "./achievements/achievements-system"
import FriendSystem from "./social/friend-system"
import AppearanceSettings from "./customization/appearance-settings"
import SpectatorMode from "./spectator/spectator-mode"
import TournamentSystem from "./tournament/tournament-system"
import AdvancedBotAI from "./ai/advanced-bot-ai"

export default function FeatureButtonsContainer() {
  const { gameState } = useMultiplayerContext()
  const [isExpanded, setIsExpanded] = useState(false)

  // Don't show during gameplay
  if (gameState?.gameStarted) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Mobile-friendly menu toggle */}
      <Button
        variant="outline"
        size="icon"
        className="md:hidden mb-2 bg-white dark:bg-gray-800 shadow-md"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <X size={18} /> : <Menu size={18} />}
      </Button>

      {/* Feature buttons - vertical stack on mobile, always visible on desktop */}
      <motion.div
        className="flex flex-col gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: 1,
          y: 0,
          height: isExpanded ? "auto" : "auto",
          display: isExpanded || window.innerWidth >= 768 ? "flex" : "none",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <AchievementsSystem />
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 bg-white dark:bg-gray-800 shadow-md"
          >
            <Trophy size={16} className="text-yellow-500" />
            <span>Achievements</span>
          </Button>
        </div>

        <div className="relative">
          <FriendSystem />
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 bg-white dark:bg-gray-800 shadow-md"
          >
            <Users size={16} />
            <span>Friends</span>
          </Button>
        </div>

        <div className="relative">
          <AppearanceSettings />
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 bg-white dark:bg-gray-800 shadow-md"
          >
            <Paintbrush size={16} />
            <span>Appearance</span>
          </Button>
        </div>

        <div className="relative">
          <SpectatorMode />
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 bg-white dark:bg-gray-800 shadow-md"
          >
            <Eye size={16} />
            <span>Spectate</span>
          </Button>
        </div>

        <div className="relative">
          <TournamentSystem />
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 bg-white dark:bg-gray-800 shadow-md"
          >
            <Trophy size={16} />
            <span>Tournaments</span>
          </Button>
        </div>

        <div className="relative">
          <AdvancedBotAI />
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center gap-2 bg-white dark:bg-gray-800 shadow-md"
          >
            <Bot size={16} />
            <span>Bot AI</span>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

