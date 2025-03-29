export interface Card {
  id: number
  color: "red" | "blue" | "green" | "yellow" | "wild"
  value: string
  type: "number" | "action" | "wild" | "special"
}

export interface Player {
  id: number
  name: string
  cards: Card[]
  isCurrentTurn: boolean
  isHuman?: boolean
}

export interface AnimationState {
  type: "playCard" | "drawCard" | null
  playerId?: number
  card?: Card
}

