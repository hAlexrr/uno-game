"use client"

import type { Card as UnoCard } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Shuffle, RotateCcw, Ban } from "lucide-react"

interface UnoCardProps {
  card: UnoCard
  onClick: () => void
  disabled?: boolean
}

export default function UnoCardComponent({ card, onClick, disabled = false }: UnoCardProps) {
  const getCardColor = () => {
    switch (card.color) {
      case "red":
        return "bg-red-600 text-white"
      case "blue":
        return "bg-blue-600 text-white"
      case "green":
        return "bg-green-600 text-white"
      case "yellow":
        return "bg-yellow-500 text-black"
      case "wild":
        return "bg-gradient-to-br from-red-600 via-blue-600 to-green-600 text-white"
      default:
        return "bg-gray-800 text-white"
    }
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
        "w-14 h-20 rounded-lg shadow-md flex flex-col items-center justify-center font-bold",
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

