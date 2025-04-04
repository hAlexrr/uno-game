"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Users, Settings, Sun, Moon, Volume2, VolumeX } from "lucide-react"
import type { Player, GameSettings } from "./types"

interface GameLobbyProps {
    onStartGame: (players: Player[]) => void
    onSettingsChange: (settings: GameSettings) => void
    settings: GameSettings
    onAddPlayer: (name: string) => void
    botCount: number
    onSetBotCount: (count: number) => void
    botDifficulty: "easy" | "medium" | "hard"
    onSetBotDifficulty: (difficulty: "easy" | "medium" | "hard") => void
    theme: string
    onToggleTheme: () => void
    soundEnabled: boolean
    onToggleSound: () => void
    players: Player[]
}

export default function GameLobby({
    onStartGame,
    onSettingsChange,
    settings,
    onAddPlayer,
    botCount,
    onSetBotCount,
    botDifficulty,
    onSetBotDifficulty,
    theme,
    onToggleTheme,
    soundEnabled,
    onToggleSound,
    players
}: GameLobbyProps) {
    const [playerName, setPlayerName] = useState("")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleJoinGame = () => {
        if (playerName.trim() === "") return
        onAddPlayer(playerName)
        setPlayerName("")
    }

    const handleStartGame = () => {
        onStartGame(players)
    }

    if (!mounted) {
        return null
    }

    return (
        <motion.div
            className="w-full max-w-md space-y-4 p-6 border rounded-lg shadow-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-xl font-semibold">Game Lobby</h2>

            {players.length === 0 ? (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Enter your name"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            maxLength={15}
                        />
                        <Button onClick={handleJoinGame}>Join</Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Bot Players: {botCount}</span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onSetBotCount(Math.max(1, botCount - 1))}
                                    disabled={botCount <= 1}
                                >
                                    -
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onSetBotCount(Math.min(9, botCount + 1))}
                                    disabled={botCount >= 9}
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm">Bot Difficulty:</span>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={botDifficulty === "easy" ? "default" : "outline"}
                                    onClick={() => onSetBotDifficulty("easy")}
                                >
                                    Easy
                                </Button>
                                <Button
                                    size="sm"
                                    variant={botDifficulty === "medium" ? "default" : "outline"}
                                    onClick={() => onSetBotDifficulty("medium")}
                                >
                                    Medium
                                </Button>
                                <Button
                                    size="sm"
                                    variant={botDifficulty === "hard" ? "default" : "outline"}
                                    onClick={() => onSetBotDifficulty("hard")}
                                >
                                    Hard
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onToggleTheme}
                                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onToggleSound}
                                title={soundEnabled ? "Mute sounds" : "Enable sounds"}
                            >
                                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={16} />
                            <h3 className="font-medium">Players</h3>
                        </div>
                        <ul>
                            {players.map((player) => (
                                <motion.li
                                    key={player.id}
                                    className="text-sm py-1"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {player.name} {player.isHuman ? "(You)" : ""}
                                </motion.li>
                            ))}
                        </ul>
                    </Card>

                    <Button className="w-full" onClick={handleStartGame}>
                        Start Game
                    </Button>
                </div>
            )}
        </motion.div>
    )
} 