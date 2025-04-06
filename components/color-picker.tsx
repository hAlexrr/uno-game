"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useMultiplayerContext } from "@/context/multiplayer-context"

export default function ColorPicker() {
  const { showColorPicker, selectWildColor } = useMultiplayerContext()

  return (
    <AnimatePresence>
      {showColorPicker && (
        <motion.div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-center">Choose a color</h3>
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                className="w-16 h-16 bg-red-600 rounded-lg shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectWildColor("red")}
              />
              <motion.button
                className="w-16 h-16 bg-blue-600 rounded-lg shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectWildColor("blue")}
              />
              <motion.button
                className="w-16 h-16 bg-green-600 rounded-lg shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectWildColor("green")}
              />
              <motion.button
                className="w-16 h-16 bg-yellow-500 rounded-lg shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectWildColor("yellow")}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

