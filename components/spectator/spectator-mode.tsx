"use client"

import { DialogTitle } from "@/components/ui/dialog"

import { DialogHeader } from "@/components/ui/dialog"

import { DialogContent } from "@/components/ui/dialog"

import { DialogTrigger } from "@/components/ui/dialog"

import { Dialog } from "@/components/ui/dialog"

import { useState } from "react"
import { Eye, MessageSquare, ArrowLeft, ArrowRight } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock data for active games
const MOCK_ACTIVE_GAMES = [
  {
    id: "game1",
    host: "Alex",
    players: ["Alex", "Taylor", "Jordan", "Casey"],
    spectators: 3,
    inProgress: true,
    started: "5 minutes ago",
  },
  {
    id: "game2",
    host: "Riley",
    players: ["Riley", "Morgan"],
    spectators: 1,
    inProgress: false,
    started: "Starting soon",
  },
  {
    id: "game3",
    host: "Jamie",
    players: ["Jamie", "Quinn", "Avery", "Dakota"],
    spectators: 7,
    inProgress: true,
    started: "15 minutes ago",
  },
]

export default function SpectatorMode() {
  const { gameState } = useMultiplayerContext()
  const [activeGames, setActiveGames] = useState(MOCK_ACTIVE_GAMES)
  const [isSpectating, setIsSpectating] = useState(false)
  const [currentGameId, setCurrentGameId] = useState<string | null>(null)
  const [spectatorChat, setSpectatorChat] = useState<
    Array<{
      name: string
      message: string
      timestamp: string
    }>
  >([
    { name: "System", message: "Welcome to spectator chat!", timestamp: "12:00" },
    { name: "Alex", message: "Good luck everyone!", timestamp: "12:01" },
    { name: "Spectator429", message: "That was a great move!", timestamp: "12:03" },
  ])
  const [chatMessage, setChatMessage] = useState("")

  // Join as spectator
  const joinAsSpectator = (gameId: string) => {
    setCurrentGameId(gameId)
    setIsSpectating(true)
  }

  // Leave spectator mode
  const leaveSpectatorMode = () => {
    setIsSpectating(false)
    setCurrentGameId(null)
  }

  // Send chat message
  const sendChatMessage = () => {
    if (!chatMessage.trim()) return

    setSpectatorChat([
      ...spectatorChat,
      {
        name: "You (Spectator)",
        message: chatMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])

    setChatMessage("")
  }

  // If already in a game, don't show spectator mode
  if (gameState?.gameStarted) return null

  // Spectating UI
  if (isSpectating) {
    const currentGame = activeGames.find((game) => game.id === currentGameId)

    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <Button variant="ghost" onClick={leaveSpectatorMode} className="text-white">
            <ArrowLeft size={16} className="mr-2" />
            Exit Spectator Mode
          </Button>

          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600">
              <Eye size={14} className="mr-1" />
              {currentGame?.spectators} watching
            </Badge>
            <Badge className="bg-green-600">{currentGame?.inProgress ? "In Progress" : "Lobby"}</Badge>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Game view (placeholder) */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-center">
              <h2 className="text-xl mb-4">Spectating {currentGame?.host}'s Game</h2>
              <p className="text-gray-400 mb-8">Game started {currentGame?.started}</p>

              {/* Placeholder for game view */}
              <div className="w-[600px] h-[400px] bg-green-900/30 rounded-lg border border-green-800 mx-auto flex items-center justify-center">
                <p className="text-gray-400">Game view would appear here</p>
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <Button variant="outline" className="text-white border-white/20">
                  <ArrowLeft size={16} className="mr-2" />
                  Previous Game
                </Button>
                <Button variant="outline" className="text-white border-white/20">
                  Next Game
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Spectator chat */}
          <div className="w-80 bg-gray-900 border-l border-gray-800">
            <div className="p-3 border-b border-gray-800 flex items-center">
              <MessageSquare size={16} className="text-gray-400 mr-2" />
              <h3 className="text-white font-medium">Spectator Chat</h3>
            </div>

            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="p-3 space-y-2">
                {spectatorChat.map((msg, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-white">{msg.name}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-gray-300">{msg.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                />
                <Button size="sm" onClick={sendChatMessage}>
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Spectator mode button and dialog
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-56 right-4 flex items-center gap-2">
          <Eye size={16} />
          <span>Spectate</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye size={18} />
            Spectator Mode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Watch other players' games without participating. Chat with other spectators and learn new strategies!
          </p>

          <h3 className="font-medium text-sm">Active Games</h3>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {activeGames.map((game) => (
              <Card key={game.id} className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{game.host.charAt(0)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{game.host}'s Game</h4>
                      <Badge className={game.inProgress ? "bg-green-600" : "bg-blue-600"}>
                        {game.inProgress ? "In Progress" : "Lobby"}
                      </Badge>
                    </div>

                    <p className="text-xs text-gray-500">
                      {game.players.length} players • {game.spectators} watching • {game.started}
                    </p>
                  </div>

                  <Button size="sm" onClick={() => joinAsSpectator(game.id)}>
                    <Eye size={14} className="mr-1" />
                    Watch
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

