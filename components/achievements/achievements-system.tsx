"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Award, Star, Zap, Target, Flame } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Achievement definitions
const ACHIEVEMENTS = [
  {
    id: "first_win",
    name: "First Victory",
    description: "Win your first game",
    icon: Trophy,
    condition: (stats: any) => stats.wins >= 1,
    reward: "Gold Trophy Badge",
    points: 10,
  },
  {
    id: "win_streak",
    name: "On Fire",
    description: "Win 3 games in a row",
    icon: Flame,
    condition: (stats: any) => stats.winStreak >= 3,
    reward: "Flame Card Effect",
    points: 25,
    progress: (stats: any) => Math.min(stats.winStreak / 3, 1) * 100,
  },
  {
    id: "card_collector",
    name: "Card Collector",
    description: "Play every type of card at least once",
    icon: Star,
    condition: (stats: any) =>
      stats.cardsPlayed?.skip > 0 &&
      stats.cardsPlayed?.reverse > 0 &&
      stats.cardsPlayed?.draw2 > 0 &&
      stats.cardsPlayed?.wild > 0 &&
      stats.cardsPlayed?.wild4 > 0,
    reward: "Special Card Back",
    points: 30,
    progress: (stats: any) => {
      const types = ["skip", "reverse", "draw2", "wild", "wild4"]
      const played = types.filter((type) => (stats.cardsPlayed?.[type] || 0) > 0).length
      return (played / types.length) * 100
    },
  },
  {
    id: "uno_master",
    name: "UNO Master",
    description: "Call UNO 10 times",
    icon: Zap,
    condition: (stats: any) => stats.unoCalls >= 10,
    reward: "Lightning Card Animation",
    points: 20,
    progress: (stats: any) => Math.min(stats.unoCalls / 10, 1) * 100,
  },
  {
    id: "comeback_kid",
    name: "Comeback Kid",
    description: "Win a game after having 10+ cards in hand",
    icon: Target,
    condition: (stats: any) => stats.comebacks >= 1,
    reward: "Target Card Back",
    points: 35,
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Play games with 5 different players",
    icon: Award,
    condition: (stats: any) => (stats.uniquePlayers?.length || 0) >= 5,
    reward: "Butterfly Emote",
    points: 15,
    progress: (stats: any) => Math.min((stats.uniquePlayers?.length || 0) / 5, 1) * 100,
  },
]

export default function AchievementsSystem() {
  const { gameState, playerId } = useMultiplayerContext()
  const [showAchievements, setShowAchievements] = useState(false)
  const [playerStats, setPlayerStats] = useState<any>({
    wins: 2,
    winStreak: 1,
    unoCalls: 7,
    comebacks: 0,
    cardsPlayed: {
      skip: 5,
      reverse: 3,
      draw2: 4,
      wild: 2,
      wild4: 0,
    },
    uniquePlayers: ["player1", "player2", "player3"],
  })
  const [newAchievement, setNewAchievement] = useState<string | null>(null)

  // Calculate unlocked achievements
  const unlockedAchievements = ACHIEVEMENTS.filter((achievement) => achievement.condition(playerStats))

  const lockedAchievements = ACHIEVEMENTS.filter((achievement) => !achievement.condition(playerStats))

  // Calculate total points
  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0)

  // Check for new achievements when stats change
  useEffect(() => {
    // This would normally check against previous stats
    // For demo purposes, we'll just show a random achievement as new
    if (unlockedAchievements.length > 0 && Math.random() > 0.7) {
      const randomAchievement = unlockedAchievements[Math.floor(Math.random() * unlockedAchievements.length)]
      setNewAchievement(randomAchievement.id)

      // Clear the notification after 5 seconds
      setTimeout(() => {
        setNewAchievement(null)
      }, 5000)
    }
  }, [playerStats])

  // Achievement notification popup
  const AchievementNotification = () => {
    if (!newAchievement) return null

    const achievement = ACHIEVEMENTS.find((a) => a.id === newAchievement)
    if (!achievement) return null

    const Icon = achievement.icon

    return (
      <motion.div
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Card className="bg-gradient-to-r from-yellow-400 to-amber-600 text-white p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="font-bold">Achievement Unlocked!</h3>
              <p className="text-sm">{achievement.name}</p>
            </div>
            <Badge className="ml-2 bg-white/30">+{achievement.points} pts</Badge>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Button to open achievements panel
  if (!showAchievements) {
    return (
      <>
        <AnimatePresence>{newAchievement && <AchievementNotification />}</AnimatePresence>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="fixed bottom-20 right-4 flex items-center gap-2">
              <Trophy size={16} className="text-yellow-500" />
              <span>Achievements</span>
              {unlockedAchievements.length > 0 && (
                <Badge className="ml-1 bg-yellow-500/20 text-yellow-600">{unlockedAchievements.length}</Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy size={18} className="text-yellow-500" />
                Achievements
                <Badge className="ml-auto">{totalPoints} points</Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Unlocked achievements */}
              {unlockedAchievements.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Unlocked</h3>
                  <div className="space-y-2">
                    {unlockedAchievements.map((achievement) => {
                      const Icon = achievement.icon
                      return (
                        <Card key={achievement.id} className="p-3 bg-green-50 dark:bg-green-900/20">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                              <Icon size={18} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{achievement.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                              +{achievement.points}
                            </Badge>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Locked achievements */}
              {lockedAchievements.length > 0 && (
                <div>
                  <h3 className="font-medium text-sm mb-2">In Progress</h3>
                  <div className="space-y-2">
                    {lockedAchievements.map((achievement) => {
                      const Icon = achievement.icon
                      const progress = achievement.progress ? achievement.progress(playerStats) : 0

                      return (
                        <Card key={achievement.id} className="p-3 bg-gray-50 dark:bg-gray-800/50">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                              <Icon size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{achievement.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.description}</p>
                              {achievement.progress && <Progress value={progress} className="h-1 mt-1" />}
                            </div>
                            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              +{achievement.points}
                            </Badge>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return null
}

