"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useSocket } from "@/components/providers/socket-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DirectMessage {
  id: string
  content: string
  createdAt: string
  senderId?: string
  receiverId?: string
  sender: {
    id: string
    name: string
    image?: string
  }
}

interface DirectChatAreaProps {
  friendId: string
  friendName: string
  friendImage?: string
  isOnline: boolean
}

export function DirectChatArea({ friendId, friendName, friendImage, isOnline }: DirectChatAreaProps) {
  const { data: session } = useSession()
  const { socket, isConnected } = useSocket()
  const [messages, setMessages] = useState<DirectMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Create consistent room ID
  const roomId = [session?.user?.id, friendId].sort().join("-")

  useEffect(() => {
    if (friendId) {
      fetchMessages()
    }
  }, [friendId])

  useEffect(() => {
    if (socket && isConnected && roomId) {
      console.log("Joining room:", roomId)
      socket.emit("join-room", roomId)

      // Function to handle incoming messages
      const handleReceiveMessage = (message: DirectMessage) => {
        console.log("Received direct message:", message)
        setMessages((prev) => [...prev, message])
      }

      // Listen for direct message events
      socket.on("receive-direct-message", handleReceiveMessage)

      // Listen for typing events
      socket.on("user-typing-direct", (data: { userId: string; userName: string; roomId: string }) => {
        if (data.userId !== session?.user?.id && data.roomId === roomId) {
          setTypingUsers((prev) => {
            const filtered = prev.filter((name) => name !== data.userName)
            return [...filtered, data.userName]
          })
        }
      })

      socket.on("user-stop-typing-direct", (data: { userId: string; userName: string; roomId: string }) => {
        if (data.roomId === roomId) {
          setTypingUsers((prev) => prev.filter((name) => name !== data.userName))
        }
      })

      return () => {
        // Clean up event listeners
        socket.off("receive-direct-message", handleReceiveMessage)
        socket.off("user-typing-direct")
        socket.off("user-stop-typing-direct")

        // Leave the room when component unmounts
        socket.emit("leave-room", roomId)
        console.log("Left room:", roomId)
      }
    }
  }, [socket, isConnected, session?.user?.id, friendId, roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/direct-messages?friendId=${friendId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching direct messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !session?.user) return

    try {
      const response = await fetch("/api/direct-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          receiverId: friendId,
        }),
      })

      if (response.ok) {
        const savedMessage = await response.json()

        // Add the message to the local state immediately
        setMessages((prev) => [...prev, savedMessage])

        // Emit the message via socket if connected
        if (socket && isConnected) {
          console.log("Emitting direct message to room:", roomId)
          socket.emit("send-direct-message", {
            ...savedMessage,
            roomId,
          })
        }

        setNewMessage("")
        handleStopTyping()
      }
    } catch (error) {
      console.error("Error sending direct message:", error)
    }
  }

  const handleTyping = () => {
    if (socket && isConnected && session?.user) {
      socket.emit("typing-direct", {
        roomId,
        userId: session.user.id,
        userName: session.user.name,
      })

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        handleStopTyping()
      }, 3000)
    }
  }

  const handleStopTyping = () => {
    if (socket && isConnected && session?.user) {
      socket.emit("stop-typing-direct", {
        roomId,
        userId: session.user.id,
        userName: session.user.name,
      })
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading messages...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b p-4 bg-white">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={friendImage || ""} />
              <AvatarFallback>{friendName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div
              className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{friendName}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-500">{isOnline ? "Online" : "Offline"}</p>
              {!isConnected && <span className="text-xs text-red-500">• Disconnected</span>}
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3 chat-message">
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender.image || ""} />
                <AvatarFallback>{message.sender.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{message.sender.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{message.content}</p>
              </div>
            </div>
          ))}

          {typingUsers.length > 0 && (
            <div className="flex space-x-3">
              <div className="h-8 w-8"></div>
              <div className="text-sm text-muted-foreground italic">
                {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4 bg-white">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${friendName}...`}
            className="flex-1"
            disabled={!isConnected}
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim() || !isConnected}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">Disconnected from chat server. Trying to reconnect...</p>
        )}
      </div>
    </div>
  )
}
