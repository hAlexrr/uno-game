"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Moon, Sun } from "lucide-react"
import { useGameContext } from "@/context/game-context"
import { useTheme } from "next-themes"

export default function GameLobby() {
  const {
    playerName,
    setPlayerName,
    players,
    botCount,
    setBotCount,
    botDifficulty,
    setBotDifficulty,
    gameSettings,
    setGameSettings,
    soundVolume,
    setSoundVolume,
    joinGame,
    startGame,
  } = useGameContext()

  const { theme, setTheme } = useTheme()

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
            <Button onClick={joinGame} className="relative overflow-hidden">
              <motion.span
                className="absolute inset-0 bg-primary-foreground"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
                style={{ opacity: 0.2 }}
              />
              Join
            </Button>
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
                  onValueChange={(value) => setBotCount(value[0])}
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm">Bot Difficulty:</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={botDifficulty === "easy" ? "default" : "outline"}
                    onClick={() => setBotDifficulty("easy")}
                  >
                    Easy
                  </Button>
                  <Button
                    size="sm"
                    variant={botDifficulty === "medium" ? "default" : "outline"}
                    onClick={() => setBotDifficulty("medium")}
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant={botDifficulty === "hard" ? "default" : "outline"}
                    onClick={() => setBotDifficulty("hard")}
                  >
                    Hard
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm">Game Speed:</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={gameSettings.gameSpeed === "slow" ? "default" : "outline"}
                    onClick={() => setGameSettings({ ...gameSettings, gameSpeed: "slow" })}
                  >
                    Slow
                  </Button>
                  <Button
                    size="sm"
                    variant={gameSettings.gameSpeed === "normal" ? "default" : "outline"}
                    onClick={() => setGameSettings({ ...gameSettings, gameSpeed: "normal" })}
                  >
                    Normal
                  </Button>
                  <Button
                    size="sm"
                    variant={gameSettings.gameSpeed === "fast" ? "default" : "outline"}
                    onClick={() => setGameSettings({ ...gameSettings, gameSpeed: "fast" })}
                  >
                    Fast
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-2">
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm">Sound Volume:</span>
                <Slider
                  value={[soundVolume * 100]}
                  min={0}
                  max={100}
                  step={10}
                  onValueChange={(value) => setSoundVolume(value[0] / 100)}
                  className="flex-1"
                />
                <span className="text-sm">{Math.round(soundVolume * 100)}%</span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <Label htmlFor="theme-toggle" className="text-sm">
                  Dark Mode:
                </Label>
                <Button
                  id="theme-toggle"
                  size="sm"
                  variant="ghost"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === "dark" ? " Light Mode" : " Dark Mode"}
                </Button>
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
                    onCheckedChange={(checked) => setGameSettings({ ...gameSettings, stackingEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="jumpin-toggle" className="text-sm">
                    Jump-In Rule:
                  </Label>
                  <Switch
                    id="jumpin-toggle"
                    checked={gameSettings.jumpInEnabled}
                    onCheckedChange={(checked) => setGameSettings({ ...gameSettings, jumpInEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="drawuntil-toggle" className="text-sm">
                    Draw Until Match:
                  </Label>
                  <Switch
                    id="drawuntil-toggle"
                    checked={gameSettings.drawUntilMatch}
                    onCheckedChange={(checked) => setGameSettings({ ...gameSettings, drawUntilMatch: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="forceplay-toggle" className="text-sm">
                    Force Play:
                  </Label>
                  <Switch
                    id="forceplay-toggle"
                    checked={gameSettings.forcePlay}
                    onCheckedChange={(checked) => setGameSettings({ ...gameSettings, forcePlay: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="seveno-toggle" className="text-sm">
                    Seven-O Rule:
                  </Label>
                  <Switch
                    id="seveno-toggle"
                    checked={gameSettings.sevenORule}
                    onCheckedChange={(checked) => setGameSettings({ ...gameSettings, sevenORule: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="blank-toggle" className="text-sm">
                    Blank Cards:
                  </Label>
                  <Switch
                    id="blank-toggle"
                    checked={gameSettings.blankCards}
                    onCheckedChange={(checked) => setGameSettings({ ...gameSettings, blankCards: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="swap-toggle" className="text-sm">
                    Swap Hands Card:
                  </Label>
                  <Switch
                    id="swap-toggle"
                    checked={gameSettings.specialSwapHands}
                    onCheckedChange={(checked) => setGameSettings({ ...gameSettings, specialSwapHands: checked })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button className="w-full relative overflow-hidden" onClick={startGame}>
            <motion.span
              className="absolute inset-0 bg-primary-foreground"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1.5 }}
              transition={{ duration: 0.5 }}
              style={{ opacity: 0.2, borderRadius: "100%" }}
            />
            Start Game
          </Button>
        </div>
      )}
    </motion.div>
  )
}

