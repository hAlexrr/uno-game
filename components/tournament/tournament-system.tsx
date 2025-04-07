"use client"

import { useState } from "react"
import { Trophy, Users, Award, Calendar, Clock } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for tournaments
const MOCK_TOURNAMENTS = [
  {
    id: "tournament1",
    name: "Weekly Championship",
    status: "active",
    participants: 16,
    currentRound: 2,
    totalRounds: 4,
    startTime: "2 hours ago",
    prize: "1000 points + Gold Trophy",
  },
  {
    id: "tournament2",
    name: "Beginners Cup",
    status: "upcoming",
    participants: 8,
    currentRound: 0,
    totalRounds: 3,
    startTime: "Starts in 30 minutes",
    prize: "500 points + Silver Trophy",
  },
  {
    id: "tournament3",
    name: "Pro League Finals",
    status: "completed",
    participants: 32,
    currentRound: 5,
    totalRounds: 5,
    startTime: "Ended yesterday",
    prize: "2000 points + Platinum Trophy",
    winner: "Alex",
  },
]

// Mock data for tournament brackets
const MOCK_BRACKETS = [
  {
    round: 1,
    matches: [
      { player1: "Player 1", player2: "Player 2", winner: "Player 1", score: "2-0" },
      { player1: "Player 3", player2: "Player 4", winner: "Player 3", score: "2-1" },
      { player1: "Player 5", player2: "Player 6", winner: "Player 5", score: "2-0" },
      { player1: "Player 7", player2: "Player 8", winner: "Player 8", score: "1-2" },
    ],
  },
  {
    round: 2,
    matches: [
      { player1: "Player 1", player2: "Player 3", winner: "Player 3", score: "1-2" },
      { player1: "Player 5", player2: "Player 8", winner: null, score: "1-1", inProgress: true },
    ],
  },
  { round: 3, matches: [{ player1: "Player 3", player2: "?", winner: null, score: "" }] },
]

