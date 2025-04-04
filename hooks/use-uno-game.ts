"use client"

import { useState, useEffect, useCallback } from "react"
import type { Card as UnoCard, Player, GameSettings } from "@/components/uno/types"

export function useUnoGame(initialSettings: GameSettings) {
    const [gameStarted, setGameStarted] = useState(false)
    const [players, setPlayers] = useState<Player[]>([])
    const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
    const [topCard, setTopCard] = useState<UnoCard | null>(null)
    const [currentColor, setCurrentColor] = useState<"red" | "blue" | "green" | "yellow" | null>(null)
    const [winner, setWinner] = useState<Player | null>(null)
    const [gameLog, setGameLog] = useState<string[]>([])
    const [settings, setSettings] = useState<GameSettings>(initialSettings)

    const addToGameLog = useCallback((message: string) => {
        setGameLog(prev => [...prev, message])
    }, [])

    const startGame = useCallback((initialPlayers: Player[]) => {
        setPlayers(initialPlayers)
        setCurrentPlayer(initialPlayers[0])
        setGameStarted(true)
        addToGameLog("Game started!")
    }, [addToGameLog])

    const playCard = useCallback((card: UnoCard, playerId: number) => {
        // Game logic for playing a card
        // This would include validation, updating game state, and handling special cards
    }, [settings])

    const drawCard = useCallback((playerId: number) => {
        // Logic for drawing a card
    }, [])

    const endTurn = useCallback(() => {
        // Logic for ending the current turn and moving to the next player
    }, [players])

    const resetGame = useCallback(() => {
        setGameStarted(false)
        setPlayers([])
        setCurrentPlayer(null)
        setTopCard(null)
        setCurrentColor(null)
        setWinner(null)
        setGameLog([])
    }, [])

    return {
        gameStarted,
        players,
        currentPlayer,
        topCard,
        currentColor,
        winner,
        gameLog,
        settings,
        startGame,
        playCard,
        drawCard,
        endTurn,
        resetGame,
        addToGameLog,
        setSettings
    }
} 