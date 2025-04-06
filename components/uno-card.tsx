"use client"

import type { Card as UnoCard } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Shuffle, RotateCcw, Ban } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"

interface UnoCardProps {
  card: UnoCard
  onClick: () => void
  disabled?: boolean
  theme?: string
}

// Card theme colors
const CARD_THEMES = {
  classic: {
    red: "bg-red-600 text-white",
    blue: "bg-blue-600 text-white",
    green: "bg-green-600 text-white",
    yellow: "bg-yellow-500 text-black",
    wild: "bg-gradient-to-br from-red-600 via-blue-600 to-green-600 text-white",
  },
  neon: {
    red: "bg-pink-600 text-white",
    blue: "bg-cyan-500 text-black",
    green: "bg-lime-500 text-black",
    yellow: "bg-amber-400 text-black",
    wild: "bg-gradient-to-br from-pink-600 via-cyan-500 to-lime-500 text-white",
  },
  pastel: {
    red: "bg-red-300 text-gray-800",
    blue: "bg-blue-300 text-gray-800",
    green: "bg-green-300 text-gray-800",
    yellow: "bg-yellow-300 text-gray-800",
    wild: "bg-gradient-to-br from-red-300 via-blue-300 to-green-300 text-gray-800",
  },
  dark: {
    red: "bg-red-900 text-white",
    blue: "bg-blue-900 text-white",
    green: "bg-green-900 text-white",
    yellow: "bg-yellow-700 text-white",
    wild: "bg-gradient-to-br from-red-900 via-blue-900 to-green-900 text-white",
  },
  nature: {
    red: "bg-red-700 text-white",
    blue: "bg-teal-600 text-white",
    green: "bg-emerald-600 text-white",
    yellow: "bg-amber-600 text-white",
    wild: "bg-gradient-to-br from-red-700 via-teal-600 to-emerald-600 text-white",
  },
  ocean: {
    red: "bg-rose-600 text-white",
    blue: "bg-sky-600 text-white",
    green: "bg-teal-600 text-white",
    yellow: "bg-amber-500 text-black",
    wild: "bg-gradient-to-br from-rose-600 via-sky-600 to-teal-600 text-white",
  },
}

export default function UnoCardComponent({ card, onClick, disabled = false, theme }: UnoCardProps) {
  const { cardTheme: contextTheme } = useMultiplayerContext()

  const activeTheme = theme || contextTheme || "classic"
  const themeColors = CARD_THEMES[activeTheme as keyof typeof CARD_THEMES] || CARD_THEMES.classic

  const getCardColor = () => {
    return themeColors[card.color as keyof typeof themeColors] || "bg-gray-800 text-white"
  }

  const getCardSymbol = () => {
    switch (card.value) {
      case "skip":
        return <Ban size={16} />
      case "reverse":
        return <RotateCcw size={16} />
      case "draw2":
        return "+2"
      case "wild":
        return "W"
      case "wild4":
        return "+4"
      case "swap":
        return <Shuffle size={16} />
      case "blank":
        return "?"
      default:
        return card.value
    }
  }

  return (
    <motion.button
      className={cn(
        "w-14 h-20 rounded-lg shadow-md flex flex-col items-center justify-center font-bold relative",
        getCardColor(),
        disabled ? "opacity-80 cursor-not-allowed" : "cursor-pointer",
      )}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      <div className="absolute top-1 left-1 text-xs">{getCardSymbol()}</div>
      <div className="text-xl">{getCardSymbol()}</div>
      <div className="absolute bottom-1 right-1 text-xs rotate-180">{getCardSymbol()}</div>
    </motion.button>
  )
}

