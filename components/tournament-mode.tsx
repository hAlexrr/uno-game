"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trophy, Users, ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Progress } from "@/components/ui/progress"

export default function TournamentMode() {
  const { gameState, startTournament, isTournamentActive, tournamentRound, tournamentMatches } = useMultiplayerContext()
  const [playerCount, setPlayerCount] = useState(8)

  if (!gameState || !gameState.gameStarted) return null

  if (!isTournamentActive) {
    return (
      <Card className="p-4 max-w-md mx-auto">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" />
          Tournament Mode
        </h2>

        <p className="text-sm mb-4">Start a tournament with multiple players competing for the championship!</p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Number of Players</label>
            <div className="flex gap-2 mt-2">
              {[4, 8, 16].map((count) => (
                <Button
                  key={count}
                  variant={playerCount === count ? "default" : "outline"}
                  onClick={() => setPlayerCount(count)}
                  className="flex-1"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={() => startTournament(playerCount)}>
            <Trophy className="mr-2 h-4 w-4" />
            Start Tournament
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
        <Trophy className="text-yellow-500" />
        Tournament: Round {tournamentRound}
      </h2>

      <Progress value={(tournamentRound / Math.log2(playerCount)) * 100} className="mb-4" />

      <div className="space-y-2">
        {tournamentMatches.map((match, index) => (
          <div key={index} className="flex items-center justify-between p-2 border rounded-md">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>
                {match.player1.name} vs {match.player2.name}
              </span>
            </div>

            {match.winner ? (
              <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {match.winner.name} won
              </Badge>
            ) : match.isActive ? (
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                In progress
              </Badge>
            ) : (
              <Button size="sm" variant="outline" className="h-7">
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

