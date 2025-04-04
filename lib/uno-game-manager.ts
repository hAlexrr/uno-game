import type { Card as UnoCard, Player, GameSettings } from "@/components/uno/types"

export class UnoGameManager {
    private settings: GameSettings

    constructor(settings: GameSettings) {
        this.settings = settings
    }

    public canPlayCard(card: UnoCard, topCard: UnoCard | null, currentColor: string | null): boolean {
        if (!topCard) return true
        if (card.type === "wild") return true
        if (card.color === currentColor) return true
        if (card.color === topCard.color) return true
        if (card.value === topCard.value) return true
        return false
    }

    public getPlayableCards(hand: UnoCard[], topCard: UnoCard | null, currentColor: string | null): UnoCard[] {
        return hand.filter(card => this.canPlayCard(card, topCard, currentColor))
    }

    public simulateBotTurn(player: Player, topCard: UnoCard | null, currentColor: string | null): UnoCard | null {
        const playableCards = this.getPlayableCards(player.cards, topCard, currentColor)
        if (playableCards.length === 0) return null

        // Simple AI strategy - prioritize special cards and matching colors
        const specialCards = playableCards.filter(card => card.type === "special" || card.type === "wild")
        if (specialCards.length > 0) {
            return specialCards[0]
        }

        // Try to match color first
        const colorMatches = playableCards.filter(card => card.color === currentColor)
        if (colorMatches.length > 0) {
            return colorMatches[0]
        }

        // Otherwise play the first playable card
        return playableCards[0]
    }

    public calculateScore(winner: Player, players: Player[]): number {
        return players.reduce((score, player) => {
            if (player.id === winner.id) return score
            return score + player.cards.reduce((cardScore, card) => {
                if (card.type === "wild") return cardScore + 50
                if (card.type === "special") return cardScore + 20
                return cardScore + parseInt(card.value)
            }, 0)
        }, 0)
    }

    public checkForWinner(players: Player[]): Player | null {
        return players.find(player => player.cards.length === 0) || null
    }

    public getNextPlayer(currentPlayer: Player, players: Player[], direction: "clockwise" | "counterclockwise"): Player {
        const currentIndex = players.findIndex(p => p.id === currentPlayer.id)
        let nextIndex: number

        if (direction === "clockwise") {
            nextIndex = (currentIndex + 1) % players.length
        } else {
            nextIndex = (currentIndex - 1 + players.length) % players.length
        }

        return players[nextIndex]
    }

    public updateSettings(newSettings: GameSettings) {
        this.settings = newSettings
    }
} 