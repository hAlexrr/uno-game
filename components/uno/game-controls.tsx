"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { Moon, Sun, Volume2, VolumeX, Settings } from "lucide-react"
import type { GameSettings } from "./types"

interface GameControlsProps {
    theme: string;
    soundEnabled: boolean;
    gameSettings: GameSettings;
    onToggleTheme: () => void;
    onToggleSound: () => void;
    onSetGameSettings: (settings: GameSettings) => void;
    onResetGame: () => void;
}

export default function GameControls({
    theme,
    soundEnabled,
    gameSettings,
    onToggleTheme,
    onToggleSound,
    onSetGameSettings,
    onResetGame
}: GameControlsProps) {
    return (
        <motion.div
            className="absolute top-2 right-2"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="p-2">
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

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Settings size={16} />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Game Settings</DialogTitle>
                            </DialogHeader>

                            <Tabs defaultValue="rules">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="rules">Rules</TabsTrigger>
                                    <TabsTrigger value="display">Display</TabsTrigger>
                                </TabsList>

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
                        </DialogContent>
                    </Dialog>

                    <Button size="sm" variant="destructive" onClick={onResetGame}>
                        Exit
                    </Button>
                </div>
            </Card>
        </motion.div>
    )
} 