export default function TournamentSystem() {
  const { gameState } = useMultiplayerContext()
  const [tournaments, setTournaments] = useState(MOCK_TOURNAMENTS)
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null)
  const [brackets, setBrackets] = useState(MOCK_BRACKETS)
  const [isRegistered, setIsRegistered] = useState(false)

  // Register for tournament
  const registerForTournament = (tournamentId: string) => {
    setIsRegistered(true)

    // Update tournament participants count
    setTournaments(
      tournaments.map((tournament) =>
        tournament.id === tournamentId ? { ...tournament, participants: tournament.participants + 1 } : tournament,
      ),
    )
  }

  // View tournament details
  const viewTournamentDetails = (tournamentId: string) => {
    setSelectedTournament(tournamentId)
  }

  // Get selected tournament
  const tournament = tournaments.find((t) => t.id === selectedTournament)

  // If in a game, don't show tournament button
  if (gameState?.gameStarted) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-68 right-4 flex items-center gap-2">
          <Trophy size={16} className="text-yellow-500" />
          <span>Tournaments</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            Tournaments
          </DialogTitle>
        </DialogHeader>

        {selectedTournament ? (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" className="mb-2" onClick={() => setSelectedTournament(null)}>
              ← Back to Tournaments
            </Button>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <h2 className="font-bold text-lg">{tournament?.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-sm">
                <Badge
                  className={
                    tournament?.status === "active"
                      ? "bg-green-500"
                      : tournament?.status === "upcoming"
                        ? "bg-blue-500"
                        : "bg-gray-500"
                  }
                >
                  {tournament?.status === "active"
                    ? "In Progress"
                    : tournament?.status === "upcoming"
                      ? "Upcoming"
                      : "Completed"}
                </Badge>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Users size={14} />
                  <span>{tournament?.participants} players</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Clock size={14} />
                  <span>{tournament?.startTime}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Award size={16} className="text-yellow-600" />
                <span className="text-sm font-medium">{tournament?.prize}</span>
              </div>

              {tournament?.status === "active" && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>
                      Progress: Round {tournament.currentRound} of {tournament.totalRounds}
                    </span>
                    <span>{Math.round((tournament.currentRound / tournament.totalRounds) * 100)}%</span>
                  </div>
                  <Progress value={(tournament.currentRound / tournament.totalRounds) * 100} />
                </div>
              )}

              {tournament?.status === "completed" && tournament.winner && (
                <div className="mt-3 bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded-md flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium">Winner: {tournament.winner}</span>
                </div>
              )}
            </div>

            <Tabs defaultValue="brackets">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="brackets">Brackets</TabsTrigger>
                <TabsTrigger value="standings">Standings</TabsTrigger>
              </TabsList>

              <TabsContent value="brackets" className="space-y-4 pt-4">
                {brackets.map((round, roundIndex) => (
                  <div key={roundIndex}>
                    <h3 className="font-medium text-sm mb-2">Round {round.round}</h3>
                    <div className="space-y-2">
                      {round.matches.map((match, matchIndex) => (
                        <Card
                          key={matchIndex}
                          className={`p-3 ${match.inProgress ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div
                                className={`flex items-center gap-1 ${match.winner === match.player1 ? "font-bold" : ""}`}
                              >
                                <span>{match.player1}</span>
                                {match.winner === match.player1 && <Trophy size={14} className="text-yellow-500" />}
                              </div>
                              <div className="text-xs text-gray-500">vs</div>
                              <div
                                className={`flex items-center gap-1 ${match.winner === match.player2 ? "font-bold" : ""}`}
                              >
                                <span>{match.player2}</span>
                                {match.winner === match.player2 && <Trophy size={14} className="text-yellow-500" />}
                              </div>
                            </div>

                            <div className="text-center">
                              {match.score ? (
                                <span className="font-mono">{match.score}</span>
                              ) : (
                                <span className="text-xs text-gray-500">Not played</span>
                              )}

                              {match.inProgress && <Badge className="ml-2 bg-blue-500">Live</Badge>}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="standings" className="space-y-4 pt-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-gray-700">
                        <th className="text-left py-2">Rank</th>
                        <th className="text-left py-2">Player</th>
                        <th className="text-center py-2">W-L</th>
                        <th className="text-center py-2">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((rank) => (
                        <tr key={rank} className="border-b dark:border-gray-700 last:border-0">
                          <td className="py-2">{rank}</td>
                          <td className="py-2">Player {rank}</td>
                          <td className="py-2 text-center">
                            {6 - rank}-{rank - 1}
                          </td>
                          <td className="py-2 text-center">{(6 - rank) * 100}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Join tournaments to compete with other players and win prizes!</p>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {tournaments.map((tournament) => (
                <Card key={tournament.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        tournament.status === "active"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : tournament.status === "upcoming"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      <Trophy size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{tournament.name}</h4>
                        <Badge
                          className={
                            tournament.status === "active"
                              ? "bg-green-500"
                              : tournament.status === "upcoming"
                                ? "bg-blue-500"
                                : "bg-gray-500"
                          }
                        >
                          {tournament.status === "active"
                            ? "In Progress"
                            : tournament.status === "upcoming"
                              ? "Upcoming"
                              : "Completed"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span>{tournament.participants} players</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{tournament.startTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => viewTournamentDetails(tournament.id)}
                      >
                        Details
                      </Button>

                      {tournament.status === "upcoming" && (
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => registerForTournament(tournament.id)}
                          disabled={isRegistered}
                        >
                          {isRegistered ? "Registered" : "Register"}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Upcoming Tournaments
              </h3>
              <ul className="text-sm space-y-1">
                <li className="flex justify-between">
                  <span>Daily Challenge</span>
                  <span className="text-gray-500">Today, 8:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Weekend Championship</span>
                  <span className="text-gray-500">Saturday, 2:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Monthly Pro League</span>
                  <span className="text-gray-500">Next week</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

