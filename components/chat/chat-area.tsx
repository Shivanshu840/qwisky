"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useSocket } from "@/components/providers/socket-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { MessageBubble } from "@/components/chat/message-bubble"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { VoiceRecorder } from "@/components/ui/voice-recorder"
import { Paperclip } from "lucide-react"

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
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-sm">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{roomName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Group chat</p>
      </div>

      <ScrollArea className="flex-1 p-4 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-1">
          {messages.map((message, index) => {
            const isOwn = message.user.id === session?.user?.id
            const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.user.id !== message.user.id)

            return (
              <MessageBubble key={message.id} message={message} isOwn={isOwn} showAvatar={showAvatar} isRead={true} />
            )
          })}

          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-3 px-4 py-2">
              <div className="h-8 w-8" />
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-2xl px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600">
                <Paperclip className="h-4 w-4" />
              </Button>

              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />

              <div className="flex items-center space-x-1">
                <EmojiPicker onEmojiSelect={(emoji) => setNewMessage((prev) => prev + emoji)} />
                <VoiceRecorder
                  onVoiceMessage={(blob, duration) => {
                    // Handle voice message for group chat
                    const voiceMessage = `🎤 Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`
                    setNewMessage(voiceMessage)
                    sendMessage()
                  }}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="h-12 w-12 p-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
