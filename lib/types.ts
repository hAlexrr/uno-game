export interface Card {
  id: number
  color: "red" | "blue" | "green" | "yellow" | "wild"
  value: string
  type: "number" | "action" | "wild" | "special"
}

export interface Player {
  id: string
  name: string
  cards: Card[]
  isCurrentTurn: boolean
  isHuman?: boolean
  isHost?: boolean
}

export interface AnimationState {
  type: "playCard" | "drawCard" | null
  playerId?: string
  card?: Card
}

export interface GameState {
  roomCode: string
  players: Player[]
  gameStarted: boolean
  topCard: Card | null
  currentColor: "red" | "blue" | "green" | "yellow" | null
  currentPlayerId: string | null
  cardsRemaining: number
  direction: number // 1 for clockwise, -1 for counter-clockwise
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
  scores: Record<string, number>
}

