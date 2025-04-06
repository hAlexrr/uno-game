import type { Card as UnoCard, Player } from "@/lib/types"

// Card colors and values
export const cardColors = ["red", "blue", "green", "yellow"]
export const cardValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"]
export const wildCards = ["wild", "wild4"]
export const emojis = ["👍", "👎", "😂", "😢", "😡", "🎉", "🤔", "🙄", "🤯", "🔥"]

export function generateRandomCard(gameSettings: {
  specialSwapHands: boolean
  blankCards: boolean
}): UnoCard {
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

export function generateHand(count = 7): UnoCard[] {
  const hand: UnoCard[] = []
  for (let i = 0; i < count; i++) {
    hand.push(generateRandomCard({ specialSwapHands: false, blankCards: false }))
  }
  return hand
}

export function getNextPlayerId(currentId: number, players: Player[]): number {
  // Simple implementation - just go to the next player in order
  const currentIndex = players.findIndex((p) => p.id === currentId)
  const nextIndex = (currentIndex + 1) % players.length
  return players[nextIndex].id
}

