"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMultiplayerContext } from "@/context/multiplayer-context"

export default function UnoCall() {
  const { showUnoCall } = useMultiplayerContext()

  return (
    <AnimatePresence>
      {showUnoCall && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div className="text-6xl font-bold text-red-600 bg-yellow-400 px-8 py-4 rounded-lg shadow-lg border-4 border-white transform -rotate-6">
            UNO!
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

