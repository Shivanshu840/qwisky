"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useSocket } from "@/components/providers/socket-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmojiPicker } from "@/components/ui/emoji-picker"
import { VoiceRecorder } from "@/components/ui/voice-recorder"
import { MessageBubble } from "@/components/chat/message-bubble"
import { Send, Phone, Video, MoreVertical, Paperclip } from "lucide-react"

interface DirectMessage {
  id: string
  content: string
  createdAt: string
  senderId?: string
  receiverId?: string
  type?: "text" | "voice"
  audioUrl?: string
  duration?: number
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
  const inputRef = useRef<HTMLInputElement>(null)

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

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    inputRef.current?.focus()
  }

  const handleVoiceMessage = async (audioBlob: Blob, duration: number) => {
    try {
      // Create a temporary URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob)

      // For demo purposes, we'll store the voice message as text with audio URL
      // In a real app, you'd upload the audio file to a server and get a permanent URL
      const voiceMessageContent = `🎤 Voice message (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")})`

      const response = await fetch("/api/direct-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: voiceMessageContent,
          receiverId: friendId,
          type: "voice",
          audioUrl: audioUrl, // In production, this would be a server URL
          duration: duration,
        }),
      })

      if (response.ok) {
        const savedMessage = await response.json()

        // Add audio URL and type to the message
        const messageWithAudio = {
          ...savedMessage,
          type: "voice" as const,
          audioUrl: audioUrl,
          duration: duration,
        }

        setMessages((prev) => [...prev, messageWithAudio])

        if (socket && isConnected) {
          socket.emit("send-direct-message", {
            ...messageWithAudio,
            roomId,
          })
        }
      }
    } catch (error) {
      console.error("Error sending voice message:", error)
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
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-300">Loading messages...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-gray-200 dark:ring-gray-700">
                <AvatarImage src={friendImage || ""} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                  {friendName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 ${
                  isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{friendName}</h3>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{isOnline ? "Online" : "Last seen recently"}</p>
                {!isConnected && <span className="text-xs text-red-500">• Disconnected</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {messages.map((message, index) => {
            const isOwn = message.sender.id === session?.user?.id
            const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender.id !== message.sender.id)

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                isRead={true} // You can implement read status logic here
              />
            )
          })}

          {typingUsers.length > 0 && (
            <div className="flex items-center space-x-3 px-4 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={friendImage || ""} />
                <AvatarFallback>{friendName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
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
                <span className="text-sm text-gray-500 dark:text-gray-400">{friendName} is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-600 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600">
                <Paperclip className="h-4 w-4" />
              </Button>

              <Input
                ref={inputRef}
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${friendName}...`}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                disabled={!isConnected}
              />

              <div className="flex items-center space-x-1">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                <VoiceRecorder onVoiceMessage={handleVoiceMessage} />
              </div>
            </div>

            {!isConnected && (
              <p className="text-xs text-red-500 mt-2 px-4">Disconnected from chat server. Trying to reconnect...</p>
            )}
          </div>

          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="h-12 w-12 p-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
