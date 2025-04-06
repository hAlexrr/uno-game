"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import type { Card as UnoCard, Player, AnimationState, GameState } from "@/lib/types"
import {
  initializeSocket,
  createGame,
  joinGame,
  startGame,
  playCard,
  selectColor,
  drawCard,
  endTurn,
  callUno,
  sendEmoji,
  playAgain,
  updateGameSettings,
  callUnoOnPlayer,
  sendChatMessage,
  drawAgain,
} from "@/lib/socket-client"
import type { Socket } from "socket.io-client"
import confetti from "canvas-confetti"

type MultiplayerContextType = {
  isConnected: boolean
  roomCode: string | null
  playerId: string | null
  gameState: GameState | null
  playerName: string
  setPlayerName: (value: string) => void
  isJoining: boolean
  joinError: string | null
  animation: AnimationState
  showUnoCall: boolean
  winner: Player | null
  soundEnabled: boolean
  setSoundEnabled: (value: boolean) => void
  soundVolume: number
  setSoundVolume: (value: number) => void
  viewingPlayerId: string | null
  setViewingPlayerId: (value: string | null) => void
  showColorPicker: boolean
  pendingCardId: number | null
  showHint: boolean
  setShowHint: (value: boolean) => void
  sortedHand: boolean
  setSortedHand: (value: boolean) => void
  showScoreboard: boolean
  setShowScoreboard: (value: boolean) => void
  gameLog: string[]
  showGameLog: boolean
  setShowGameLog: (value: boolean) => void
  lastAction: string
  showEmoji: { emoji: string; playerId: string } | null
  gameLogRef: React.RefObject<HTMLDivElement>
  createNewGame: () => Promise<void>
  joinExistingGame: (roomCode: string) => Promise<void>
  startTheGame: () => void
  playACard: (card: UnoCard) => void
  selectWildColor: (color: "red" | "blue" | "green" | "yellow") => void
  drawACard: () => void
  callUnoAction: () => void
  viewPlayerHand: (playerId: string) => void
  sendEmojiReaction: (emoji: string) => void
  playAgainAction: () => void
  resetGame: () => void
  playSound: (sound: string) => void
  getPlayerPositions: () => { player: Player; x: number; y: number }[]
  getColorClass: (color: string | null) => string
  sortCards: (cards: UnoCard[]) => UnoCard[]
  getPlayableCards: () => UnoCard[]
  isCurrentPlayerTurn: () => boolean
  updateGameSettings: (settings: {
    stackingEnabled?: boolean
    jumpInEnabled?: boolean
    drawUntilMatch?: boolean
    forcePlay?: boolean
    sevenORule?: boolean
    blankCards?: boolean
    challengeRule?: boolean
    playDrawnCard?: boolean
    specialSwapHands?: boolean
    gameSpeed?: "slow" | "normal" | "fast"
  }) => void
  callUnoOnPlayerAction: (targetPlayerId: string) => void
  chatMessages: Array<{
    playerId: string
    playerName: string
    message: string
    timestamp: string
  }>
  sendChatMessage: (message: string) => void
  showChat: boolean
  setShowChat: (value: boolean) => void
  endTurn: (roomCode: string) => void
  drawAgain: (roomCode: string) => void
  botCount: number
  setBotCount: (value: number) => void
  botDifficulty: "easy" | "medium" | "hard"
  setBotDifficulty: (value: "easy" | "medium" | "hard") => void
  addBot: () => void
  removeBot: (botId: string) => void
  cardTheme: string
  setCardTheme: (value: string) => void
  cardBack: string
  setCardBack: (value: string) => void
  cardAnimations: Array<{
    id: string
    type: "play" | "draw"
    card?: UnoCard
    startX: number
    startY: number
    endX: number
    endY: number
  }>
  removeCardAnimation: (id: string) => void
  isTournamentActive: boolean
  tournamentRound: number
  tournamentMatches: Array<{
    player1: Player
    player2: Player
    winner: Player | null
    isActive: boolean
  }>
  startTournament: (playerCount: number) => void
  allowViewingHands: boolean
  setAllowViewingHands: (value: boolean) => void
  triggerBotTurn: () => void
  showAlert: boolean
  setShowAlert: (value: boolean) => void
  alertMessage: string
  setAlertMessage: (value: string) => void
  showConfirm: boolean
  setShowConfirm: (value: boolean) => void
  confirmMessage: string
  setConfirmMessage: (value: string) => void
  confirmCallback: () => void
  setConfirmCallback: (value: () => void) => void
  confirmTitle: string
  setConfirmTitle: (value: string) => void
  showCustomAlert: (message: string) => void
  gameStats: {
    rounds: number
    cardsPlayed: number
    specialCardsPlayed: number
    mostCardsHeld: number
    longestTurn: number
    drawCardCount: number
  }
  isHost: boolean
}

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined)

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [roomCode, setRoomCode] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerName, setPlayerName] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [animation, setAnimation] = useState<AnimationState>({ type: null })
  const [showUnoCall, setShowUnoCall] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(0.5)
  const [viewingPlayerId, setViewingPlayerId] = useState<string | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [pendingCardId, setPendingCardId] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [sortedHand, setSortedHand] = useState(false)
  const [showScoreboard, setShowScoreboard] = useState(true)
  const [gameLog, setGameLog] = useState<string[]>([])
  const [showGameLog, setShowGameLog] = useState(false)
  const [lastAction, setLastAction] = useState<string>("")
  const [showEmoji, setShowEmoji] = useState<{ emoji: string; playerId: string } | null>(null)
  const [chatMessages, setChatMessages] = useState<
    Array<{
      playerId: string
      playerName: string
      message: string
      timestamp: string
    }>
  >([])
  const [showChat, setShowChat] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [botCount, setBotCount] = useState(0)
  const [botDifficulty, setBotDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [cardTheme, setCardTheme] = useState("classic")
  const [cardBack, setCardBack] = useState("classic")
  const [cardAnimations, setCardAnimations] = useState<
    Array<{
      id: string
      type: "play" | "draw"
      card?: UnoCard
      startX: number
      startY: number
      endX: number
      endY: number
    }>
  >([])
  const [isTournamentActive, setIsTournamentActive] = useState(false)
  const [tournamentRound, setTournamentRound] = useState(1)
  const [tournamentMatches, setTournamentMatches] = useState<
    Array<{
      player1: Player
      player2: Player
      winner: Player | null
      isActive: boolean
    }>
  >([])
  const [allowViewingHands, setAllowViewingHands] = useState(true)

  // Add these state variables to the MultiplayerProvider component
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {})
  const [confirmTitle, setConfirmTitle] = useState("")

  // Game statistics
  const [gameStats, setGameStats] = useState({
    rounds: 0,
    cardsPlayed: 0,
    specialCardsPlayed: 0,
    mostCardsHeld: 0,
    longestTurn: 0,
    drawCardCount: 0,
  })

  // Add this at the top of the component:
  const previousGameState = useRef<GameState | null>(null)

  // Ref for game log scroll
  const gameLogRef = useRef<HTMLDivElement>(null)

  // Initialize socket connection
  useEffect(() => {
    try {
      const newSocket = initializeSocket()
      setSocket(newSocket)

      const handleConnect = () => {
        console.log("Socket connected successfully")
        setIsConnected(true)
      }

      const handleDisconnect = () => {
        console.log("Socket disconnected")
        setIsConnected(false)
      }

      const handleError = (error: Error) => {
        console.error("Socket error:", error)
      }

      newSocket.on("connect", handleConnect)
      newSocket.on("disconnect", handleDisconnect)
      newSocket.on("error", handleError)

      return () => {
        newSocket.off("connect", handleConnect)
        newSocket.off("disconnect", handleDisconnect)
        newSocket.off("error", handleError)
      }
    } catch (error) {
      console.error("Failed to initialize socket:", error)
    }
  }, [])

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return

    // Game state update
    const handleGameStateUpdate = (newGameState: GameState) => {
      console.log("Received game state update:", newGameState)

      // Update game stats
      if (previousGameState.current && newGameState) {
        // Count cards played
        if (previousGameState.current.topCard?.id !== newGameState.topCard?.id) {
          setGameStats((prev) => ({
            ...prev,
            cardsPlayed: prev.cardsPlayed + 1,
            specialCardsPlayed:
              prev.specialCardsPlayed +
              (newGameState.topCard?.type === "action" || newGameState.topCard?.type === "wild" ? 1 : 0),
          }))
        }

        // Track most cards held
        const maxCards = Math.max(...newGameState.players.map((p) => p.cards.length))
        if (maxCards > gameStats.mostCardsHeld) {
          setGameStats((prev) => ({
            ...prev,
            mostCardsHeld: maxCards,
          }))
        }

        // Track draw card count
        if (newGameState.deck.length < previousGameState.current.deck.length) {
          setGameStats((prev) => ({
            ...prev,
            drawCardCount: prev.drawCardCount + 1,
          }))
        }

        // Track rounds
        if (previousGameState.current.currentPlayerId !== newGameState.currentPlayerId) {
          setGameStats((prev) => ({
            ...prev,
            rounds: prev.rounds + 1,
          }))
        }
      }

      setGameState(newGameState)

      // Set viewing to own player ID if not set
      if (!viewingPlayerId && playerId) {
        setViewingPlayerId(playerId)
      }
    }

    // Game log
    const handleGameLog = (message: string) => {
      addToGameLog(message)
    }

    // UNO call
    const handleUnoCalled = (data: { playerId: string; playerName: string }) => {
      playSound("uno")
      setShowUnoCall(true)

      setTimeout(() => {
        setShowUnoCall(false)
      }, 2000)
    }

    // Winner
    const handleGameWinner = (data: { playerId: string; playerName: string }) => {
      const winningPlayer = gameState?.players.find((p) => p.id === data.playerId) || null
      setWinner(winningPlayer)
      playSound("win")

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }

    // Emoji reaction
    const handleEmojiReaction = (data: { playerId: string; emoji: string }) => {
      setShowEmoji({ emoji: data.emoji, playerId: data.playerId })

      setTimeout(() => {
        setShowEmoji(null)
      }, 2000)
    }

    // Select color
    const handleSelectColor = (data: { cardId: number }) => {
      setPendingCardId(data.cardId)
      setShowColorPicker(true)
    }

    // Replace the browser alerts with custom alerts
    // Update the handleCanPlayDrawnCard function
    const handleCanPlayDrawnCard = (data: { cardId: number }) => {
      const player = gameState?.players.find((p) => p.id === playerId)
      if (!player) return

      const card = player.cards.find((c) => c.id === data.cardId)
      if (!card) return

      setConfirmTitle("Play Drawn Card")
      setConfirmMessage(`You drew a ${card.color} ${card.value}. Do you want to play it?`)
      setConfirmCallback(() => {
        if (card) {
          playACard(card)
        }
      })
      setShowConfirm(true)
    }

    // Update the handleDrawAgain function
    const handleDrawAgain = () => {
      if (roomCode) {
        setConfirmTitle("Draw Again")
        setConfirmMessage("No playable card. Draw again?")
        setConfirmCallback(() => {
          drawAgain(roomCode)
        })
        setShowConfirm(true)
      }
    }

    // Game error
    const handleGameError = (error: string) => {
      console.error("Game error:", error)
      setJoinError(error)
    }

    // Player joined
    const handlePlayerJoined = (data: { playerName: string; playerId: string }) => {
      console.log(`Player ${data.playerName} joined the game`)
    }

    // Game joined
    const handleGameJoined = (data: { roomCode: string; playerId: string }) => {
      console.log(`Joined game with room code ${data.roomCode}`)
    }

    // Chat message
    const handleChatMessage = (data: {
      playerId: string
      playerName: string
      message: string
      timestamp: string
    }) => {
      setChatMessages((prev) => [...prev, data])

      // Play a notification sound
      playSound("card")
    }

    // Draw again (for draw until match)

    socket.on("game_state_update", handleGameStateUpdate)
    socket.on("game_log", handleGameLog)
    socket.on("uno_called", handleUnoCalled)
    socket.on("game_winner", handleGameWinner)
    socket.on("emoji_reaction", handleEmojiReaction)
    socket.on("select_color", handleSelectColor)
    socket.on("can_play_drawn_card", handleCanPlayDrawnCard)
    socket.on("game_error", handleGameError)
    socket.on("player_joined", handlePlayerJoined)
    socket.on("game_joined", handleGameJoined)
    socket.on("chat_message", handleChatMessage)
    socket.on("draw_again", handleDrawAgain)

    return () => {
      socket.off("game_state_update", handleGameStateUpdate)
      socket.off("game_log", handleGameLog)
      socket.off("uno_called", handleUnoCalled)
      socket.off("game_winner", handleGameWinner)
      socket.off("emoji_reaction", handleEmojiReaction)
      socket.off("select_color", handleSelectColor)
      socket.off("can_play_drawn_card", handleCanPlayDrawnCard)
      socket.off("game_error", handleGameError)
      socket.off("player_joined", handlePlayerJoined)
      socket.off("game_joined", handleGameJoined)
      socket.off("chat_message", handleChatMessage)
      socket.off("draw_again", handleDrawAgain)
    }
  }, [socket, gameState, playerId, viewingPlayerId, roomCode, gameStats])

  // Inside the MultiplayerProvider component, add a function to explain rule effects:

  // Add this function to explain rule effects when they happen
  const explainRuleEffect = (ruleName: string, effect: string) => {
    addToGameLog(`[Rule Effect] ${ruleName}: ${effect}`)
  }

  // Then, when handling game state updates, add this to detect Seven-O rule effects:
  useEffect(() => {
    if (!gameState || !previousGameState.current) return

    // Check for Seven-O rule effects
    if (gameState.gameSettings.sevenORule) {
      // Check if a 7 was just played (by comparing top cards)
      if (
        gameState.topCard &&
        previousGameState.current.topCard &&
        gameState.topCard.value === "7" &&
        gameState.topCard.id !== previousGameState.current.topCard.id
      ) {
        explainRuleEffect("Seven-O Rule", "When a 7 is played, the player swaps hands with another player")
      }

      // Check if a 0 was just played
      if (
        gameState.topCard &&
        previousGameState.current.topCard &&
        gameState.topCard.value === "0" &&
        gameState.topCard.id !== previousGameState.current.topCard.id
      ) {
        explainRuleEffect("Seven-O Rule", "When a 0 is played, all players pass their hands to the next player")
      }
    }

    // Update previous game state
    previousGameState.current = gameState
  }, [gameState])

  // Scroll game log to bottom when new entries are added
  useEffect(() => {
    if (gameLogRef.current) {
      gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight
    }
  }, [gameLog])

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

  // Create a new game
  const createNewGame = async () => {
    if (!playerName.trim()) return

    setIsJoining(true)
    setJoinError(null)

    try {
      console.log("Creating new game as:", playerName)
      const result = await createGame(playerName)
      console.log("Create game result:", result)

      if (result.success && result.roomCode && result.playerId) {
        setRoomCode(result.roomCode)
        setPlayerId(result.playerId)
        setViewingPlayerId(result.playerId)
        addToGameLog(`Game created with room code: ${result.roomCode}`)
        setIsHost(true)

        // Reset game stats when creating a new game
        setGameStats({
          rounds: 0,
          cardsPlayed: 0,
          specialCardsPlayed: 0,
          mostCardsHeld: 0,
          longestTurn: 0,
          drawCardCount: 0,
        })
      } else {
        setJoinError(result.error || "Failed to create game")
      }
    } catch (error) {
      console.error("Error creating game:", error)
      setJoinError("An error occurred while creating the game")
    } finally {
      setIsJoining(false)
    }
  }

  // Join an existing game
  const joinExistingGame = async (code: string) => {
    if (!playerName.trim()) return

    setIsJoining(true)
    setJoinError(null)

    try {
      console.log(`Joining game ${code} as ${playerName}`)
      const result = await joinGame(code, playerName)
      console.log("Join game result:", result)

      if (result.success && result.roomCode && result.playerId) {
        setRoomCode(result.roomCode)
        setPlayerId(result.playerId)
        setViewingPlayerId(result.playerId)
        addToGameLog(`Joined game with room code: ${result.roomCode}`)
        setIsHost(false)
      } else {
        setJoinError(result.error || "Failed to join game")
      }
    } catch (error) {
      console.error("Error joining game:", error)
      setJoinError("An error occurred while joining the game")
    } finally {
      setIsJoining(false)
    }
  }

  // Start the game
  const startTheGame = () => {
    if (!roomCode) return

    startGame(roomCode)
  }

  // Play a card
  const playACard = (card: UnoCard) => {
    if (!roomCode || !isCurrentPlayerTurn()) return

    // Play card animation
    setAnimation({
      type: "playCard",
      playerId: playerId || undefined,
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

    // Send to server
    playCard(roomCode, card.id)

    // Clear animation after a delay
    setTimeout(() => {
      setAnimation({ type: null })
    }, 500)
  }

  // Select a color for wild cards
  const selectWildColor = (color: "red" | "blue" | "green" | "yellow") => {
    if (!roomCode || !pendingCardId) return

    setShowColorPicker(false)

    // Send to server
    selectColor(roomCode, pendingCardId, color)
    setPendingCardId(null)
  }

  // Draw a card
  const drawACard = () => {
    if (!roomCode || !isCurrentPlayerTurn()) return

    // Draw card animation
    setAnimation({
      type: "drawCard",
      playerId: playerId || undefined,
    })

    // Play sound effect
    playSound("draw")

    // Send to server
    drawCard(roomCode)

    // Clear animation after a delay
    setTimeout(() => {
      setAnimation({ type: null })
    }, 500)
  }

  // Call UNO
  const callUnoAction = () => {
    if (!roomCode) return

    // Check if the player has 1 or 2 cards to allow calling UNO
    const player = gameState?.players.find((p) => p.id === playerId)
    if (player && (player.cards.length === 1 || player.cards.length === 2)) {
      callUno(roomCode)
    } else {
      // Show a custom notification instead of an alert
      addToGameLog("You can only call UNO when you have 1 or 2 cards left!")
    }
  }

  // View another player's hand
  const viewPlayerHand = (id: string) => {
    // Add a flip animation
    playSound("flip")
    setViewingPlayerId(id)
  }

  // Send emoji reaction
  const sendEmojiReaction = (emoji: string) => {
    if (!roomCode) return

    sendEmoji(roomCode, emoji)
  }

  // Play again
  const playAgainAction = () => {
    if (!roomCode) return

    setWinner(null) // Clear the winner state

    if (isHost) {
      playAgain(roomCode)

      // Reset game stats for a new game
      setGameStats({
        rounds: 0,
        cardsPlayed: 0,
        specialCardsPlayed: 0,
        mostCardsHeld: 0,
        longestTurn: 0,
        drawCardCount: 0,
      })
    }
  }

  // Reset game (leave room)
  const resetGame = () => {
    // Notify the server that the player is leaving (if connected)
    if (socket && roomCode && playerId) {
      socket.emit("player_leave", { roomCode, playerId })
    }

    // Reset all local state
    setRoomCode(null)
    setPlayerId(null)
    setGameState(null)
    setWinner(null)
    setViewingPlayerId(null)
    setAnimation({ type: null })
    setGameLog([])
    setChatMessages([])

    // Reset game stats
    setGameStats({
      rounds: 0,
      cardsPlayed: 0,
      specialCardsPlayed: 0,
      mostCardsHeld: 0,
      longestTurn: 0,
      drawCardCount: 0,
    })
  }

  // Calculate positions for players around a virtual table
  const getPlayerPositions = () => {
    if (!gameState || !playerId) return []

    // We'll position the current player at the bottom (not in this array)
    // and distribute the other players in a circular arrangement around the top of the table
    const otherPlayers = gameState.players.filter((p) => p.id !== playerId)
    const positions = []

    // Calculate positions in a circular arrangement
    // We'll use a 200-degree arc (leaving 160 degrees at the bottom for the human player)
    // This is reduced from 240 degrees to avoid players at the bottom corners
    const arcAngle = Math.PI * 1.1 // 200 degrees in radians
    const startAngle = Math.PI - arcAngle / 2 // Start from the left side
    const angleStep = arcAngle / Math.max(1, otherPlayers.length - 1)

    for (let i = 0; i < otherPlayers.length; i++) {
      // Calculate angle (in radians) for this player
      let angle

      if (otherPlayers.length === 1) {
        // If there's only one other player, place it at the top
        angle = Math.PI / 2
      } else {
        angle = startAngle + angleStep * i
      }

      // Calculate position using a circular formula
      // Use a consistent radius to ensure a perfect circle
      const radius = 0.35 // Slightly smaller radius to keep players higher up
      const x = 0.5 + radius * Math.cos(angle)
      const y = 0.4 + radius * Math.sin(angle) // Move players up by setting y center to 0.4 instead of 0.5

      positions.push({
        player: otherPlayers[i],
        x: x * 100, // Convert to percentage
        y: y * 100,
      })
    }

    return positions
  }

  // Get color class for UI
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

  // Sort cards for display
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

  // Get playable cards
  const getPlayableCards = () => {
    if (!gameState || !playerId) return []

    const player = gameState.players.find((p) => p.id === playerId)
    if (!player) return []

    return player.cards.filter(
      (card) =>
        !gameState.topCard ||
        card.type === "wild" ||
        card.type === "special" ||
        gameState.topCard.color === card.color ||
        gameState.currentColor === card.color ||
        gameState.topCard.value === card.value,
    )
  }

  // Check if it's the current player's turn
  const isCurrentPlayerTurn = () => {
    if (!gameState || !playerId) return false
    return gameState.currentPlayerId === playerId
  }

  // Update game settings
  const updateGameSettingsAction = (settings: {
    stackingEnabled?: boolean
    jumpInEnabled?: boolean
    drawUntilMatch?: boolean
    forcePlay?: boolean
    sevenORule?: boolean
    blankCards?: boolean
    challengeRule?: boolean
    playDrawnCard?: boolean
    specialSwapHands?: boolean
    gameSpeed?: "slow" | "normal" | "fast"
  }) => {
    if (!roomCode) return

    updateGameSettings(roomCode, settings)
  }

  // Call UNO on another player
  const callUnoOnPlayerAction = (targetPlayerId: string) => {
    if (!roomCode) return

    callUnoOnPlayer(roomCode, targetPlayerId)
  }

  // Send a chat message
  const sendChatMessageAction = (message: string) => {
    if (!roomCode) return

    sendChatMessage(roomCode, message)
  }

  const endTurnAction = (roomCode: string) => {
    if (!roomCode) return
    endTurn(roomCode)
  }

  const drawAgainAction = (roomCode: string) => {
    if (!roomCode) return
    drawAgain(roomCode)
  }

  // Add a bot to the game
  const addBot = () => {
    if (!roomCode) return

    socket?.emit("add_bot", {
      roomCode,
      difficulty: botDifficulty,
    })
  }

  // Remove a bot from the game
  const removeBot = (botId: string) => {
    if (!roomCode) return

    socket?.emit("remove_bot", {
      roomCode,
      botId,
    })
  }

  // Remove a card animation
  const removeCardAnimation = (id: string) => {
    setCardAnimations((prev) => prev.filter((anim) => anim.id !== id))
  }

  // Start a tournament
  const startTournament = (playerCount: number) => {
    if (!roomCode) return

    socket?.emit("start_tournament", {
      roomCode,
      playerCount,
    })
  }

  // Add this function to the MultiplayerContext
  // Inside the MultiplayerProvider component, add this function:

  // Trigger bot turn manually
  const triggerBotTurn = () => {
    if (!roomCode || !socket) return

    socket.emit("trigger_bot_turn", roomCode)
  }

  // Add a custom alert function
  const showCustomAlert = (message: string) => {
    setAlertMessage(message)
    setShowAlert(true)
  }

  // Add this function to the context value object
  return (
    <MultiplayerContext.Provider
      value={{
        isConnected,
        roomCode,
        playerId,
        gameState,
        playerName,
        setPlayerName,
        isJoining,
        joinError,
        animation,
        showUnoCall,
        winner,
        soundEnabled,
        setSoundEnabled,
        soundVolume,
        setSoundVolume,
        viewingPlayerId,
        setViewingPlayerId,
        showColorPicker,
        pendingCardId,
        showHint,
        setShowHint,
        sortedHand,
        setSortedHand,
        showScoreboard,
        setShowScoreboard,
        gameLog,
        showGameLog,
        setShowGameLog,
        lastAction,
        showEmoji,
        gameLogRef,
        createNewGame,
        joinExistingGame,
        startTheGame,
        playACard,
        selectWildColor,
        drawACard,
        callUnoAction,
        viewPlayerHand,
        sendEmojiReaction,
        playAgainAction,
        resetGame,
        playSound,
        getPlayerPositions,
        getColorClass,
        sortCards,
        getPlayableCards,
        isCurrentPlayerTurn,
        updateGameSettings: updateGameSettingsAction,
        callUnoOnPlayerAction,
        chatMessages,
        sendChatMessage: sendChatMessageAction,
        showChat,
        setShowChat,
        endTurn: endTurnAction,
        drawAgain: drawAgainAction,
        botCount,
        setBotCount,
        botDifficulty,
        setBotDifficulty,
        addBot,
        removeBot,
        cardTheme,
        setCardTheme,
        cardBack,
        setCardBack,
        cardAnimations,
        removeCardAnimation,
        isTournamentActive,
        tournamentRound,
        tournamentMatches,
        startTournament,
        allowViewingHands,
        setAllowViewingHands,
        triggerBotTurn,
        showAlert,
        setShowAlert,
        alertMessage,
        setAlertMessage,
        showConfirm,
        setShowConfirm,
        confirmMessage,
        setConfirmMessage,
        confirmCallback,
        setConfirmCallback,
        confirmTitle,
        setConfirmTitle,
        showCustomAlert,
        gameStats,
        isHost,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  )
}

export function useMultiplayerContext() {
  const context = useContext(MultiplayerContext)
  if (context === undefined) {
    throw new Error("useMultiplayerContext must be used within a MultiplayerProvider")
  }
  return context
}

