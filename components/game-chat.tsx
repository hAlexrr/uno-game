"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, ChevronUp, Send } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { format } from "date-fns"

export default function GameChat() {
  const { showChat, setShowChat, chatMessages, sendChatMessage, playerId } = useMultiplayerContext()
  const [message, setMessage] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageCountRef = useRef(0)

  // Track unread messages
  useEffect(() => {
    if (!showChat && chatMessages.length > lastMessageCountRef.current) {
      setUnreadCount(chatMessages.length - lastMessageCountRef.current)
    }

    if (showChat) {
      // Reset unread count when chat is opened
      setUnreadCount(0)
      lastMessageCountRef.current = chatMessages.length
    }
  }, [chatMessages, showChat])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollAreaRef.current && showChat) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [chatMessages, showChat])

  const handleSendMessage = () => {
    if (!message.trim()) return

    sendChatMessage(message)
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  if (!showChat) {
    return (
      <motion.div
        className="absolute bottom-[35%] right-2"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button size="sm" variant="outline" className="flex items-center gap-1" onClick={() => setShowChat(true)}>
          <MessageSquare size={14} />
          Chat
          {unreadCount > 0 && (
            <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="absolute bottom-[35%] right-2 w-64"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="p-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 text-sm">
            <MessageSquare size={14} />
            <span className="font-medium">Chat</span>
          </div>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setShowChat(false)}>
            <ChevronUp size={14} />
          </Button>
        </div>

        <ScrollArea className="h-32 mb-2" ref={scrollAreaRef}>
          <div className="text-xs space-y-1 pr-4">
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-2">No messages yet</div>
            ) : (
              chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`py-1 px-2 rounded-lg mb-1 ${
                    msg.playerId === playerId
                      ? "bg-blue-100 dark:bg-blue-900 ml-4"
                      : "bg-gray-100 dark:bg-gray-800 mr-4"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xs">{msg.playerId === playerId ? "You" : msg.playerName}</span>
                    <span className="text-[10px] text-gray-500">{format(new Date(msg.timestamp), "HH:mm")}</span>
                  </div>
                  <p>{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-xs h-8"
          />
          <Button size="sm" className="h-8 w-8 p-0" onClick={handleSendMessage}>
            <Send size={14} />
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

