"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { useMultiplayerContext } from "@/context/multiplayer-context"

export default function ConfettiEffect() {
  const { gameState, playerId } = useMultiplayerContext()
  const [lastPlayerId, setLastPlayerId] = useState<string | null>(null)

  useEffect(() => {
    if (!gameState || !gameState.gameStarted || !playerId) return

    // Check for special events
    const currentPlayer = gameState.players.find((p) => p.id === playerId)
    if (!currentPlayer) return

    // Trigger confetti when player successfully plays a special card
    if (
      gameState.topCard &&
      (gameState.topCard.type === "action" ||
        gameState.topCard.type === "wild" ||
        gameState.topCard.type === "special") &&
      lastPlayerId === playerId &&
      lastPlayerId !== gameState.currentPlayerId // Player just finished their turn
    ) {
      // Trigger confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00"],
      })
    }

    // Update last player ID
    setLastPlayerId(gameState.currentPlayerId)
  }, [gameState?.currentPlayerId, gameState?.gameStarted, gameState?.players, playerId, lastPlayerId])

  return null // This component doesn't render anything
}

