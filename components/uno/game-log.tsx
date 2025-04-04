"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, ChevronUp } from "lucide-react"
import { useRef, useEffect } from "react"

interface GameLogProps {
    gameLog: string[];
    showGameLog: boolean;
    onToggleGameLog: (show: boolean) => void;
}

export default function GameLog({ gameLog, showGameLog, onToggleGameLog }: GameLogProps) {
    const gameLogRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (gameLogRef.current) {
            gameLogRef.current.scrollTop = gameLogRef.current.scrollHeight
        }
    }, [gameLog])

    if (showGameLog) {
        return (
            <motion.div
                className="absolute bottom-[35%] left-2 w-64"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="p-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-sm">
                            <History size={14} />
                            <span className="font-medium">Game Log</span>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => onToggleGameLog(false)}
                        >
                            <ChevronUp size={14} />
                        </Button>
                    </div>

                    <ScrollArea className="h-32" ref={gameLogRef}>
                        <div className="text-xs space-y-1 pr-4">
                            {gameLog.map((log, index) => (
                                <div
                                    key={index}
                                    className="py-1 border-b border-gray-100 dark:border-gray-800 last:border-0"
                                >
                                    {log}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>
            </motion.div>
        )
    }

    return (
        <motion.div
            className="absolute bottom-[35%] left-2"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                onClick={() => onToggleGameLog(true)}
            >
                <History size={14} />
                Game Log
            </Button>
        </motion.div>
    )
} 