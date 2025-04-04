"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCw } from "lucide-react"
import UnoCardComponent from "../uno-card"
import type { Card, Player, AnimationState } from "./types"

interface BoardProps {
    topCard: Card | null;
    currentColor: "red" | "blue" | "green" | "yellow" | null;
    cardsRemaining: number;
    isShuffling: boolean;
    onDrawCard: () => void;
    currentPlayer: Player | null;
    winner: Player | null;
    animation: AnimationState;
    players: Player[];
}

export default function Board({
    topCard,
    currentColor,
    cardsRemaining,
    isShuffling,
    onDrawCard,
    currentPlayer,
    winner,
    animation,
    players
}: BoardProps) {
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

    const getPlayerPosition = (index: number, totalPlayers: number) => {
        const angle = (index * 2 * Math.PI) / totalPlayers
        const radius = 200 // Adjust this value to change the distance from center
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        return { x, y }
    }

    return (
        <div className="w-full h-[calc(100vh-40px)] max-h-[900px] relative">
            {/* Game table */}
            <motion.div
                className="absolute inset-[5%] rounded-full bg-green-800/20 border-4 border-green-900/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
            ></motion.div>

            {/* Player positions */}
            {players.map((player, index) => {
                const position = getPlayerPosition(index, players.length)
                return (
                    <motion.div
                        key={player.id}
                        className="absolute flex flex-col items-center gap-2"
                        style={{
                            left: `calc(50% + ${position.x}px)`,
                            top: `calc(50% + ${position.y}px)`,
                            transform: "translate(-50%, -50%)"
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <div className="text-sm font-medium text-center">
                            {player.name}
                            {player.isCurrentTurn && (
                                <span className="ml-1 text-yellow-500">★</span>
                            )}
                        </div>
                        <div className="flex gap-1">
                            {Array(player.cards.length).fill(0).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-4 h-6 rounded-sm bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                                />
                            ))}
                        </div>
                    </motion.div>
                )
            })}

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
                            onClick={onDrawCard}
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
            </div>
        </div>
    )
} 