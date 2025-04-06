"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Volume2, VolumeX, Moon, Sun, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { useTheme } from "next-themes"

export default function GameControls() {
  const {
    soundEnabled,
    setSoundEnabled,
    gameState,
    playerId,
    showScoreboard,
    setShowScoreboard,
    showGameLog,
    setShowGameLog,
    showHint,
    setShowHint,
    sortedHand,
    setSortedHand,
    winner,
    resetGame,
  } = useMultiplayerContext()

  const { theme, setTheme } = useTheme()

  if (!gameState || !playerId) return null

  const currentPlayer = gameState.players.find((p) => p.id === playerId)

  if (!currentPlayer) return null

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
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSoundEnabled(!soundEnabled)}
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
                <DialogDescription>Customize your UNO game experience</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="display">
                <TabsList className="grid w-full grid-cols-1">
                  <TabsTrigger value="display">Display</TabsTrigger>
                </TabsList>

                <TabsContent value="display" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="scoreboard-toggle" className="text-sm">
                      Show Scoreboard:
                    </Label>
                    <Switch id="scoreboard-toggle" checked={showScoreboard} onCheckedChange={setShowScoreboard} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="gamelog-toggle" className="text-sm">
                      Show Game Log:
                    </Label>
                    <Switch id="gamelog-toggle" checked={showGameLog} onCheckedChange={setShowGameLog} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="hint-toggle" className="text-sm">
                      Show Hints:
                    </Label>
                    <Switch id="hint-toggle" checked={showHint} onCheckedChange={setShowHint} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sort-toggle" className="text-sm">
                      Sort Cards:
                    </Label>
                    <Switch id="sort-toggle" checked={sortedHand} onCheckedChange={setSortedHand} />
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button size="sm" variant="destructive" onClick={resetGame}>
            Exit
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

