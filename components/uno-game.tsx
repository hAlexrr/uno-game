"use client"

import { useMultiplayerContext } from "@/context/multiplayer-context"
import MultiplayerLobby from "./multiplayer-lobby"
import GameBoard from "./game-board"
import { AlertDialog, ConfirmDialog } from "@/components/custom-dialog"
import { useState } from "react"

export default function UnoGame() {
  const { gameState } = useMultiplayerContext()
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmTitle, setConfirmTitle] = useState("")
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null)

  return (
    <div className="flex flex-col items-center h-full w-full">
      {!gameState?.gameStarted ? <MultiplayerLobby /> : <GameBoard />}
      {/* Custom Alert Dialog */}
      <AlertDialog isOpen={showAlert} onClose={() => setShowAlert(false)} title="UNO Game" message={alertMessage} />

      {/* Custom Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmCallback}
        title={confirmTitle}
        message={confirmMessage}
      />
    </div>
  )
}

