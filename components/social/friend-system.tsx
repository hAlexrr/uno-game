"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, UserPlus, UserCheck, UserX, Mail, Copy, Search } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data for friends
const MOCK_FRIENDS = [
  {
    id: "friend1",
    name: "Alex",
    status: "online",
    avatar: "/placeholder.svg?height=40&width=40",
    lastPlayed: "Just now",
  },
  {
    id: "friend2",
    name: "Taylor",
    status: "in-game",
    avatar: "/placeholder.svg?height=40&width=40",
    lastPlayed: "5 minutes ago",
  },
  {
    id: "friend3",
    name: "Jordan",
    status: "offline",
    avatar: "/placeholder.svg?height=40&width=40",
    lastPlayed: "2 days ago",
  },
]

// Mock data for friend requests
const MOCK_REQUESTS = [
  {
    id: "request1",
    name: "Casey",
    avatar: "/placeholder.svg?height=40&width=40",
    mutualFriends: 2,
  },
  {
    id: "request2",
    name: "Riley",
    avatar: "/placeholder.svg?height=40&width=40",
    mutualFriends: 0,
  },
]

export default function FriendSystem() {
  const { roomCode } = useMultiplayerContext()
  const [friends, setFriends] = useState(MOCK_FRIENDS)
  const [friendRequests, setFriendRequests] = useState(MOCK_REQUESTS)
  const [searchQuery, setSearchQuery] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [showCopiedMessage, setShowCopiedMessage] = useState(false)

  // Accept friend request
  const acceptFriendRequest = (requestId: string) => {
    const request = friendRequests.find((req) => req.id === requestId)
    if (!request) return

    // Add to friends list
    setFriends([
      ...friends,
      {
        id: request.id,
        name: request.name,
        status: "online",
        avatar: request.avatar,
        lastPlayed: "Just now",
      },
    ])

    // Remove from requests
    setFriendRequests(friendRequests.filter((req) => req.id !== requestId))
  }

  // Decline friend request
  const declineFriendRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter((req) => req.id !== requestId))
  }

  // Copy invite code
  const copyInviteCode = () => {
    if (!roomCode) return

    navigator.clipboard.writeText(roomCode)
    setShowCopiedMessage(true)

    setTimeout(() => {
      setShowCopiedMessage(false)
    }, 2000)
  }

  // Filter friends based on search query
  const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-32 right-4 flex items-center gap-2">
          <Users size={16} />
          <span>Friends</span>
          {friendRequests.length > 0 && <Badge className="ml-1 bg-red-500 text-white">{friendRequests.length}</Badge>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={18} />
            Friends
            {friendRequests.length > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{friendRequests.length} new</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="friends">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {friendRequests.length > 0 && (
                <Badge className="ml-1 bg-red-500 text-white">{friendRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="invite">Invite</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search friends..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <Card key={friend.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            friend.status === "online"
                              ? "bg-green-500"
                              : friend.status === "in-game"
                                ? "bg-blue-500"
                                : "bg-gray-400"
                          }`}
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{friend.name}</h4>
                        <p className="text-xs text-gray-500">
                          {friend.status === "online" ? "Online" : friend.status === "in-game" ? "In Game" : "Offline"}
                          {" · "}
                          {friend.lastPlayed}
                        </p>
                      </div>

                      {friend.status === "online" && roomCode && (
                        <Button size="sm" variant="outline" className="h-8">
                          Invite
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? "No friends match your search" : "No friends yet"}
                </div>
              )}
            </div>

            <Button className="w-full" variant="outline">
              <UserPlus size={16} className="mr-2" />
              Add Friend
            </Button>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            {friendRequests.length > 0 ? (
              <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                {friendRequests.map((request) => (
                  <Card key={request.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={request.avatar} alt={request.name} />
                        <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{request.name}</h4>
                        <p className="text-xs text-gray-500">
                          {request.mutualFriends > 0 ? `${request.mutualFriends} mutual friends` : "No mutual friends"}
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-green-600"
                          onClick={() => acceptFriendRequest(request.id)}
                        >
                          <UserCheck size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => declineFriendRequest(request.id)}
                        >
                          <UserX size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No pending friend requests</div>
            )}
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <div className="text-center py-4">
              <h3 className="font-medium mb-2">Invite Friends to Play</h3>
              <p className="text-sm text-gray-500 mb-4">
                Share your room code with friends to invite them to your game
              </p>

              {roomCode ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input value={roomCode} readOnly className="text-center font-mono text-lg" />
                    <Button variant="outline" size="icon" onClick={copyInviteCode}>
                      <Copy size={16} />
                    </Button>
                  </div>

                  {showCopiedMessage && (
                    <motion.p
                      className="text-green-600 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Room code copied to clipboard!
                    </motion.p>
                  )}

                  <div className="flex justify-center gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </Button>
                    <Button className="flex items-center gap-2">
                      <Users size={16} />
                      Invite Friends
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-amber-600">You need to create or join a game first</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

