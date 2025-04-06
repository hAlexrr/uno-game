"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Volume2 } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Badge } from "@/components/ui/badge"

export default function VoiceChat() {
  const { roomCode, playerId, gameState } = useMultiplayerContext()
  const [isMuted, setIsMuted] = useState(true)
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([])
  const [isSupported, setIsSupported] = useState(true)

  const streamRef = useRef<MediaStream | null>(null)
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({})

  useEffect(() => {
    // Check if browser supports WebRTC
    if (!navigator.mediaDevices || !window.RTCPeerConnection) {
      setIsSupported(false)
      return
    }

    // Initialize voice chat (simplified - would need a full WebRTC implementation)
    const initVoiceChat = async () => {
      try {
        // Request microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream

        // Mute by default
        stream.getAudioTracks().forEach((track) => {
          track.enabled = false
        })

        // Setup peer connections with other players
        // This is simplified - would need signaling server
      } catch (error) {
        console.error("Error accessing microphone:", error)
        setIsSupported(false)
      }
    }

    if (roomCode && playerId) {
      initVoiceChat()
    }

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      // Close peer connections
      Object.values(peerConnectionsRef.current).forEach((pc) => pc.close())
      peerConnectionsRef.current = {}
    }
  }, [roomCode, playerId])

  const toggleMute = () => {
    if (!streamRef.current) return

    const newMuteState = !isMuted
    streamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !newMuteState
    })

    setIsMuted(newMuteState)
  }

  if (!isSupported) return null

  return (
    <div className="absolute bottom-2 right-2 z-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleMute}
            className={isMuted ? "text-red-500" : "text-green-500"}
          >
            {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          </Button>

          <div className="text-xs">
            {activeSpeakers.length > 0 ? (
              <div className="flex gap-1">
                {activeSpeakers.map((speakerId) => {
                  const speaker = gameState?.players.find((p) => p.id === speakerId)
                  return speaker ? (
                    <Badge key={speakerId} variant="outline" className="flex items-center gap-1">
                      <Volume2 size={12} />
                      {speaker.name}
                    </Badge>
                  ) : null
                })}
              </div>
            ) : (
              <span className="text-gray-500">Voice chat {isMuted ? "muted" : "active"}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

