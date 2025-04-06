"use client"

import { motion } from "framer-motion"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import OtherPlayers from "./bot-players"
import CardDeck from "./card-deck"
import GameControls from "./game-controls"
import Scoreboard from "./scoreboard"
import GameLog from "./game-log"
import UnoCall from "./uno-call"
import ColorPicker from "./color-picker"
import WinnerScreen from "./winner-screen"
import HumanPlayer from "./human-player"
import GameChat from "./game-chat"
import TurnTimer from "./turn-timer"
import ConfettiEffect from "./confetti-effect"
import GameStats from "./game-stats"
import CardAnimation from "./card-animation"
import VoiceChat from "./voice-chat"
import CardThemeCustomizer from "./card-theme-customizer"

export default function GameBoard() {
  const { gameState, lastAction } = useMultiplayerContext()

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] max-h-[900px]">
      {/* Game table area - top 70% of the screen */}
      <div className="relative w-full h-[70%] bg-green-900/10 rounded-lg border-2 border-green-900/20 overflow-hidden">
        {/* Game table */}
        <motion.div
          className="absolute inset-[5%] rounded-full bg-green-800/20 border-4 border-green-900/30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        ></motion.div>

        {/* Center game area */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-4">
          <CardDeck />
          <TurnTimer />

          {/* Last action display */}
          {lastAction && (
            <motion.div
              className="mt-2 px-3 py-1 bg-black/20 dark:bg-white/20 rounded-full text-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={lastAction}
            >
              {lastAction}
            </motion.div>
          )}
        </div>

        {/* Other players positioned in a circular arrangement */}
        <OtherPlayers />

        {/* Game controls */}
        <GameControls />

        {/* Current player indicator and scoreboard */}
        <Scoreboard />
        <GameStats />

        {/* Game log */}
        <GameLog />

        {/* Game chat */}
        <GameChat />

        {/* Voice chat */}
        <VoiceChat />

        {/* Card animations */}
        <CardAnimation />

        {/* UNO call animation */}
        <UnoCall />

        {/* Wild card color picker */}
        <ColorPicker />

        {/* Winner animation */}
        <WinnerScreen />
        <ConfettiEffect />
      </div>

      {/* Player hand area - bottom 30% of the screen */}
      <div className="w-full h-[30%] bg-gray-100 dark:bg-gray-800 rounded-lg mt-2 p-2 flex flex-col">
        <div className="flex justify-end mb-2">
          <CardThemeCustomizer />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <HumanPlayer />
        </div>
      </div>
    </div>
  )
}

