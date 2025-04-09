import { io, type Socket } from "socket.io-client"

// Socket.io client instance
let socket: Socket | null = null

// Initialize the socket connection
export function initializeSocket(): Socket {
  if (!socket) {
    // For development, use a fixed URL
    const serverUrl = "http://50.116.25.123:3000"

    socket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000, // Increase timeout to 10 seconds
    })

    socket.on("connect", () => {
      console.log("Connected to WebSocket server")
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server")
    })

    socket.on("connect_error", (err) => {
      console.error("Connection error:", err)
    })
  }

  return socket
}

// Get the socket instance
export function getSocket(): Socket | null {
  return socket
}

// Create a new game room
export function createGame(
  playerName: string,
): Promise<{ success: boolean; roomCode?: string; playerId?: string; error?: string }> {
  return new Promise((resolve) => {
    const socket = getSocket()
    if (!socket) {
      resolve({ success: false, error: "Socket not connected" })
      return
    }

    socket.emit(
      "create_game",
      playerName,
      (response: { success: boolean; roomCode?: string; playerId?: string; error?: string }) => {
        resolve(response)
      },
    )
  })
}

// Join an existing game room
export function joinGame(
  roomCode: string,
  playerName: string,
): Promise<{ success: boolean; roomCode?: string; playerId?: string; error?: string }> {
  return new Promise((resolve) => {
    const socket = getSocket()
    if (!socket) {
      resolve({ success: false, error: "Socket not connected" })
      return
    }

    console.log(`Attempting to join room ${roomCode} as ${playerName}`)

    socket.emit(
      "join_game",
      { roomCode, playerName },
      (response: { success: boolean; roomCode?: string; playerId?: string; error?: string }) => {
        console.log("Join game response:", response)
        resolve(response)
      },
    )
  })
}

// Start the game
export function startGame(roomCode: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("start_game", roomCode)
}

// Play a card
export function playCard(roomCode: string, cardId: number): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("play_card", { roomCode, cardId })
}

// Select a color for wild cards
export function selectColor(roomCode: string, cardId: number, color: "red" | "blue" | "green" | "yellow"): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("select_color", { roomCode, cardId, color })
}

// Draw a card
export function drawCard(roomCode: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("draw_card", roomCode)
}

// Draw again (for draw until match)
export function drawAgain(roomCode: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("draw_again", roomCode)
}

// End turn (after drawing a card and not playing it)
export function endTurn(roomCode: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("end_turn", roomCode)
}

// Call UNO
export function callUno(roomCode: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("call_uno", roomCode)
}

// Call UNO on another player
export function callUnoOnPlayer(roomCode: string, targetPlayerId: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("call_uno_on_player", { roomCode, targetPlayerId })
}

// Send emoji reaction
export function sendEmoji(roomCode: string, emoji: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("send_emoji", { roomCode, emoji })
}

// Play again
export function playAgain(roomCode: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("play_again", roomCode)
}

// Update game settings
export function updateGameSettings(
  roomCode: string,
  settings: {
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
  },
): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("update_game_settings", { roomCode, settings })
}

// Send a chat message
export function sendChatMessage(roomCode: string, message: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("send_chat_message", { roomCode, message })
}

// Trigger a bot turn manually (for testing)
export function triggerBotTurn(roomCode: string): void {
  const socket = getSocket()
  if (!socket) return

  socket.emit("trigger_bot_turn", { roomCode })
}

