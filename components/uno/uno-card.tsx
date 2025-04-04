"use client"

import type { Card } from "./types"

interface UnoCardProps {
    card: Card
    onClick?: () => void
    disabled?: boolean
}

export default function UnoCardComponent({ card, onClick, disabled }: UnoCardProps) {
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

    return (
        <div
            className={`w-20 h-28 rounded-lg ${getColorClass(card.color)} flex items-center justify-center text-white font-bold cursor-pointer ${
                disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 transition-transform"
            }`}
            onClick={disabled ? undefined : onClick}
        >
            {card.value}
        </div>
    )
} 