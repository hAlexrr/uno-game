"use client"

import { useMultiplayerContext } from "@/context/multiplayer-context"
import MultiplayerLobby from "./multiplayer-lobby"
import GameBoard from "./game-board"

export default function UnoGame() {
  const { gameState } = useMultiplayerContext()

  return (
    <div className="flex flex-col items-center">{!gameState?.gameStarted ? <MultiplayerLobby /> : <GameBoard />}</div>
  )
}

