"use client"

import { useState } from "react"
import { Bot, Cpu, Zap, Brain, Settings, Sliders } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Bot personality traits
const BOT_PERSONALITIES = [
  {
    id: "aggressive",
    name: "Aggressive",
    description: "Prioritizes playing action cards and targeting the player",
    icon: Zap,
    color: "text-red-500",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    stats: {
      strategy: 60,
      aggression: 90,
      defense: 30,
      adaptability: 50,
    },
  },
  {
    id: "defensive",
    name: "Defensive",
    description: "Focuses on keeping a balanced hand and avoiding risks",
    icon: Brain,
    color: "text-blue-500",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    stats: {
      strategy: 70,
      aggression: 30,
      defense: 90,
      adaptability: 60,
    },
  },
  {
    id: "strategic",
    name: "Strategic",
    description: "Makes calculated moves based on other players' hands",
    icon: Cpu,
    color: "text-purple-500",
    bgColor: "bg-purple-100 dark:bg-purple-900/20",
    stats: {
      strategy: 90,
      aggression: 50,
      defense: 60,
      adaptability: 70,
    },
  },
  {
    id: "adaptive",
    name: "Adaptive",
    description: "Changes strategy based on game state and other players",
    icon: Settings,
    color: "text-green-500",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    stats: {
      strategy: 70,
      aggression: 60,
      defense: 60,
      adaptability: 90,
    },
  },
  {
    id: "random",
    name: "Chaotic",
    description: "Makes unpredictable moves that can surprise other players",
    icon: Sliders,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    stats: {
      strategy: 30,
      aggression: 70,
      defense: 40,
      adaptability: 40,
    },
  },
]

