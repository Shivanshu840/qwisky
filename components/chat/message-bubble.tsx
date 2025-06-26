"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { VoiceMessage } from "@/components/ui/voice-message"
import { formatDistanceToNow } from "date-fns"
import { Check, CheckCheck } from "lucide-react"

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    createdAt: string
    user?: {
      id: string
      name: string
      image?: string
    }
    sender?: {
      id: string
      name: string
      image?: string
    }
    type?: "text" | "voice"
    audioUrl?: string
    duration?: number
  }
  isOwn: boolean
  showAvatar?: boolean
  isRead?: boolean
}

export function MessageBubble({ message, isOwn, showAvatar = true, isRead = false }: MessageBubbleProps) {
  const user = message.user || message.sender
  const isVoiceMessage = message.type === "voice" || message.content.startsWith("🎤")

  return (
    <div className={`flex items-end space-x-2 mb-4 ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 mb-1">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="text-xs">{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender Name (only for group chats and not own messages) */}
        {!isOwn && showAvatar && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">{user?.name}</span>
        )}

        {/* Message Bubble */}
        <div className="relative">
          {isVoiceMessage && message.audioUrl ? (
            <VoiceMessage
              audioUrl={message.audioUrl}
              duration={message.duration || 0}
              timestamp={message.createdAt}
              isOwn={isOwn}
            />
          ) : (
            <div
              className={`px-4 py-2 rounded-2xl shadow-sm ${
                isOwn
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed break-words">{message.content}</p>
            </div>
          )}

          {/* Message Tail */}
          <div
            className={`absolute bottom-0 w-3 h-3 ${
              isOwn
                ? "-right-1 bg-gradient-to-br from-blue-500 to-purple-600"
                : "-left-1 bg-white dark:bg-gray-800 border-l border-b border-gray-200 dark:border-gray-700"
            } transform rotate-45`}
          />
        </div>

        {/* Message Info */}
        <div className={`flex items-center space-x-1 mt-1 px-3 ${isOwn ? "flex-row-reverse space-x-reverse" : ""}`}>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>

          {/* Read Status (only for own messages) */}
          {isOwn && (
            <div className="text-gray-500 dark:text-gray-400">
              {isRead ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />}
            </div>
          )}
        </div>
      </div>

      {/* Spacer for own messages */}
      {isOwn && <div className="w-8" />}
    </div>
  )
}
