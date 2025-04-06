"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { Card as UnoCard, Player, AnimationState } from "@/lib/types"
import { generateRandomCard, generateHand, getNextPlayerId } from "@/lib/game-utils"
import confetti from "canvas-confetti"

type GameContextType = {
  gameStarted: boolean
  setGameStarted: (value: boolean) => void
  playerName: string
  setPlayerName: (value: string) => void
  players: Player[]
  setPlayers: (value: Player[]) => void
  currentPlayer: Player | null
  setCurrentPlayer: (value: Player | null) => void
  topCard: UnoCard | null
  setTopCard: (value: UnoCard | null) => void
  botCount: number
  setBotCount: (value: number) => void
  viewingPlayerId: number | null
  setViewingPlayerId: (value: number | null) => void
  animation: AnimationState
  setAnimation: (value: AnimationState) => void
  showUnoCall: boolean
  setShowUnoCall: (value: boolean) => void
  winner: Player | null
  setWinner: (value: Player | null) => void
  soundEnabled: boolean
  setSoundEnabled: (value: boolean) => void
  soundVolume: number
  setSoundVolume: (value: number) => void
  isShuffling: boolean
  setIsShuffling: (value: boolean) => void
  showColorPicker: boolean
  setShowColorPicker: (value: boolean) => void
  currentColor: "red" | "blue" | "green" | "yellow" | null
  setCurrentColor: (value: "red" | "blue" | "green" | "yellow" | null) => void
  pendingWildCard: UnoCard | null
  setPendingWildCard: (value: UnoCard | null) => void
  scores: Record<string, number>
  setScores: (value: Record<string, number>) => void
  botDifficulty: "easy" | "medium" | "hard"
  setBotDifficulty: (value: "easy" | "medium" | "hard") => void
  turnTimer: number | null
  setTurnTimer: (value: number | null) => void
  showHint: boolean
  setShowHint: (value: boolean) => void
  cardsRemaining: number
  setCardsRemaining: (value: number) => void
  sortedHand: boolean
  setSortedHand: (value: boolean) => void
  showScoreboard: boolean
  setShowScoreboard: (value: boolean) => void
  gameLog: string[]
  setGameLog: (value: string[]) => void
  showGameLog: boolean
  setShowGameLog: (value: boolean) => void
  lastAction: string
  setLastAction: (value: string) => void
  showEmoji: { emoji: string; playerId: number } | null
  setShowEmoji: (value: { emoji: string; playerId: number } | null) => void
  gameSettings: {
    stackingEnabled: boolean
    jumpInEnabled: boolean
    drawUntilMatch: boolean
    forcePlay: boolean
    sevenORule: boolean
    blankCards: boolean
    challengeRule: boolean
    playDrawnCard: boolean
    specialSwapHands: boolean
    gameSpeed: "slow" | "normal" | "fast"
  }
  setGameSettings: (value: {
    stackingEnabled: boolean
    jumpInEnabled: boolean
    drawUntilMatch: boolean
    forcePlay: boolean
    sevenORule: boolean
    blankCards: boolean
    challengeRule: boolean
    playDrawnCard: boolean
    specialSwapHands: boolean
    gameSpeed: "slow" | "normal" | "fast"
  }) => void
  gameLogRef: React.RefObject<HTMLDivElement>
  playSound: (sound: string) => void
  addToGameLog: (message: string) => void
  joinGame: () => void
  addBots: () => void
  startGame: () => void
  playCard: (card: UnoCard, playerId?: number) => boolean
  selectWildColor: (color: "red" | "blue" | "green" | "yellow") => void
  simulateBotTurn: (bot: Player) => void
  drawCard: (playerId?: number) => void
  viewPlayerHand: (playerId: number) => void
  callUno: (playerName: string) => void
  resetGame: () => void
  playAgain: () => void
  showEmojiReaction: (emoji: string, playerId: number) => void
  getPlayerPositions: () => { player: Player; x: number; y: number }[]
  getColorClass: (color: string | null) => string
  sortCards: (cards: UnoCard[]) => UnoCard[]
  getPlayableCards: () => UnoCard[]
  sendEmoji: (emoji: string) => void
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
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
      const initialCard = generateRandomCard(gameSettings)
      // Make sure the initial card is not a wild card or special card
      if (initialCard.type === "wild" || initialCard.type === "special") {
        initialCard.color = ["red", "blue", "green", "yellow"][Math.floor(Math.random() * 4)] as
          | "red"
          | "blue"
          | "green"
          | "yellow"
        initialCard.type = "number"
        initialCard.value = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"][Math.floor(Math.random() * 9)] // Only use number cards
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
    if (!currentPlayer) return false

    const playerToPlay = playerId || currentPlayer.id
    const player = players.find((p) => p.id === playerToPlay)
    if (!player) return false

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
        const nextPlayerId = getNextPlayerId(playerToPlay, updatedPlayers)
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
      const randomColor = ["red", "blue", "green", "yellow"][Math.floor(Math.random() * 4)] as
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
      if (card.value === "skip" && p.id === getNextPlayerId(playerToPlay, players)) {
        addToGameLog(`${p.name} was skipped!`)
        return {
          ...p,
          isCurrentTurn: false,
        }
      }

      if (card.value === "reverse") {
        addToGameLog("Direction reversed!")
        // In a 2-player game, reverse acts like skip
        if (players.length === 2 && p.id === getNextPlayerId(playerToPlay, players)) {
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
          const nextPlayerId = getNextPlayerId(playerToPlay, players)
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
      const nextPlayerId = getNextPlayerId(playerToPlay, players)
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

      const nextPlayer = updatedPlayers.find((p) => p.id === getNextPlayerId(playerToPlay, updatedPlayers)) || null
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
        const emojis = ["👍", "👎", "😂", "😢", "😡", "🎉", "🤔", "🙄", "🤯", "🔥"]
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

    const newCard = generateRandomCard(gameSettings)

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
          const nextPlayerId = getNextPlayerId(playerToDraw, updatedPlayers)
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
          const nextPlayerId = getNextPlayerId(playerToDraw, updatedPlayers)
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
      const initialCard = generateRandomCard(gameSettings)
      // Make sure the initial card is not a wild card
      if (initialCard.type === "wild" || initialCard.type === "special") {
        initialCard.color = ["red", "blue", "green", "yellow"][Math.floor(Math.random() * 4)] as
          | "red"
          | "blue"
          | "green"
          | "yellow"
        initialCard.type = "number"
        initialCard.value = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"][Math.floor(Math.random() * 9)] // Only use number cards
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
    <GameContext.Provider
      value={{
        gameStarted,
        setGameStarted,
        playerName,
        setPlayerName,
        players,
        setPlayers,
        currentPlayer,
        setCurrentPlayer,
        topCard,
        setTopCard,
        botCount,
        setBotCount,
        viewingPlayerId,
        setViewingPlayerId,
        animation,
        setAnimation,
        showUnoCall,
        setShowUnoCall,
        winner,
        setWinner,
        soundEnabled,
        setSoundEnabled,
        soundVolume,
        setSoundVolume,
        isShuffling,
        setIsShuffling,
        showColorPicker,
        setShowColorPicker,
        currentColor,
        setCurrentColor,
        pendingWildCard,
        setPendingWildCard,
        scores,
        setScores,
        botDifficulty,
        setBotDifficulty,
        turnTimer,
        setTurnTimer,
        showHint,
        setShowHint,
        cardsRemaining,
        setCardsRemaining,
        sortedHand,
        setSortedHand,
        showScoreboard,
        setShowScoreboard,
        gameLog,
        setGameLog,
        showGameLog,
        setShowGameLog,
        lastAction,
        setLastAction,
        showEmoji,
        setShowEmoji,
        gameSettings,
        setGameSettings,
        gameLogRef,
        playSound,
        addToGameLog,
        joinGame,
        addBots,
        startGame,
        playCard,
        selectWildColor,
        simulateBotTurn,
        drawCard,
        viewPlayerHand,
        callUno,
        resetGame,
        playAgain,
        showEmojiReaction,
        getPlayerPositions,
        getColorClass,
        sortCards,
        getPlayableCards,
        sendEmoji,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGameContext() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider")
  }
  return context
}

