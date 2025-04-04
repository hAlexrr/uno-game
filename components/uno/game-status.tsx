"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Trophy, ChevronDown, ChevronUp } from "lucide-react"
import type { Player } from "./types"

interface GameStatusProps {
    currentPlayer: Player | null
    scores: Record<string, number>
    showScoreboard: boolean
    onToggleScoreboard: (show: boolean) => void
}

export default function GameStatus({
    currentPlayer,
    scores,
    showScoreboard,
    onToggleScoreboard
}: GameStatusProps) {
    return (
        <motion.div
            className="absolute top-2 left-2"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="p-2">
                <div className="flex flex-col gap-2">
                    <p className="text-sm">
                        Current Turn: <span className="font-medium">{currentPlayer?.name}</span>
                        {currentPlayer?.isHuman ? " (You)" : ""}
                    </p>

                    {showScoreboard ? (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-sm">
                                    <Trophy size={14} className="text-yellow-500" />
                                    <span className="font-medium">Scores</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => onToggleScoreboard(false)}
                                >
                                    <ChevronUp size={14} />
                                </Button>
                            </div>

                            <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                                {Object.entries(scores).map(([name, score]) => (
                                    <div key={name} className="flex justify-between">
                                        <span>{name}</span>
                                        <span className="font-medium">{score}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-full p-0 flex justify-between items-center"
                            onClick={() => onToggleScoreboard(true)}
                        >
                            <div className="flex items-center gap-1 text-sm">
                                <Trophy size={14} className="text-yellow-500" />
                                <span className="font-medium">Scores</span>
                            </div>
                            <ChevronDown size={14} />
                        </Button>
                    )}
                </div>
            </Card>
        </motion.div>
    )
} 