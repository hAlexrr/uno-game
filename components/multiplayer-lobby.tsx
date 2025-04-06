"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Users, Copy, ArrowRight, Settings, AlertCircle, HelpCircle, Plus, Minus, Bot } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function MultiplayerLobby() {
  const {
    playerName,
    setPlayerName,
    roomCode,
    gameState,
    isJoining,
    joinError,
    isConnected,
    createNewGame,
    joinExistingGame,
    startTheGame,
    updateGameSettings,
    addBot,
    removeBot,
    botCount,
    setBotCount,
    botDifficulty,
    setBotDifficulty,
  } = useMultiplayerContext()

  const [joinRoomCode, setJoinRoomCode] = useState("")
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")

  // Monitor connection status
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus("Connected")
    } else {
      setConnectionStatus("Disconnected - Please refresh the page")
    }
  }, [isConnected])

  // Copy room code to clipboard
  const copyRoomCode = () => {
    if (!roomCode) return

    navigator.clipboard.writeText(roomCode)
    alert("Room code copied to clipboard!")
  }

  // Check if the current player is the host
  const isHost = gameState?.players.find((p) => p.id === gameState.players[0].id)?.isHost || false

  // If not in a room yet
  if (!roomCode) {
    return (
      <motion.div
        className="w-full max-w-md space-y-4 p-6 border rounded-lg shadow-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-semibold">UNO Multiplayer</h2>

        {!isConnected && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>Not connected to the server. Please refresh the page and try again.</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-500 mb-2">
          Status: <span className={isConnected ? "text-green-500" : "text-red-500"}>{connectionStatus}</span>
        </div>

        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Game</TabsTrigger>
            <TabsTrigger value="join">Join Game</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
              />
            </div>

            <Button
              className="w-full"
              onClick={createNewGame}
              disabled={isJoining || !playerName.trim() || !isConnected}
            >
              {isJoining ? "Creating..." : "Create New Game"}
            </Button>
          </TabsContent>

          <TabsContent value="join" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Room Code</label>
              <Input
                placeholder="Enter room code"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>

            <Button
              className="w-full"
              onClick={() => joinExistingGame(joinRoomCode)}
              disabled={isJoining || !playerName.trim() || !joinRoomCode.trim() || !isConnected}
            >
              {isJoining ? "Joining..." : "Join Game"}
            </Button>
          </TabsContent>
        </Tabs>

        {joinError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{joinError}</AlertDescription>
          </Alert>
        )}
      </motion.div>
    )
  }

  // If in a room but game not started
  return (
    <motion.div
      className="w-full max-w-md space-y-4 p-6 border rounded-lg shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Game Lobby</h2>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Room:</span>
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">{roomCode}</code>
          <Button size="icon" variant="ghost" onClick={copyRoomCode} title="Copy room code">
            <Copy size={16} />
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users size={16} />
          <h3 className="font-medium">Players</h3>
          <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {gameState?.players.length || 0}/10
          </span>
        </div>

        <ul className="space-y-1">
          {gameState?.players.map((player) => (
            <motion.li
              key={player.id}
              className="flex items-center justify-between text-sm py-1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <span>{player.name}</span>
                {player.isHost && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                    Host
                  </span>
                )}
                {player.isBot && (
                  <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Bot size={12} />
                    Bot
                  </span>
                )}
              </div>

              {/* Allow host to remove bots */}
              {isHost && player.isBot && (
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => removeBot(player.id)}>
                  <Minus size={14} className="text-red-500" />
                </Button>
              )}
            </motion.li>
          ))}
        </ul>

        {/* Bot controls - only for host */}
        {isHost && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Bot size={14} />
                Add Bots
              </h4>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={addBot}
                disabled={gameState && gameState.players.length >= 10}
              >
                <Plus size={14} className="mr-1" />
                Add Bot
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Bot Difficulty</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={botDifficulty === "easy" ? "default" : "outline"}
                    onClick={() => setBotDifficulty("easy")}
                    className="flex-1 h-7 text-xs"
                  >
                    Easy
                  </Button>
                  <Button
                    size="sm"
                    variant={botDifficulty === "medium" ? "default" : "outline"}
                    onClick={() => setBotDifficulty("medium")}
                    className="flex-1 h-7 text-xs"
                  >
                    Medium
                  </Button>
                  <Button
                    size="sm"
                    variant={botDifficulty === "hard" ? "default" : "outline"}
                    onClick={() => setBotDifficulty("hard")}
                    className="flex-1 h-7 text-xs"
                  >
                    Hard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Game Settings (only visible to host) */}
      {isHost && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full flex items-center gap-2">
              <Settings size={16} />
              Game Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Game Settings</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="game-speed" className="text-sm">
                      Game Speed:
                    </Label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={gameState?.gameSettings.gameSpeed === "slow" ? "default" : "outline"}
                        onClick={() => updateGameSettings({ gameSpeed: "slow" })}
                      >
                        Slow
                      </Button>
                      <Button
                        size="sm"
                        variant={gameState?.gameSettings.gameSpeed === "normal" ? "default" : "outline"}
                        onClick={() => updateGameSettings({ gameSpeed: "normal" })}
                      >
                        Normal
                      </Button>
                      <Button
                        size="sm"
                        variant={gameState?.gameSettings.gameSpeed === "fast" ? "default" : "outline"}
                        onClick={() => updateGameSettings({ gameSpeed: "fast" })}
                      >
                        Fast
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rules" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stacking-toggle" className="text-sm">
                      Stacking (+2/+4):
                    </Label>
                    <Switch
                      id="stacking-toggle"
                      checked={gameState?.gameSettings.stackingEnabled}
                      onCheckedChange={(checked) => updateGameSettings({ stackingEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="jumpin-toggle" className="text-sm">
                      Jump-In Rule:
                    </Label>
                    <Switch
                      id="jumpin-toggle"
                      checked={gameState?.gameSettings.jumpInEnabled}
                      onCheckedChange={(checked) => updateGameSettings({ jumpInEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="drawuntil-toggle" className="text-sm">
                      Draw Until Match:
                    </Label>
                    <Switch
                      id="drawuntil-toggle"
                      checked={gameState?.gameSettings.drawUntilMatch}
                      onCheckedChange={(checked) => updateGameSettings({ drawUntilMatch: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="forceplay-toggle" className="text-sm">
                      Force Play:
                    </Label>
                    <Switch
                      id="forceplay-toggle"
                      checked={gameState?.gameSettings.forcePlay}
                      onCheckedChange={(checked) => updateGameSettings({ forcePlay: checked })}
                    />
                  </div>

                  <TooltipProvider>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Label htmlFor="seveno-toggle" className="text-sm">
                          Seven-O Rule:
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle size={14} className="text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>When enabled:</p>
                            <ul className="list-disc pl-4 text-xs mt-1">
                              <li>Playing a 7 lets you swap hands with another player</li>
                              <li>Playing a 0 makes all players pass their hands to the next player</li>
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Switch
                        id="seveno-toggle"
                        checked={gameState?.gameSettings.sevenORule}
                        onCheckedChange={(checked) => updateGameSettings({ sevenORule: checked })}
                      />
                    </div>
                  </TooltipProvider>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="blank-toggle" className="text-sm">
                      Blank Cards:
                    </Label>
                    <Switch
                      id="blank-toggle"
                      checked={gameState?.gameSettings.blankCards}
                      onCheckedChange={(checked) => updateGameSettings({ blankCards: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="challenge-toggle" className="text-sm">
                      Challenge Rule:
                    </Label>
                    <Switch
                      id="challenge-toggle"
                      checked={gameState?.gameSettings.challengeRule}
                      onCheckedChange={(checked) => updateGameSettings({ challengeRule: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="playdrawn-toggle" className="text-sm">
                      Play Drawn Card:
                    </Label>
                    <Switch
                      id="playdrawn-toggle"
                      checked={gameState?.gameSettings.playDrawnCard}
                      onCheckedChange={(checked) => updateGameSettings({ playDrawnCard: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="swap-toggle" className="text-sm">
                      Swap Hands Card:
                    </Label>
                    <Switch
                      id="swap-toggle"
                      checked={gameState?.gameSettings.specialSwapHands}
                      onCheckedChange={(checked) => updateGameSettings({ specialSwapHands: checked })}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {gameState?.players.length === 1 ? "Waiting for more players to join..." : "Ready to start the game!"}
        </div>

        {isHost && (
          <Button
            onClick={startTheGame}
            disabled={!gameState || gameState.players.length < 2}
            className="flex items-center gap-1"
          >
            Start Game
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </motion.div>
  )
}

