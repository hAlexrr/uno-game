"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GameSettings } from "./types"

interface GameSettingsProps {
    settings: GameSettings
    onSettingsChange: (settings: GameSettings) => void
    showScoreboard: boolean
    onToggleScoreboard: (show: boolean) => void
    showGameLog: boolean
    onToggleGameLog: (show: boolean) => void
    showHint: boolean
    onToggleHint: (show: boolean) => void
    sortedHand: boolean
    onToggleSort: (sorted: boolean) => void
    gameSpeed: "slow" | "normal" | "fast"
    onSetGameSpeed: (speed: "slow" | "normal" | "fast") => void
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function GameSettings({
    settings,
    onSettingsChange,
    showScoreboard,
    onToggleScoreboard,
    showGameLog,
    onToggleGameLog,
    showHint,
    onToggleHint,
    sortedHand,
    onToggleSort,
    gameSpeed,
    onSetGameSpeed,
    open,
    onOpenChange
}: GameSettingsProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                    checked={settings.stackingEnabled}
                                    onCheckedChange={(checked) =>
                                        onSettingsChange({ ...settings, stackingEnabled: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="jumpin-toggle" className="text-sm">
                                    Jump-In Rule:
                                </Label>
                                <Switch
                                    id="jumpin-toggle"
                                    checked={settings.jumpInEnabled}
                                    onCheckedChange={(checked) =>
                                        onSettingsChange({ ...settings, jumpInEnabled: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="drawuntil-toggle" className="text-sm">
                                    Draw Until Match:
                                </Label>
                                <Switch
                                    id="drawuntil-toggle"
                                    checked={settings.drawUntilMatch}
                                    onCheckedChange={(checked) =>
                                        onSettingsChange({ ...settings, drawUntilMatch: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="forceplay-toggle" className="text-sm">
                                    Force Play:
                                </Label>
                                <Switch
                                    id="forceplay-toggle"
                                    checked={settings.forcePlay}
                                    onCheckedChange={(checked) =>
                                        onSettingsChange({ ...settings, forcePlay: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="seveno-toggle" className="text-sm">
                                    7-0 Rule:
                                </Label>
                                <Switch
                                    id="seveno-toggle"
                                    checked={settings.sevenORule}
                                    onCheckedChange={(checked) =>
                                        onSettingsChange({ ...settings, sevenORule: checked })
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="challenge-toggle" className="text-sm">
                                    Challenge Rule:
                                </Label>
                                <Switch
                                    id="challenge-toggle"
                                    checked={settings.challengeRule}
                                    onCheckedChange={(checked) =>
                                        onSettingsChange({ ...settings, challengeRule: checked })
                                    }
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="display" className="space-y-2">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="scoreboard-toggle" className="text-sm">
                                    Show Scoreboard:
                                </Label>
                                <Switch
                                    id="scoreboard-toggle"
                                    checked={showScoreboard}
                                    onCheckedChange={onToggleScoreboard}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="gamelog-toggle" className="text-sm">
                                    Show Game Log:
                                </Label>
                                <Switch
                                    id="gamelog-toggle"
                                    checked={showGameLog}
                                    onCheckedChange={onToggleGameLog}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="hint-toggle" className="text-sm">
                                    Show Hints:
                                </Label>
                                <Switch
                                    id="hint-toggle"
                                    checked={showHint}
                                    onCheckedChange={onToggleHint}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="sort-toggle" className="text-sm">
                                    Sort Cards:
                                </Label>
                                <Switch
                                    id="sort-toggle"
                                    checked={sortedHand}
                                    onCheckedChange={onToggleSort}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="speed-toggle" className="text-sm">
                                    Game Speed:
                                </Label>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={gameSpeed === "slow" ? "default" : "outline"}
                                        onClick={() => onSetGameSpeed("slow")}
                                    >
                                        Slow
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={gameSpeed === "normal" ? "default" : "outline"}
                                        onClick={() => onSetGameSpeed("normal")}
                                    >
                                        Normal
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={gameSpeed === "fast" ? "default" : "outline"}
                                        onClick={() => onSetGameSpeed("fast")}
                                    >
                                        Fast
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
} 