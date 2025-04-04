"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Lightbulb, SortDesc, MessageSquare } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Card, Player } from "./types"
import UnoCardComponent from "./uno-card"

interface PlayerHandProps {
    player: Player
    currentPlayer: Player
    topCard: Card | null
    currentColor: string | null
    onPlayCard: (card: Card) => void
    onToggleSort: () => void
    onToggleHint: () => void
    sorted: boolean
    showHint: boolean
    onSendEmoji: (emoji: string) => void
    emojis: string[]
}

export default function PlayerHand({
    player,
    currentPlayer,
    topCard,
    currentColor,
    onPlayCard,
    onToggleSort,
    onToggleHint,
    sorted,
    showHint,
    onSendEmoji,
    emojis
}: PlayerHandProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const getPlayableCards = (cards: Card[]) => {
        return cards.filter(card => {
            if (!topCard) return true
            if (card.type === "wild") return true
            if (card.color === currentColor) return true
            if (card.color === topCard.color) return true
            if (card.value === topCard.value) return true
            return false
        })
    }

    const sortCards = (cards: Card[]) => {
        if (!sorted) return cards

        return [...cards].sort((a, b) => {
            // First sort by color
            if (a.color !== b.color) {
                const colorOrder = { red: 1, yellow: 2, green: 3, blue: 4, wild: 5 }
                return colorOrder[a.color as keyof typeof colorOrder] - colorOrder[b.color as keyof typeof colorOrder]
            }

            // Then sort by value
            const valueOrder: Record<string, number> = {
                "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9,
                skip: 10, reverse: 11, draw2: 12, wild: 13, wild4: 14
            }

            return valueOrder[a.value] - valueOrder[b.value]
        })
    }

    const getColorClass = (color: string) => {
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

    const playableCards = getPlayableCards(player.cards)
    const sortedHand = sortCards(player.cards)

    if (!mounted) {
        return null
    }

    return (
        <motion.div
            className="p-4 bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg max-w-[90vw] w-full"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between mb-2">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onToggleSort}
                        className="flex items-center gap-1"
                    >
                        <SortDesc size={14} />
                        {sorted ? "Unsort" : "Sort Cards"}
                    </Button>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={onToggleHint}
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
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => onSendEmoji(emojis[Math.floor(Math.random() * emojis.length)])}
                    >
                        <MessageSquare size={14} />
                        Emojis
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-min" style={{ width: "max-content" }}>
                    <AnimatePresence>
                        {sortedHand.map((card) => {
                            const isPlayable = playableCards.includes(card)

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
                                        onClick={() => onPlayCard(card)}
                                        disabled={!currentPlayer?.isHuman || !currentPlayer?.isCurrentTurn}
                                    />
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
} 