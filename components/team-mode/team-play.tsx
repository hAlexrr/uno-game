"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, Shuffle } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function TeamPlay() {
  const { gameState, playerId, isHost, socket, roomCode } = useMultiplayerContext()
  const [teamsDialogOpen, setTeamsDialogOpen] = useState(false)
  const [teams, setTeams] = useState<{ teamA: string[]; teamB: string[] }>({ teamA: [], teamB: [] })

  // Check if team play is enabled
  const teamPlayEnabled = gameState?.gameSettings.teamPlay || false

  useEffect(() => {
    if (!gameState) return

    // Extract teams from player data
    const teamA: string[] = []
    const teamB: string[] = []

    gameState.players.forEach((player) => {
      if (player.team === "A") {
        teamA.push(player.id)
      } else if (player.team === "B") {
        teamB.push(player.id)
      }
    })

    setTeams({ teamA, teamB })
  }, [gameState])

  // Toggle a player between teams
  const togglePlayerTeam = (playerId: string) => {
    if (teams.teamA.includes(playerId)) {
      // Move from A to B
      setTeams({
        teamA: teams.teamA.filter((id) => id !== playerId),
        teamB: [...teams.teamB, playerId],
      })
    } else if (teams.teamB.includes(playerId)) {
      // Move from B to no team
      setTeams({
        teamA: teams.teamA,
        teamB: teams.teamB.filter((id) => id !== playerId),
      })
    } else {
      // Add to team A
      setTeams({
        teamA: [...teams.teamA, playerId],
        teamB: teams.teamB,
      })
    }
  }

  // Auto-assign players to teams
  const autoAssignTeams = () => {
    if (!gameState) return

    const playerIds = gameState.players.map((p) => p.id)
    const shuffled = [...playerIds].sort(() => Math.random() - 0.5)

    const halfIndex = Math.ceil(shuffled.length / 2)
    const teamA = shuffled.slice(0, halfIndex)
    const teamB = shuffled.slice(halfIndex)

    setTeams({ teamA, teamB })
  }

  // Save team assignments
  const saveTeams = () => {
    if (!socket || !roomCode) return

    socket.emit("set_teams", {
      roomCode,
      teams: {
        teamA: teams.teamA,
        teamB: teams.teamB,
      },
    })

    setTeamsDialogOpen(false)
  }

  // Get team name for display
  const getPlayerTeamName = (playerId: string) => {
    if (teams.teamA.includes(playerId)) return "Team A"
    if (teams.teamB.includes(playerId)) return "Team B"
    return "No Team"
  }

  // Get team badge color
  const getTeamColor = (playerId: string) => {
    if (teams.teamA.includes(playerId)) return "bg-blue-500"
    if (teams.teamB.includes(playerId)) return "bg-red-500"
    return "bg-gray-400"
  }

  if (!teamPlayEnabled || !gameState) return null

  return (
    <>
      {/* Team indicators in game */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-10">
        <Badge className="bg-blue-500 px-3 py-1 flex items-center gap-1">
          <Shield size={14} />
          Team A: {teams.teamA.length} players
        </Badge>
        <Badge className="bg-red-500 px-3 py-1 flex items-center gap-1">
          <Shield size={14} />
          Team B: {teams.teamB.length} players
        </Badge>

        {isHost && !gameState.gameStarted && (
          <Button size="sm" variant="outline" className="ml-2" onClick={() => setTeamsDialogOpen(true)}>
            <Users size={14} className="mr-1" />
            Edit Teams
          </Button>
        )}
      </div>

      {/* Team Assignment Dialog */}
      <Dialog open={teamsDialogOpen} onOpenChange={setTeamsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users size={18} />
              Team Assignments
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between mb-4">
              <Button variant="outline" onClick={autoAssignTeams} className="flex items-center gap-1">
                <Shuffle size={14} />
                Auto-Assign
              </Button>
              <Button onClick={saveTeams}>Save Teams</Button>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto pr-1">
              {gameState.players.map((player) => (
                <div
                  key={player.id}
                  className={`p-3 border rounded-lg cursor-pointer flex items-center justify-between
                    ${
                      teams.teamA.includes(player.id)
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : teams.teamB.includes(player.id)
                          ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                          : "bg-gray-50 dark:bg-gray-800/50"
                    }`}
                  onClick={() => togglePlayerTeam(player.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">
                        {player.name} {player.id === playerId ? "(You)" : ""}
                      </h4>
                      <p className="text-xs text-gray-500">{player.isBot ? "Bot" : "Human"}</p>
                    </div>
                  </div>

                  <Badge className={getTeamColor(player.id)}>{getPlayerTeamName(player.id)}</Badge>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

