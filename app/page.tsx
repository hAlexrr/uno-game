"use client"

import { useState, useEffect } from "react"
import { MultiplayerProvider } from "@/context/multiplayer-context"
import UnoGame from "@/components/uno-game"
import CardAnimations from "@/components/card-animations"
import AchievementsSystem from "@/components/achievements/achievements-system"
import FriendSystem from "@/components/social/friend-system"
import AppearanceSettings from "@/components/customization/appearance-settings"
import SpectatorMode from "@/components/spectator/spectator-mode"
import TournamentSystem from "@/components/tournament/tournament-system"
import AdvancedBotAI from "@/components/ai/advanced-bot-ai"
import MobileOptimizations from "@/components/mobile/mobile-optimizations"
import { useMultiplayerContext } from "@/context/multiplayer-context"

// Create a wrapper component to conditionally render feature buttons
function FeatureButtons() {
  const { gameState } = useMultiplayerContext()
  const [isInGame, setIsInGame] = useState(false)

  useEffect(() => {
    setIsInGame(!!gameState?.gameStarted)
  }, [gameState?.gameStarted])

  // Don't render feature buttons during gameplay
  if (isInGame) return null

  return (
    <>
      <AchievementsSystem />
      <FriendSystem />
      <AppearanceSettings />
      <SpectatorMode />
      <TournamentSystem />
      <AdvancedBotAI />
    </>
  )
}

export default function Home() {
  return (
    <div className="h-full w-full overflow-hidden">
      <MultiplayerProvider>
        <UnoGame />
        <CardAnimations />
        <MobileOptimizations />
        <FeatureButtons />
      </MultiplayerProvider>
    </div>
  )
}

