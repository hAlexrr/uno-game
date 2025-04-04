"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { Player } from "./types"

interface GameOverProps {
    winner: Player
    onPlayAgain: () => void
    onReturnToLobby: () => void
}

export default function GameOver({
    winner,
    onPlayAgain,
    onReturnToLobby
}: GameOverProps) {
    return (
        <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
            >
                <h2 className="text-2xl font-bold mb-4 text-center">
                    {winner.isHuman ? "You Won!" : `${winner.name} Won!`}
                </h2>
                <div className="flex gap-4 justify-center">
                    <Button onClick={onPlayAgain}>Play Again</Button>
                    <Button variant="outline" onClick={onReturnToLobby}>
                        Return to Lobby
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
} 