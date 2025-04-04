export type CardColor = "red" | "blue" | "green" | "yellow" | "wild"
export type CardValue = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "skip" | "reverse" | "draw2" | "wild" | "wild4"
export type CardType = "number" | "action" | "wild" | "special"

export interface Card {
    id: string
    color: CardColor
    value: CardValue
    type: CardType
}

export interface Player {
    id: number
    name: string
    cards: Card[]
    isHuman: boolean
    score: number
    isCurrentTurn: boolean
}

export interface GameSettings {
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
    showScoreboard: boolean
    showGameLog: boolean
    showHints: boolean
    sortCards: boolean
}

export type AnimationState = {
    type: "playCard" | "drawCard" | null;
    playerId?: number;
    card?: Card;
} 