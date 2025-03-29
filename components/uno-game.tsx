"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import UnoCardComponent from "./uno-card"
import type { Card as UnoCard, Player, AnimationState } from "@/lib/types"
import { Slider } from "@/components/ui/slider"
import {
  Eye,
  RotateCw,
  Users,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Trophy,
  Clock,
  Lightbulb,
  SortDesc,
  Settings,
  ChevronDown,
  ChevronUp,
  History,
  MessageSquare,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"
import { useTheme } from "next-themes"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function UnoGame() {
  const { theme, setTheme } = useTheme()
  const [gameStarted, setGameStarted] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [topCard, setTopCard] = useState<UnoCard | null>(null)
  const [botCount, setBotCount] = useState(3)
  const [viewingPlayerId, setViewingPlayerId] = useState<number | null>(null)
  const [animation, setAnimation] = useState<AnimationState>({ type: null })
  const [showUnoCall, setShowUnoCall] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(0.5)
  const [isShuffling, setIsShuffling] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [currentColor, setCurrentColor] = useState<"red" | "blue" | "green" | "yellow" | null>(null)
  const [pendingWildCard, setPendingWildCard] = useState<UnoCard | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({})
  const [botDifficulty, setBotDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [turnTimer, setTurnTimer] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [cardsRemaining, setCardsRemaining] = useState(40)
  const [sortedHand, setSortedHand] = useState(false)
  const [showScoreboard, setShowScoreboard] = useState(true)
  const [gameLog, setGameLog] = useState<string[]>([])
  const [showGameLog, setShowGameLog] = useState(false)
  const [lastAction, setLastAction] = useState<string>("")
  const [showEmoji, setShowEmoji] = useState<{ emoji: string; playerId: number } | null>(null)

  // Game settings
  const [gameSettings, setGameSettings] = useState({
    stackingEnabled: false,
    jumpInEnabled: false,
    drawUntilMatch: false,
    forcePlay: true,
    sevenORule: false,
    blankCards: false,
    challengeRule: true,
    playDrawnCard: true,
    specialSwapHands: false,
    gameSpeed: "normal" as "slow" | "normal" | "fast",
  })

  // Ref for game log scroll
  const gameLogRef = useRef<HTMLDivElement>(null)

  // Mock data for demonstration
  const cardColors = ["red", "blue", "green", "yellow"]
  const cardValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"]
  const wildCards = ["wild", "wild4"]
  const specialCards = gameSettings.specialSwapHands ? ["swap"] : []
  const emojis = ["👍", "👎", "😂", "😢", "😡", "🎉", "🤔", "🙄", "🤯", "🔥"]

  // Play sound effect
  const playSound = (sound: string) => {
    if (!soundEnabled) return

    const audio = new Audio(`/sounds/${sound}.mp3`)
    audio.volume = soundVolume
    audio.play().catch((e) => console.error("Error playing sound:", e))
  }

  // Add to game log
  const addToGameLog = (message: string) => {
    setGameLog((prev) => [...prev, message])
    setLastAction(message)

    // Scroll to bottom of log
    setTimeout(() => {
      if (gameLogRef.current) {
        gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight
      }
    }, 100)
  }

  // Turn timer effect
  useEffect(() => {
    if (!gameStarted || !currentPlayer || winner) return

    if (currentPlayer.isHuman) {
      // Start a 30-second timer for human players
      const timer = setTimeout(() => {
        // Auto-draw a card if time runs out
        if (currentPlayer.isHuman && currentPlayer.isCurrentTurn) {
          addToGameLog(`${currentPlayer.name}'s turn timed out - drawing a card`)
          drawCard()
        }
      }, 30000)

      setTurnTimer(30)

      const interval = setInterval(() => {
        setTurnTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
      }, 1000)

      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    } else {
      // Bot turn speed based on game speed setting
      let botDelay = 1000
      if (gameSettings.gameSpeed === "fast") botDelay = 500
      if (gameSettings.gameSpeed === "slow") botDelay = 2000

      const timer = setTimeout(() => {
        if (currentPlayer && !currentPlayer.isHuman && currentPlayer.isCurrentTurn) {
          simulateBotTurn(currentPlayer)
        }
      }, botDelay)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [currentPlayer, gameStarted, winner, gameSettings.gameSpeed])

  // Scroll game log to bottom when new entries are added
  useEffect(() => {
    if (gameLogRef.current) {
      gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight
    }
  }, [gameLog])

  const generateRandomCard = (): UnoCard => {
    // Chance to generate a special card if enabled
    if (gameSettings.specialSwapHands && Math.random() > 0.95) {
      return {
        id: Math.floor(Math.random() * 10000),
        color: "wild",
        value: "swap",
        type: "special",
      }
    }

    // Chance to generate a blank card if enabled
    if (gameSettings.blankCards && Math.random() > 0.95) {
      return {
        id: Math.floor(Math.random() * 10000),
        color: "wild",
        value: "blank",
        type: "special",
      }
    }

    const isWild = Math.random() > 0.8
    const color = isWild
      ? "wild"
      : (cardColors[Math.floor(Math.random() * cardColors.length)] as "red" | "blue" | "green" | "yellow" | "wild")
    const value = isWild
      ? wildCards[Math.floor(Math.random() * wildCards.length)]
      : cardValues[Math.floor(Math.random() * cardValues.length)]
    const type = isWild ? "wild" : ["skip", "reverse", "draw2"].includes(value) ? "action" : "number"

    return {
      id: Math.floor(Math.random() * 10000),
      color,
      value,
      type,
    }
  }

  const generateHand = (count = 7): UnoCard[] => {
    const hand: UnoCard[] = []
    for (let i = 0; i < count; i++) {
      hand.push(generateRandomCard())
    }
    return hand
  }

  const joinGame = () => {
    if (playerName.trim() === "") return

    const newPlayer: Player = {
      id: 1, // Human player is always ID 1
      name: playerName,
      cards: generateHand(),
      isCurrentTurn: true,
      isHuman: true,
    }

    setPlayers([newPlayer])
    setCurrentPlayer(newPlayer)
    setViewingPlayerId(1)
    setPlayerName("")

    // Initialize score
    setScores({ [playerName]: 0 })

    // Clear game log
    setGameLog([])
  }

  const addBots = () => {
    const bots: Player[] = []
    for (let i = 0; i < botCount; i++) {
      const botName = `Bot ${i + 1}`
      bots.push({
        id: i + 2, // Bot IDs start from 2
        name: botName,
        cards: generateHand(),
        isCurrentTurn: false,
        isHuman: false,
      })

      // Initialize bot scores
      setScores((prev) => ({ ...prev, [botName]: 0 }))
    }
    setPlayers((prev) => [...prev, ...bots])
  }

  const startGame = () => {
    if (players.length === 0) return

    // Add bots if in simulation mode
    if (players.length === 1) {
      addBots()
    }

    // Shuffle animation
    setIsShuffling(true)
    playSound("shuffle")

    // Set random number of cards remaining
    setCardsRemaining(Math.floor(Math.random() * 30) + 30)

    // Clear game log
    setGameLog([])
    addToGameLog("Game started")

    setTimeout(() => {
      // Set a random card as the top card
      const initialCard = generateRandomCard()
      // Make sure the initial card is not a wild card or special card
      if (initialCard.type === "wild" || initialCard.type === "special") {
        initialCard.color = cardColors[Math.floor(Math.random() * cardColors.length)] as
          | "red"
          | "blue"
          | "green"
          | "yellow"
        initialCard.type = "number"
        initialCard.value = cardValues[Math.floor(Math.random() * 9)] // Only use number cards
      }
      setTopCard(initialCard)
      setCurrentColor(initialCard.color as "red" | "blue" | "green" | "yellow")
      setGameStarted(true)
      setIsShuffling(false)

      addToGameLog(`Initial card: ${initialCard.color} ${initialCard.value}`)
      addToGameLog(`${players[0].name}'s turn`)
    }, 1500)
  }

  const playCard = (card: UnoCard, playerId?: number) => {
    if (!currentPlayer) return

    const playerToPlay = playerId || currentPlayer.id
    const player = players.find((p) => p.id === playerToPlay)
    if (!player) return

    // Handle special cards
    if (card.type === "special") {
      if (card.value === "swap") {
        // Swap hands with a random player
        const otherPlayers = players.filter((p) => p.id !== playerToPlay)
        const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)]

        const updatedPlayers = players.map((p) => {
          if (p.id === playerToPlay) {
            return { ...p, cards: [...randomPlayer.cards], isCurrentTurn: false }
          }
          if (p.id === randomPlayer.id) {
            return { ...p, cards: [...player.cards] }
          }
          return p
        })

        setPlayers(updatedPlayers)
        addToGameLog(`${player.name} swapped hands with ${randomPlayer.name}!`)
        playSound("special")

        // Set next player
        const nextPlayerId = getNextPlayerId(playerToPlay)
        setTimeout(() => {
          const nextPlayer = updatedPlayers.find((p) => p.id === nextPlayerId)
          if (nextPlayer) {
            const finalPlayers = updatedPlayers.map((p) => ({
              ...p,
              isCurrentTurn: p.id === nextPlayerId,
            }))
            setPlayers(finalPlayers)
            setCurrentPlayer(nextPlayer)
            addToGameLog(`${nextPlayer.name}'s turn`)
          }
        }, 1000)

        return true
      }

      if (card.value === "blank") {
        // For blank cards, just set the color
        setPendingWildCard(card)
        setShowColorPicker(true)
        return true
      }
    }

    // Handle wild cards
    if (card.type === "wild" && player.isHuman) {
      setPendingWildCard(card)
      setShowColorPicker(true)
      return true
    }

    // For bot wild cards, choose a random color
    if (card.type === "wild" && !player.isHuman) {
      const randomColor = cardColors[Math.floor(Math.random() * cardColors.length)] as
        | "red"
        | "blue"
        | "green"
        | "yellow"
      setCurrentColor(randomColor)
      addToGameLog(`${player.name} chose ${randomColor}`)
    }

    // Check if the card can be played
    const canPlay =
      !topCard ||
      card.type === "wild" ||
      card.type === "special" ||
      topCard.color === card.color ||
      currentColor === card.color ||
      topCard.value === card.value

    if (!canPlay) {
      if (player.isHuman) {
        alert("This card cannot be played on the current top card!")
      }
      return false
    }

    // Play card animation
    setAnimation({
      type: "playCard",
      playerId: playerToPlay,
      card: card,
    })

    // Play sound effect
    if (card.type === "action") {
      playSound("special")
    } else if (card.type === "wild" || card.type === "special") {
      playSound("wild")
    } else {
      playSound("card")
    }

    // Add to game log
    addToGameLog(`${player.name} played ${card.color} ${card.value}`)

    // Check if player will have one card left
    const willHaveOneCard = player.cards.length === 2

    // Remove the card from the player's hand
    const updatedPlayers = players.map((p) => {
      if (p.id === playerToPlay) {
        const updatedCards = p.cards.filter((c) => c.id !== card.id)

        // Check for winner
        if (updatedCards.length === 0) {
          setTimeout(() => {
            setWinner(p)
            playSound("win")

            // Update scores
            setScores((prev) => ({
              ...prev,
              [p.name]: (prev[p.name] || 0) + 1,
            }))

            addToGameLog(`${p.name} wins the game!`)

            // Trigger confetti
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            })
          }, 500)
        }

        return {
          ...p,
          cards: updatedCards,
          isCurrentTurn: false,
        }
      }

      // Handle special card effects
      if (card.value === "skip" && p.id === getNextPlayerId(playerToPlay)) {
        addToGameLog(`${p.name} was skipped!`)
        return {
          ...p,
          isCurrentTurn: false,
        }
      }

      if (card.value === "reverse") {
        addToGameLog("Direction reversed!")
        // In a 2-player game, reverse acts like skip
        if (players.length === 2 && p.id === getNextPlayerId(playerToPlay)) {
          return {
            ...p,
            isCurrentTurn: false,
          }
        }
      }

      // Handle Seven-O rule
      if (gameSettings.sevenORule) {
        if (card.value === "7") {
          // Player who played 7 chooses someone to swap hands with
          // For simplicity, we'll choose the next player
          const nextPlayerId = getNextPlayerId(playerToPlay)
          if (p.id === nextPlayerId) {
            addToGameLog(`${player.name} swapped hands with ${p.name} (Seven rule)`)
            return {
              ...p,
              cards: [...player.cards.filter((c) => c.id !== card.id)],
              isCurrentTurn: true,
            }
          }
        }

        if (card.value === "0") {
          // Everyone passes their hand to the next player
          // This is complex to implement in this demo, so we'll just log it
          addToGameLog("Everyone rotates their hands! (Zero rule)")
          // We would need to implement a more complex rotation here
        }
      }

      // Set the next player's turn
      const nextPlayerId = getNextPlayerId(playerToPlay)
      if (p.id === nextPlayerId) {
        return {
          ...p,
          isCurrentTurn: true,
        }
      }

      return p
    })

    // If bot has one card left, sometimes call UNO
    if (willHaveOneCard && !player.isHuman && Math.random() > 0.5) {
      setTimeout(() => {
        callUno(player.name)
      }, 500)
    }

    // Update the current color if not a wild card
    if (card.type !== "wild" && card.type !== "special") {
      setCurrentColor(card.color as "red" | "blue" | "green" | "yellow")
    }

    // Decrease cards remaining
    setCardsRemaining((prev) => Math.max(0, prev - 1))

    setTimeout(() => {
      setPlayers(updatedPlayers)
      setTopCard(card)

      const nextPlayer = updatedPlayers.find((p) => p.id === getNextPlayerId(playerToPlay)) || null
      setCurrentPlayer(nextPlayer)

      if (nextPlayer) {
        addToGameLog(`${nextPlayer.name}'s turn`)
      }

      // Clear animation
      setAnimation({ type: null })
    }, 500)

    return true
  }

  const selectWildColor = (color: "red" | "blue" | "green" | "yellow") => {
    if (!pendingWildCard) return

    setCurrentColor(color)
    setShowColorPicker(false)

    addToGameLog(`${currentPlayer?.name} chose ${color}`)

    // Create a copy of the wild card with the selected color
    const wildCardWithColor = { ...pendingWildCard }

    // Continue with playing the card
    playCard(wildCardWithColor)
    setPendingWildCard(null)
  }

  const getNextPlayerId = (currentId: number): number => {
    // Simple implementation - just go to the next player in order
    const currentIndex = players.findIndex((p) => p.id === currentId)
    const nextIndex = (currentIndex + 1) % players.length
    return players[nextIndex].id
  }

  const simulateBotTurn = (bot: Player) => {
    // Bot AI based on difficulty
    const validCards = bot.cards.filter(
      (card) =>
        !topCard ||
        card.type === "wild" ||
        card.type === "special" ||
        topCard.color === card.color ||
        currentColor === card.color ||
        topCard.value === card.value,
    )

    if (validCards.length > 0) {
      let cardToPlay: UnoCard

      switch (botDifficulty) {
        case "easy":
          // Play a random valid card
          cardToPlay = validCards[Math.floor(Math.random() * validCards.length)]
          break

        case "medium":
          // Prefer action cards and wild cards
          const actionCards = validCards.filter(
            (card) => card.type === "action" || card.type === "wild" || card.type === "special",
          )
          if (actionCards.length > 0 && Math.random() > 0.3) {
            cardToPlay = actionCards[Math.floor(Math.random() * actionCards.length)]
          } else {
            cardToPlay = validCards[Math.floor(Math.random() * validCards.length)]
          }
          break

        case "hard":
          // Strategic play - prioritize wild cards when low on cards of a certain color
          const colorCounts: Record<string, number> = {}
          bot.cards.forEach((card) => {
            if (card.color !== "wild") {
              colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
            }
          })

          // Find the most common color in hand
          let mostCommonColor = "red"
          let maxCount = 0
          Object.entries(colorCounts).forEach(([color, count]) => {
            if (count > maxCount) {
              mostCommonColor = color
              maxCount = count
            }
          })

          // Prioritize cards of the most common color
          const colorCards = validCards.filter((card) => card.color === mostCommonColor)
          const wildCards = validCards.filter((card) => card.type === "wild" || card.type === "special")

          if (colorCards.length > 0) {
            cardToPlay = colorCards[Math.floor(Math.random() * colorCards.length)]
          } else if (wildCards.length > 0) {
            cardToPlay = wildCards[Math.floor(Math.random() * wildCards.length)]
          } else {
            cardToPlay = validCards[Math.floor(Math.random() * validCards.length)]
          }
          break

        default:
          cardToPlay = validCards[Math.floor(Math.random() * validCards.length)]
      }

      // Random emoji reaction (10% chance)
      if (Math.random() > 0.9) {
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)]
        showEmojiReaction(randomEmoji, bot.id)
      }

      playCard(cardToPlay, bot.id)
    } else {
      // Draw a card
      drawCard(bot.id)
    }
  }

  const drawCard = (playerId?: number) => {
    if (!currentPlayer) return

    const playerToDraw = playerId || currentPlayer.id
    const player = players.find((p) => p.id === playerToDraw)
    if (!player) return

    // Draw card animation
    setAnimation({
      type: "drawCard",
      playerId: playerToDraw,
    })

    // Play sound effect
    playSound("draw")

    addToGameLog(`${player.name} drew a card`)

    const newCard = generateRandomCard()

    // Decrease cards remaining
    setCardsRemaining((prev) => Math.max(0, prev - 1))

    setTimeout(() => {
      const updatedPlayers = players.map((p) => {
        if (p.id === playerToDraw) {
          return {
            ...p,
            cards: [...p.cards, newCard],
          }
        }
        return p
      })

      setPlayers(updatedPlayers)

      // Clear animation
      setAnimation({ type: null })

      // If it's a bot's turn, they should try to play the drawn card if possible
      if (player && !player.isHuman) {
        const canPlay =
          !topCard ||
          newCard.type === "wild" ||
          newCard.type === "special" ||
          topCard.color === newCard.color ||
          currentColor === newCard.color ||
          topCard.value === newCard.value

        if (canPlay && gameSettings.playDrawnCard) {
          setTimeout(() => playCard(newCard, playerToDraw), 500)
        } else {
          // End turn
          const nextPlayerId = getNextPlayerId(playerToDraw)
          const updatedPlayersAfterDraw = updatedPlayers.map((p) => ({
            ...p,
            isCurrentTurn: p.id === nextPlayerId,
          }))

          setPlayers(updatedPlayersAfterDraw)
          const nextPlayer = updatedPlayersAfterDraw.find((p) => p.id === nextPlayerId) || null
          setCurrentPlayer(nextPlayer)

          if (nextPlayer) {
            addToGameLog(`${nextPlayer.name}'s turn`)
          }
        }
      } else if (player && player.isHuman && gameSettings.playDrawnCard) {
        // For human players, ask if they want to play the drawn card
        const canPlay =
          !topCard ||
          newCard.type === "wild" ||
          newCard.type === "special" ||
          topCard.color === newCard.color ||
          currentColor === newCard.color ||
          topCard.value === newCard.value

        if (canPlay && confirm(`You drew a ${newCard.color} ${newCard.value}. Do you want to play it?`)) {
          setTimeout(() => playCard(newCard, playerToDraw), 500)
        } else {
          // End turn
          const nextPlayerId = getNextPlayerId(playerToDraw)
          const updatedPlayersAfterDraw = updatedPlayers.map((p) => ({
            ...p,
            isCurrentTurn: p.id === nextPlayerId,
          }))

          setPlayers(updatedPlayersAfterDraw)
          const nextPlayer = updatedPlayersAfterDraw.find((p) => p.id === nextPlayerId) || null
          setCurrentPlayer(nextPlayer)

          if (nextPlayer) {
            addToGameLog(`${nextPlayer.name}'s turn`)
          }
        }
      }
    }, 500)
  }

  const viewPlayerHand = (playerId: number) => {
    // Add a flip animation
    playSound("flip")
    setViewingPlayerId(playerId)
    addToGameLog(
      `${players.find((p) => p.isHuman)?.name} is viewing ${players.find((p) => p.id === playerId)?.name}'s hand`,
    )
  }

  const callUno = (playerName: string) => {
    playSound("uno")
    setShowUnoCall(true)
    addToGameLog(`${playerName} called UNO!`)

    setTimeout(() => {
      setShowUnoCall(false)
    }, 2000)
  }

  const resetGame = () => {
    setWinner(null)
    setPlayers([])
    setCurrentPlayer(null)
    setTopCard(null)
    setGameStarted(false)
    setViewingPlayerId(null)
    setAnimation({ type: null })
    setCurrentColor(null)
    setGameLog([])
  }

  const playAgain = () => {
    // Keep the same players but reset the game state
    setWinner(null)
    setTopCard(null)
    setAnimation({ type: null })
    setCurrentColor(null)
    setViewingPlayerId(1)

    // Reset player hands and turns
    const updatedPlayers = players.map((p, index) => ({
      ...p,
      cards: generateHand(),
      isCurrentTurn: index === 0, // First player starts
    }))

    setPlayers(updatedPlayers)
    setCurrentPlayer(updatedPlayers[0])

    // Shuffle animation
    setIsShuffling(true)
    playSound("shuffle")

    // Set random number of cards remaining
    setCardsRemaining(Math.floor(Math.random() * 30) + 30)

    // Clear game log
    setGameLog([])
    addToGameLog("New game started")

    setTimeout(() => {
      // Set a random card as the top card
      const initialCard = generateRandomCard()
      // Make sure the initial card is not a wild card
      if (initialCard.type === "wild" || initialCard.type === "special") {
        initialCard.color = cardColors[Math.floor(Math.random() * cardColors.length)] as
          | "red"
          | "blue"
          | "green"
          | "yellow"
        initialCard.type = "number"
        initialCard.value = cardValues[Math.floor(Math.random() * 9)] // Only use number cards
      }
      setTopCard(initialCard)
      setCurrentColor(initialCard.color as "red" | "blue" | "green" | "yellow")
      setIsShuffling(false)

      addToGameLog(`Initial card: ${initialCard.color} ${initialCard.value}`)
      addToGameLog(`${updatedPlayers[0].name}'s turn`)
    }, 1500)
  }

  const showEmojiReaction = (emoji: string, playerId: number) => {
    setShowEmoji({ emoji, playerId })

    setTimeout(() => {
      setShowEmoji(null)
    }, 2000)
  }

  // Calculate positions for players around a virtual table - now in a more circular arrangement
  const getPlayerPositions = () => {
    const totalPlayers = players.length
    if (totalPlayers <= 1) return []

    // We'll position the human player at the bottom (not in this array)
    // and distribute the bots in a circular arrangement around the top of the table
    const botPlayers = players.filter((p) => !p.isHuman)
    const positions = []

    // Calculate positions in a circular arrangement
    // We'll use a 240-degree arc (leaving 120 degrees at the bottom for the human player)
    const arcAngle = Math.PI * 1.33 // 240 degrees in radians
    const startAngle = Math.PI - arcAngle / 2 // Start from the left side
    const angleStep = arcAngle / Math.max(1, botPlayers.length - 1)

    for (let i = 0; i < botPlayers.length; i++) {
      // Calculate angle (in radians) for this player
      let angle

      if (botPlayers.length === 1) {
        // If there's only one bot, place it at the top
        angle = Math.PI / 2
      } else {
        angle = startAngle + angleStep * i
      }

      // Calculate position using a circular formula
      // Use a consistent radius to ensure a perfect circle
      const radius = 0.38 // Slightly larger radius for better spacing
      const x = 0.5 + radius * Math.cos(angle)
      const y = 0.5 + radius * Math.sin(angle)

      positions.push({
        player: botPlayers[i],
        x: x * 100, // Convert to percentage
        y: y * 100,
      })
    }

    return positions
  }

  const getColorClass = (color: string | null) => {
    switch (color) {
      case "red":
        return "bg-red-600"
      case "blue":
        return "bg-blue-600"
      case "green":
        return "bg-green-600"
      case "yellow":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  const sortCards = (cards: UnoCard[]) => {
    if (!sortedHand) return cards

    return [...cards].sort((a, b) => {
      // First sort by color
      if (a.color !== b.color) {
        const colorOrder = { red: 1, yellow: 2, green: 3, blue: 4, wild: 5 }
        return colorOrder[a.color as keyof typeof colorOrder] - colorOrder[b.color as keyof typeof colorOrder]
      }

      // Then sort by value
      const valueOrder: Record<string, number> = {
        "0": 0,
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
        "8": 8,
        "9": 9,
        skip: 10,
        reverse: 11,
        draw2: 12,
        wild: 13,
        wild4: 14,
        swap: 15,
        blank: 16,
      }

      return valueOrder[a.value] - valueOrder[b.value]
    })
  }

  const getPlayableCards = () => {
    const humanPlayer = players.find((p) => p.isHuman)
    if (!humanPlayer) return []

    return humanPlayer.cards.filter(
      (card) =>
        !topCard ||
        card.type === "wild" ||
        card.type === "special" ||
        topCard.color === card.color ||
        currentColor === card.color ||
        topCard.value === card.value,
    )
  }

  const sendEmoji = (emoji: string) => {
    const humanPlayer = players.find((p) => p.isHuman)
    if (humanPlayer) {
      showEmojiReaction(emoji, humanPlayer.id)
      addToGameLog(`${humanPlayer.name} reacted with ${emoji}`)
    }
  }

  return (
    <div className="flex flex-col items-center">
      {!gameStarted ? (
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
      ) : (
        <div className="w-full h-[calc(100vh-40px)] max-h-[900px] relative">
          {/* Game table */}
          <motion.div
            className="absolute inset-[5%] rounded-full bg-green-800/20 border-4 border-green-900/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          ></motion.div>

          {/* Center game area */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-4">
            {/* Current color indicator */}
            {currentColor && (
              <motion.div
                className={`w-12 h-12 rounded-full ${getColorClass(currentColor)} shadow-lg mb-2 border-2 border-white`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={currentColor}
                transition={{ type: "spring" }}
              />
            )}

            <div className="flex items-center gap-4">
              {/* Draw pile */}
              <motion.div
                className="relative w-20 h-28 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-inner flex items-center justify-center"
                animate={
                  isShuffling
                    ? {
                        rotate: [0, 5, -5, 5, -5, 0],
                        x: [0, 5, -5, 5, -5, 0],
                        y: [0, 5, -5, 5, -5, 0],
                      }
                    : {}
                }
                transition={{ duration: 1, repeat: isShuffling ? Number.POSITIVE_INFINITY : 0 }}
              >
                <Button
                  variant="outline"
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white border-2 border-white"
                  onClick={() => drawCard()}
                  disabled={!currentPlayer?.isHuman || !currentPlayer?.isCurrentTurn || !!winner}
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  Draw
                </Button>
                {cardsRemaining > 0 && <Badge className="absolute -top-2 -right-2 bg-blue-500">{cardsRemaining}</Badge>}
              </motion.div>

              {/* Discard pile */}
              <div className="w-20 h-28 flex items-center justify-center">
                {topCard ? (
                  <motion.div
                    key={topCard.id}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <UnoCardComponent card={topCard} onClick={() => {}} disabled />
                  </motion.div>
                ) : (
                  <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-center text-xs">No card played</p>
                  </div>
                )}
              </div>
            </div>

            {/* Last action display */}
            {lastAction && (
              <motion.div
                className="mt-2 px-3 py-1 bg-black/20 dark:bg-white/20 rounded-full text-xs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={lastAction}
              >
                {lastAction}
              </motion.div>
            )}
          </div>

          {/* Bot players positioned in a circular arrangement */}
          {getPlayerPositions().map(({ player, x, y }) => (
            <motion.div
              key={player.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: player.id * 0.1 }}
            >
              <motion.div
                className={`flex flex-col items-center`}
                animate={
                  player.isCurrentTurn
                    ? {
                        scale: [1, 1.05, 1],
                        y: [0, -5, 0],
                      }
                    : {}
                }
                transition={{ duration: 1, repeat: player.isCurrentTurn ? Number.POSITIVE_INFINITY : 0 }}
              >
                {/* Player name above cards */}
                <div
                  className={`px-3 py-1 rounded-full mb-2 flex items-center gap-1 ${
                    player.isCurrentTurn ? "bg-primary text-primary-foreground" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span className="text-sm font-medium">{player.name}</span>
                  <span className="text-xs bg-black/20 dark:bg-white/20 px-1 rounded-full">{player.cards.length}</span>
                  <button
                    onClick={() => viewPlayerHand(player.id)}
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title={`View ${player.name}'s hand`}
                  >
                    <Eye size={14} />
                  </button>
                </div>

                {/* Show 3 cards from the back to represent their hand */}
                <div className="relative h-8 flex items-center">
                  {[...Array(Math.min(3, player.cards.length))].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-8 h-12 rounded-md bg-blue-600 border-2 border-white shadow-md"
                      style={{
                        left: `${i * 4}px`,
                        zIndex: i,
                      }}
                      animate={{
                        rotate: (i - 1) * 5,
                        y: animation.type === "playCard" && animation.playerId === player.id ? -10 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                        UNO
                      </div>
                    </motion.div>
                  ))}
                  {player.cards.length > 3 && (
                    <span className="absolute left-16 text-xs text-gray-600 dark:text-gray-400">
                      +{player.cards.length - 3}
                    </span>
                  )}
                </div>

                {/* Emoji reaction */}
                <AnimatePresence>
                  {showEmoji && showEmoji.playerId === player.id && (
                    <motion.div
                      className="absolute -top-8 text-2xl"
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring" }}
                    >
                      {showEmoji.emoji}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}

          {/* Human player at the bottom */}
          <div className="absolute bottom-[10%] left-0 right-0 flex flex-col items-center">
            {/* Player name and status - now ABOVE the cards */}
            <motion.div
              className={`px-4 py-1 rounded-full mb-2 flex items-center gap-2 ${
                currentPlayer?.isHuman && currentPlayer?.isCurrentTurn
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              animate={
                currentPlayer?.isHuman && currentPlayer?.isCurrentTurn
                  ? {
                      scale: [1, 1.05, 1],
                      y: [0, -5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 1,
                repeat: currentPlayer?.isHuman && currentPlayer?.isCurrentTurn ? Number.POSITIVE_INFINITY : 0,
              }}
            >
              <span className="font-medium">{players.find((p) => p.isHuman)?.name || "You"}</span>
              {currentPlayer?.isHuman && currentPlayer?.isCurrentTurn && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Your Turn</span>
              )}
              {turnTimer !== null && currentPlayer?.isHuman && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock size={12} />
                  {turnTimer}s
                </span>
              )}

              {/* Emoji reaction */}
              <AnimatePresence>
                {showEmoji && showEmoji.playerId === players.find((p) => p.isHuman)?.id && (
                  <motion.div
                    className="text-2xl ml-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring" }}
                  >
                    {showEmoji.emoji}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Player's hand */}
            <motion.div
              className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg max-w-[90vw] w-full"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {viewingPlayerId !== 1 ? (
                <div className="flex flex-col items-center">
                  <p className="text-sm mb-2">Viewing {players.find((p) => p.id === viewingPlayerId)?.name}'s hand</p>
                  <Button size="sm" onClick={() => setViewingPlayerId(1)}>
                    Back to Your Hand
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSortedHand(!sortedHand)}
                        className="flex items-center gap-1"
                      >
                        <SortDesc size={14} />
                        {sortedHand ? "Unsort" : "Sort Cards"}
                      </Button>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowHint(!showHint)}
                              className="flex items-center gap-1"
                            >
                              <Lightbulb size={14} />
                              Hint
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Highlight playable cards</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="flex items-center gap-1">
                            <MessageSquare size={14} />
                            Emojis
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Send Emoji Reaction</DialogTitle>
                          </DialogHeader>
                          <div className="grid grid-cols-5 gap-2 py-4">
                            {emojis.map((emoji) => (
                              <Button
                                key={emoji}
                                variant="outline"
                                className="text-xl h-10"
                                onClick={() => {
                                  sendEmoji(emoji)
                                }}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="overflow-x-auto pb-2 max-w-full">
                    <div className="flex gap-2 min-w-min" style={{ width: "max-content" }}>
                      <AnimatePresence>
                        {sortCards(players.find((p) => p.isHuman)?.cards || []).map((card) => {
                          const isPlayable =
                            !topCard ||
                            card.type === "wild" ||
                            card.type === "special" ||
                            topCard.color === card.color ||
                            currentColor === card.color ||
                            topCard.value === card.value

                          return (
                            <motion.div
                              key={card.id}
                              className={`transform hover:-translate-y-2 transition-transform flex-shrink-0 ${
                                showHint && isPlayable ? "ring-2 ring-yellow-400 ring-offset-2" : ""
                              }`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              whileHover={{ y: -8 }}
                              transition={{ duration: 0.2 }}
                            >
                              <UnoCardComponent
                                card={card}
                                onClick={() => playCard(card)}
                                disabled={!(currentPlayer?.isHuman && currentPlayer?.isCurrentTurn) || !!winner}
                              />
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  </div>
                </>
              )}

              {/* Show other player's cards if viewing them */}
              {viewingPlayerId !== 1 && (
                <div className="overflow-x-auto pb-2 mt-4 max-w-full">
                  <div className="flex gap-2 min-w-min" style={{ width: "max-content" }}>
                    <AnimatePresence>
                      {players
                        .find((p) => p.id === viewingPlayerId)
                        ?.cards.map((card) => (
                          <motion.div
                            key={card.id}
                            className="opacity-80 flex-shrink-0"
                            initial={{ rotateY: 180, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 0.8 }}
                            exit={{ rotateY: 180, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <UnoCardComponent card={card} onClick={() => {}} disabled={true} />
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Game controls */}
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
                  variant="outline"
                  disabled={
                    !(
                      currentPlayer?.isHuman &&
                      currentPlayer?.isCurrentTurn &&
                      players.find((p) => p.isHuman)?.cards.length === 1
                    ) || !!winner
                  }
                  onClick={() => callUno("You")}
                  className="relative overflow-hidden"
                >
                  <motion.span
                    className="absolute inset-0 bg-yellow-400"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1.5 }}
                    transition={{ duration: 0.5 }}
                    style={{ opacity: 0.2, borderRadius: "100%" }}
                  />
                  Call UNO!
                </Button>
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

                    <Tabs defaultValue="rules">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="rules">Rules</TabsTrigger>
                        <TabsTrigger value="display">Display</TabsTrigger>
                      </TabsList>

                      <TabsContent value="rules" className="space-y-2">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="stacking-toggle-dialog" className="text-sm">
                              Stacking (+2/+4):
                            </Label>
                            <Switch
                              id="stacking-toggle-dialog"
                              checked={gameSettings.stackingEnabled}
                              onCheckedChange={(checked) =>
                                setGameSettings({ ...gameSettings, stackingEnabled: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="jumpin-toggle-dialog" className="text-sm">
                              Jump-In Rule:
                            </Label>
                            <Switch
                              id="jumpin-toggle-dialog"
                              checked={gameSettings.jumpInEnabled}
                              onCheckedChange={(checked) =>
                                setGameSettings({ ...gameSettings, jumpInEnabled: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="drawuntil-toggle-dialog" className="text-sm">
                              Draw Until Match:
                            </Label>
                            <Switch
                              id="drawuntil-toggle-dialog"
                              checked={gameSettings.drawUntilMatch}
                              onCheckedChange={(checked) =>
                                setGameSettings({ ...gameSettings, drawUntilMatch: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="forceplay-toggle-dialog" className="text-sm">
                              Force Play:
                            </Label>
                            <Switch
                              id="forceplay-toggle-dialog"
                              checked={gameSettings.forcePlay}
                              onCheckedChange={(checked) => setGameSettings({ ...gameSettings, forcePlay: checked })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="seveno-toggle-dialog" className="text-sm">
                              Seven-O Rule:
                            </Label>
                            <Switch
                              id="seveno-toggle-dialog"
                              checked={gameSettings.sevenORule}
                              onCheckedChange={(checked) => setGameSettings({ ...gameSettings, sevenORule: checked })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="blank-toggle-dialog" className="text-sm">
                              Blank Cards:
                            </Label>
                            <Switch
                              id="blank-toggle-dialog"
                              checked={gameSettings.blankCards}
                              onCheckedChange={(checked) => setGameSettings({ ...gameSettings, blankCards: checked })}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="swap-toggle-dialog" className="text-sm">
                              Swap Hands Card:
                            </Label>
                            <Switch
                              id="swap-toggle-dialog"
                              checked={gameSettings.specialSwapHands}
                              onCheckedChange={(checked) =>
                                setGameSettings({ ...gameSettings, specialSwapHands: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="challenge-toggle-dialog" className="text-sm">
                              Challenge Rule:
                            </Label>
                            <Switch
                              id="challenge-toggle-dialog"
                              checked={gameSettings.challengeRule}
                              onCheckedChange={(checked) =>
                                setGameSettings({ ...gameSettings, challengeRule: checked })
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="playdrawn-toggle-dialog" className="text-sm">
                              Play Drawn Card:
                            </Label>
                            <Switch
                              id="playdrawn-toggle-dialog"
                              checked={gameSettings.playDrawnCard}
                              onCheckedChange={(checked) =>
                                setGameSettings({ ...gameSettings, playDrawnCard: checked })
                              }
                            />
                          </div>
                        </div>
                      </TabsContent>

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

                        <div className="flex items-center gap-4 mt-2">
                          <Label htmlFor="game-speed" className="text-sm">
                            Game Speed:
                          </Label>
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
                    </Tabs>
                  </DialogContent>
                </Dialog>

                <Button size="sm" variant="destructive" onClick={resetGame}>
                  Exit
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Current player indicator and scoreboard */}
          <motion.div
            className="absolute top-2 left-2"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-2">
              <div className="flex flex-col gap-2">
                <p className="text-sm">
                  Current Turn: <span className="font-medium">{currentPlayer?.name}</span>
                  {currentPlayer?.isHuman ? " (You)" : ""}
                </p>

                {showScoreboard && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="font-medium">Scores</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowScoreboard(!showScoreboard)}
                      >
                        <ChevronUp size={14} />
                      </Button>
                    </div>

                    <div className="text-xs space-y-1 max-h-24 overflow-y-auto">
                      {Object.entries(scores).map(([name, score]) => (
                        <div key={name} className="flex justify-between">
                          <span>{name}</span>
                          <span className="font-medium">{score}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {!showScoreboard && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-full p-0 flex justify-between items-center"
                    onClick={() => setShowScoreboard(!showScoreboard)}
                  >
                    <div className="flex items-center gap-1 text-sm">
                      <Trophy size={14} className="text-yellow-500" />
                      <span className="font-medium">Scores</span>
                    </div>
                    <ChevronDown size={14} />
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Game log */}
          {showGameLog && (
            <motion.div
              className="absolute bottom-[35%] left-2 w-64"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-sm">
                    <History size={14} />
                    <span className="font-medium">Game Log</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowGameLog(false)}>
                    <ChevronUp size={14} />
                  </Button>
                </div>

                <ScrollArea className="h-32" ref={gameLogRef}>
                  <div className="text-xs space-y-1 pr-4">
                    {gameLog.map((log, index) => (
                      <div key={index} className="py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        {log}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </motion.div>
          )}

          {!showGameLog && (
            <motion.div
              className="absolute bottom-[35%] left-2"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => setShowGameLog(true)}
              >
                <History size={14} />
                Game Log
              </Button>
            </motion.div>
          )}

          {/* UNO call animation */}
          <AnimatePresence>
            {showUnoCall && (
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 10 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                <div className="text-6xl font-bold text-red-600 bg-yellow-400 px-8 py-4 rounded-lg shadow-lg border-4 border-white transform -rotate-6">
                  UNO!
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wild card color picker */}
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
                  initial={{ scale: 0.8, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.8, y: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold mb-4 text-center">Choose a color</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      className="w-16 h-16 bg-red-600 rounded-lg shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectWildColor("red")}
                    />
                    <motion.button
                      className="w-16 h-16 bg-blue-600 rounded-lg shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectWildColor("blue")}
                    />
                    <motion.button
                      className="w-16 h-16 bg-green-600 rounded-lg shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectWildColor("green")}
                    />
                    <motion.button
                      className="w-16 h-16 bg-yellow-500 rounded-lg shadow-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectWildColor("yellow")}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Winner animation */}
          <AnimatePresence>
            {winner && (
              <motion.div
                className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center"
                  initial={{ scale: 0, y: 50 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: 50 }}
                  transition={{ duration: 0.5 }}
                >
                  <h2 className="text-2xl font-bold mb-4">{winner.isHuman ? "You Win!" : `${winner.name} Wins!`}</h2>
                  <p className="mb-6">
                    {winner.isHuman
                      ? "Congratulations! You've won the game!"
                      : `${winner.name} has played all their cards!`}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={playAgain}>Play Again</Button>
                    <Button variant="outline" onClick={resetGame}>
                      Back to Lobby
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

