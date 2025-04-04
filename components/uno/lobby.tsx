"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users } from "lucide-react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { GameSettings, Player } from "./types"

interface LobbyProps {
    onStartGame: (settings: GameSettings) => void;
    players: Player[];
    onAddPlayer: (name: string) => void;
    botCount: number;
    onSetBotCount: (count: number) => void;
    botDifficulty: "easy" | "medium" | "hard";
    onSetBotDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
    gameSettings: GameSettings;
    onSetGameSettings: (settings: GameSettings) => void;
}

export default function Lobby({
    onStartGame,
    players,
    onAddPlayer,
    botCount,
    onSetBotCount,
    botDifficulty,
    onSetBotDifficulty,
    gameSettings,
    onSetGameSettings
}: LobbyProps) {
    const [playerName, setPlayerName] = useState("")

    const handleJoinGame = () => {
        if (playerName.trim()) {
            onAddPlayer(playerName.trim())
            setPlayerName("")
        }
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
                </div>
            ) : (
                <div className="space-y-4">
                    <motion.div
                        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
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
                    </motion.div>

                    <Tabs defaultValue="basic">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            <TabsTrigger value="rules">Rules</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-2">
                            <div className="flex items-center gap-4">
                                <span className="text-sm">Bot Players: {botCount}</span>
                                <Slider
                                    value={[botCount]}
                                    min={1}
                                    max={9}
                                    step={1}
                                    onValueChange={(value) => onSetBotCount(value[0])}
                                    className="flex-1"
                                />
                            </div>

                            <div className="flex items-center gap-4 mt-2">
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
                        </TabsContent>

                        <TabsContent value="rules" className="space-y-2">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="stacking-toggle" className="text-sm">
                                        Stacking (+2/+4):
                                    </Label>
                                    <Switch
                                        id="stacking-toggle"
                                        checked={gameSettings.stackingEnabled}
                                        onCheckedChange={(checked) =>
                                            onSetGameSettings({ ...gameSettings, stackingEnabled: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="jumpin-toggle" className="text-sm">
                                        Jump-In Rule:
                                    </Label>
                                    <Switch
                                        id="jumpin-toggle"
                                        checked={gameSettings.jumpInEnabled}
                                        onCheckedChange={(checked) =>
                                            onSetGameSettings({ ...gameSettings, jumpInEnabled: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="drawuntil-toggle" className="text-sm">
                                        Draw Until Match:
                                    </Label>
                                    <Switch
                                        id="drawuntil-toggle"
                                        checked={gameSettings.drawUntilMatch}
                                        onCheckedChange={(checked) =>
                                            onSetGameSettings({ ...gameSettings, drawUntilMatch: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="forceplay-toggle" className="text-sm">
                                        Force Play:
                                    </Label>
                                    <Switch
                                        id="forceplay-toggle"
                                        checked={gameSettings.forcePlay}
                                        onCheckedChange={(checked) =>
                                            onSetGameSettings({ ...gameSettings, forcePlay: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="seveno-toggle" className="text-sm">
                                        Seven-O Rule:
                                    </Label>
                                    <Switch
                                        id="seveno-toggle"
                                        checked={gameSettings.sevenORule}
                                        onCheckedChange={(checked) =>
                                            onSetGameSettings({ ...gameSettings, sevenORule: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="blank-toggle" className="text-sm">
                                        Blank Cards:
                                    </Label>
                                    <Switch
                                        id="blank-toggle"
                                        checked={gameSettings.blankCards}
                                        onCheckedChange={(checked) =>
                                            onSetGameSettings({ ...gameSettings, blankCards: checked })
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="swap-toggle" className="text-sm">
                                        Swap Hands Card:
                                    </Label>
                                    <Switch
                                        id="swap-toggle"
                                        checked={gameSettings.specialSwapHands}
                                        onCheckedChange={(checked) =>
                                            onSetGameSettings({ ...gameSettings, specialSwapHands: checked })
                                        }
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Button className="w-full" onClick={() => onStartGame(gameSettings)}>
                        Start Game
                    </Button>
                </div>
            )}
        </motion.div>
    )
} 