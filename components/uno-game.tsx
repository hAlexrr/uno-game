"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Volume2, VolumeX, Settings } from "lucide-react"
import GameLobby from "./uno/game-lobby"
import GameStatus from "./uno/game-status"
import GameBoard from "./uno/game-board"
import PlayerHand from "./uno/player-hand"
import GameLog from "./uno/game-log"
import GameOver from "./uno/game-over"
import GameSettings from "./uno/game-settings"
import { useUnoGame } from "@/hooks/use-uno-game"
import { UnoGameManager } from "@/lib/uno-game-manager"
import { SoundEffects } from "@/lib/sound-effects"
import type { Card, Player, AnimationState } from "./uno/types"
import type { GameSettings as GameSettingsType } from "./uno/types"

const defaultSettings: GameSettingsType = {
    stackingEnabled: true,
    jumpInEnabled: true,
    drawUntilMatch: true,
    forcePlay: true,
    sevenORule: true,
    blankCards: false,
    challengeRule: true,
    playDrawnCard: true,
    specialSwapHands: false,
    gameSpeed: "normal",
    showScoreboard: true,
    showGameLog: true,
    showHints: true,
    sortCards: false
}

export default function UnoGame() {
    const { theme, setTheme } = useTheme()
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [showSettings, setShowSettings] = useState(false)
    const [showGameLog, setShowGameLog] = useState(true)
    const [showScoreboard, setShowScoreboard] = useState(true)
    const [showHint, setShowHint] = useState(true)
    const [sortedHand, setSortedHand] = useState(false)
    const [botCount, setBotCount] = useState(1)
    const [botDifficulty, setBotDifficulty] = useState<"easy" | "medium" | "hard">("medium")
    const [emojis] = useState<string[]>(["😀", "😂", "😎", "🤔", "😡", "😱", "🤯", "🎉"])
    const [animation, setAnimation] = useState<AnimationState>({ type: null })

    const {
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
    } = useUnoGame(defaultSettings)

    const gameManager = new UnoGameManager(settings)

    useEffect(() => {
        SoundEffects.init()
    }, [])

    useEffect(() => {
        SoundEffects.setEnabled(soundEnabled)
    }, [soundEnabled])

    const handlePlayCard = (card: Card) => {
        if (!currentPlayer) return
        
        if (gameManager.canPlayCard(card, topCard, currentColor)) {
            playCard(card, currentPlayer.id)
            SoundEffects.play("cardPlay")
        } else {
            SoundEffects.play("error")
        }
    }

    const handleDrawCard = (playerId: number) => {
        drawCard(playerId)
        SoundEffects.play("cardDraw")
    }

    const handleStartGame = (players: Player[]) => {
        startGame(players)
        SoundEffects.play("shuffle")
    }

    const handleGameOver = (winner: Player) => {
        SoundEffects.play(winner.isHuman ? "win" : "lose")
    }

    const handleAddPlayer = (name: string) => {
        const newPlayer: Player = {
            id: players.length + 1,
            name,
            cards: [],
            isHuman: true,
            score: 0,
            isCurrentTurn: false
        }
        startGame([newPlayer])
    }

    const handleSetBotCount = (count: number) => {
        setBotCount(count)
    }

    const handleSetBotDifficulty = (difficulty: "easy" | "medium" | "hard") => {
        setBotDifficulty(difficulty)
    }

    const handleSendEmoji = (emoji: string) => {
        addToGameLog(`${currentPlayer?.name || "Player"} sent ${emoji}`)
    }

    return (
        <main className="h-screen overflow-hidden p-4 md:p-8">
            <div className="h-full flex flex-col items-center gap-4">
                {!gameStarted ? (
                    <GameLobby
                        onStartGame={handleStartGame}
                        onSettingsChange={setSettings}
                        settings={settings}
                        onAddPlayer={handleAddPlayer}
                        botCount={botCount}
                        onSetBotCount={handleSetBotCount}
                        botDifficulty={botDifficulty}
                        onSetBotDifficulty={handleSetBotDifficulty}
                        theme={theme || "light"}
                        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
                        soundEnabled={soundEnabled}
                        onToggleSound={() => setSoundEnabled(!soundEnabled)}
                        players={players}
                    />
                ) : (
                    <div className="h-full w-full flex flex-col">
                        <div className="flex-none h-16">
                            <GameStatus
                                currentPlayer={currentPlayer}
                                scores={players.reduce((acc, player) => ({
                                    ...acc,
                                    [player.name]: player.score
                                }), {})}
                                showScoreboard={showScoreboard}
                                onToggleScoreboard={() => setShowScoreboard(!showScoreboard)}
                            />
                        </div>

                        <div className="flex-1 min-h-0 relative">
                            <GameBoard
                                topCard={topCard}
                                cardsRemaining={0}
                                currentColor={currentColor}
                                isShuffling={false}
                                onDrawCard={() => handleDrawCard(currentPlayer?.id || 0)}
                                currentPlayer={currentPlayer}
                                winner={winner}
                                animation={animation}
                                players={players}
                            />
                        </div>

                        {currentPlayer?.isHuman && (
                            <div className="flex-none h-32">
                                <PlayerHand
                                    player={currentPlayer}
                                    currentPlayer={currentPlayer}
                                    topCard={topCard}
                                    currentColor={currentColor}
                                    onPlayCard={handlePlayCard}
                                    onToggleSort={() => setSortedHand(!sortedHand)}
                                    onToggleHint={() => setShowHint(!showHint)}
                                    sorted={sortedHand}
                                    showHint={showHint}
                                    onSendEmoji={handleSendEmoji}
                                    emojis={emojis}
                                />
                            </div>
                        )}

                        {showGameLog && (
                            <div className="flex-none h-32">
                                <GameLog
                                    gameLog={gameLog}
                                    showGameLog={showGameLog}
                                    onToggleGameLog={() => setShowGameLog(false)}
                                />
                            </div>
                        )}

                        {winner && (
                            <div className="flex-none">
                                <GameOver
                                    winner={winner}
                                    onPlayAgain={resetGame}
                                    onReturnToLobby={resetGame}
                                />
                            </div>
                        )}

                        <div className="fixed bottom-4 right-4 flex gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                            >
                                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                title={soundEnabled ? "Mute sounds" : "Enable sounds"}
                            >
                                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowSettings(true)}
                                title="Game settings"
                            >
                                <Settings size={16} />
                            </Button>
                        </div>

                        {showSettings && (
                            <GameSettings
                                settings={settings}
                                onSettingsChange={setSettings}
                                showScoreboard={showScoreboard}
                                onToggleScoreboard={setShowScoreboard}
                                showGameLog={showGameLog}
                                onToggleGameLog={setShowGameLog}
                                showHint={showHint}
                                onToggleHint={setShowHint}
                                sortedHand={sortedHand}
                                onToggleSort={setSortedHand}
                                gameSpeed={settings.gameSpeed}
                                onSetGameSpeed={(speed) => setSettings({ ...settings, gameSpeed: speed })}
                                open={showSettings}
                                onOpenChange={setShowSettings}
                            />
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}

