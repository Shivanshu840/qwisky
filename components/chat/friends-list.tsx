"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Friend {
  id: string
  name: string
  email: string
  image?: string
  isOnline: boolean
  lastSeen: string
  friendshipId: string
}

interface FriendsListProps {
  onFriendSelect: (friendId: string, friendName: string) => void
  selectedFriendId?: string
}

export function FriendsList({ onFriendSelect, selectedFriendId }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends")
      if (response.ok) {
        const data = await response.json()
        setFriends(data)
      }
    } catch (error) {
      console.error("Error fetching friends:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex items-center space-x-3 p-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2 px-3 py-2">
        <Users className="h-4 w-4 text-gray-500" />
        <h3 className="font-medium text-gray-900">Friends ({friends.length})</h3>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-1">
          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => onFriendSelect(friend.id, friend.name)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedFriendId === friend.id ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.image || ""} />
                    <AvatarFallback>{friend.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white ${
                      friend.isOnline ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-900 truncate">{friend.name}</p>
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    {friend.isOnline
                      ? "Online"
                      : `Last seen ${formatDistanceToNow(new Date(friend.lastSeen), { addSuffix: true })}`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      {friends.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No friends yet</p>
          <p className="text-xs">Send friend requests to start chatting!</p>
        </div>
      )}
    </div>
  )
}
