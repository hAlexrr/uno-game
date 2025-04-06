"use client"
import { useMultiplayerContext } from "@/context/multiplayer-context"

export default function GameControls() {
  const {
    soundEnabled,
    setSoundEnabled,
    soundVolume,
    setSoundVolume,
    sortedHand,
    setSortedHand,
    showHint,
    setShowHint,
    showScoreboard,
    setShowScoreboard,
    showChat,
    setShowChat,
    showGameLog,
    setShowGameLog,
    allowViewingHands,
    setAllowViewingHands,
    cardTheme,
    setCardTheme,
    cardBack,
    setCardBack,
    triggerBotTurn,
    gameState,
    isHost,
  } = useMultiplayerContext()

  // This component is no longer used - all controls moved to HumanPlayer
  return null
}