export default function AdvancedBotAI() {
  const { gameState, botDifficulty, setBotDifficulty, addBot, removeBot } = useMultiplayerContext()

  const [selectedPersonality, setSelectedPersonality] = useState("strategic")
  const [customDifficulty, setCustomDifficulty] = useState(50)
  const [botSettings, setBotSettings] = useState({
    useColorStrategy: true,
    saveSpecialCards: true,
    targetLeader: true,
    callUnoAutomatically: false,
    useEmojis: true,
  })

  // Get bots in the game
  const botsInGame = gameState?.players.filter((p) => p.isBot) || []

  // Get selected personality
  const personality = BOT_PERSONALITIES.find((p) => p.id === selectedPersonality)

  // If in a game, don't show the button
  if (gameState?.gameStarted) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-80 right-4 flex items-center gap-2">
          <Bot size={16} />
          <span>Bot AI</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot size={18} />
            Advanced Bot AI Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="personalities">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personalities">Personalities</TabsTrigger>
            <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
            <TabsTrigger value="manage">Manage Bots</TabsTrigger>
          </TabsList>

          <TabsContent value="personalities" className="space-y-4 pt-4">
            <p className="text-sm text-gray-500">
              Choose a personality for your bots to make them behave differently during gameplay.
            </p>

            <div className="grid grid-cols-1 gap-2">
              {BOT_PERSONALITIES.map((personality) => (
                <div
                  key={personality.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedPersonality === personality.id
                      ? "ring-2 ring-primary border-transparent"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedPersonality(personality.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${personality.bgColor}`}>
                      {personality.icon && <personality.icon size={18} className={personality.color} />}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{personality.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{personality.description}</p>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        {Object.entries(personality.stats).map(([stat, value]) => (
                          <div key={stat} className="flex items-center justify-between">
                            <span className="text-xs capitalize">{stat}</span>
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium">Additional Settings</h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="color-strategy" className="text-sm">
                    Use color strategy
                  </Label>
                  <Switch
                    id="color-strategy"
                    checked={botSettings.useColorStrategy}
                    onCheckedChange={(checked) => setBotSettings({ ...botSettings, useColorStrategy: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="save-special" className="text-sm">
                    Save special cards for strategic moments
                  </Label>
                  <Switch
                    id="save-special"
                    checked={botSettings.saveSpecialCards}
                    onCheckedChange={(checked) => setBotSettings({ ...botSettings, saveSpecialCards: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="target-leader" className="text-sm">
                    Target player with fewest cards
                  </Label>
                  <Switch
                    id="target-leader"
                    checked={botSettings.targetLeader}
                    onCheckedChange={(checked) => setBotSettings({ ...botSettings, targetLeader: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-uno" className="text-sm">
                    Call UNO automatically
                  </Label>
                  <Switch
                    id="auto-uno"
                    checked={botSettings.callUnoAutomatically}
                    onCheckedChange={(checked) => setBotSettings({ ...botSettings, callUnoAutomatically: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="use-emojis" className="text-sm">
                    Use emoji reactions
                  </Label>
                  <Switch
                    id="use-emojis"
                    checked={botSettings.useEmojis}
                    onCheckedChange={(checked) => setBotSettings({ ...botSettings, useEmojis: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="difficulty" className="space-y-4 pt-4">
            <p className="text-sm text-gray-500">Adjust the difficulty level of bots to match your skill level.</p>

            <div className="space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Preset Difficulty Levels</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={botDifficulty === "easy" ? "default" : "outline"}
                    onClick={() => setBotDifficulty("easy")}
                    className="flex-1"
                  >
                    Easy
                  </Button>
                  <Button
                    size="sm"
                    variant={botDifficulty === "medium" ? "default" : "outline"}
                    onClick={() => setBotDifficulty("medium")}
                    className="flex-1"
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant={botDifficulty === "hard" ? "default" : "outline"}
                    onClick={() => setBotDifficulty("hard")}
                    className="flex-1"
                  >
                    Hard
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Custom Difficulty</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Easier</span>
                      <span>Harder</span>
                    </div>
                    <Slider
                      value={[customDifficulty]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) => setCustomDifficulty(value[0])}
                    />
                    <div className="text-center mt-1 text-sm font-medium">{customDifficulty}%</div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => {
                      // Set custom difficulty
                      if (customDifficulty < 33) {
                        setBotDifficulty("easy")
                      } else if (customDifficulty < 66) {
                        setBotDifficulty("medium")
                      } else {
                        setBotDifficulty("hard")
                      }
                    }}
                  >
                    Apply Custom Difficulty
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Difficulty Effects</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Easy:</strong> Bots make random moves and don't use strategy
                  </p>
                  <p>
                    <strong>Medium:</strong> Bots use basic strategy and occasionally make mistakes
                  </p>
                  <p>
                    <strong>Hard:</strong> Bots use advanced strategy and rarely make mistakes
                  </p>
                  <p>
                    <strong>Custom:</strong> Fine-tune the bot's skill level to match yours
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4 pt-4">
            <p className="text-sm text-gray-500">Add or remove bots from your game and customize their settings.</p>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Current Bots</h4>

              {botsInGame.length > 0 ? (
                <div className="space-y-2">
                  {botsInGame.map((bot, index) => (
                    <div key={bot.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>B{index + 1}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h5 className="font-medium">{bot.name}</h5>
                          <p className="text-xs text-gray-500">{bot.difficulty || "Medium"} difficulty</p>
                        </div>
                      </div>

                      <Button size="sm" variant="outline" onClick={() => removeBot(bot.id)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No bots added yet</div>
              )}

              <Button className="w-full" onClick={addBot}>
                <Bot size={16} className="mr-2" />
                Add Bot
              </Button>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h5 className="text-sm font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <Brain size={16} />
                  Bot AI Tips
                </h5>
                <ul className="text-xs text-blue-600 dark:text-blue-300 mt-2 space-y-1 list-disc pl-4">
                  <li>Bots with different personalities will play differently</li>
                  <li>Higher difficulty bots will make fewer mistakes</li>
                  <li>Bots can adapt to your play style over time</li>
                  <li>You can add up to 9 bots to a game</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

