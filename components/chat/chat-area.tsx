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

interface Message {
  id: string
  content: string
  createdAt: string
  user: {
    id: string
    name: string
    image?: string
  }
}

interface ChatAreaProps {
  roomId: string
  roomName: string
}

export function ChatArea({ roomId, roomName }: ChatAreaProps) {
  const { data: session } = useSession()
  const { socket } = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (roomId) {
      fetchMessages()
      if (socket) {
        socket.emit("join-room", roomId)
      }
    }

    return () => {
      if (socket && roomId) {
        socket.emit("leave-room", roomId)
      }
    }
  }, [roomId, socket])

  useEffect(() => {
    if (socket) {
      // Function to handle incoming messages
      const handleReceiveMessage = (message: Message) => {
        console.log("Received group message:", message)
        if (message.roomId === roomId) {
          setMessages((prev) => [...prev, message])
        }
      }

      socket.on("receive-message", handleReceiveMessage)

      socket.on("user-typing", (data: { userId: string; userName: string; roomId: string }) => {
        if (data.userId !== session?.user?.id && data.roomId === roomId) {
          setTypingUsers((prev) => [...prev.filter((id) => id !== data.userId), data.userName])
        }
      })

      socket.on("user-stop-typing", (data: { userId: string; roomId: string }) => {
        if (data.roomId === roomId) {
          setTypingUsers((prev) => prev.filter((name) => name !== data.userId))
        }
      })

      return () => {
        socket.off("receive-message", handleReceiveMessage)
        socket.off("user-typing")
        socket.off("user-stop-typing")
      }
    }
  }, [socket, session?.user?.id, roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/messages?roomId=${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !session?.user) return

    const messageData = {
      content: newMessage,
      roomId,
      user: {
        id: session.user.id,
        name: session.user.name || "Unknown",
        image: session.user.image,
      },
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          roomId,
        }),
      })

      if (response.ok) {
        const savedMessage = await response.json()
        setMessages((prev) => [...prev, savedMessage])

        if (socket) {
          socket.emit("send-message", savedMessage)
        }

        setNewMessage("")
        handleStopTyping()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleTyping = () => {
    if (socket && session?.user) {
      socket.emit("typing", {
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
    if (socket && session?.user) {
      socket.emit("stop-typing", {
        roomId,
        userId: session.user.id,
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
      <div className="border-b p-4 bg-card">
        <h3 className="font-semibold text-lg text-card-foreground">{roomName}</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3 chat-message">
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.user.image || ""} />
                <AvatarFallback>{message.user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">{message.user.name}</span>
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

      <div className="border-t p-4 bg-card">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              handleTyping()
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
