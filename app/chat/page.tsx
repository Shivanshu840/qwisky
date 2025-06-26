"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/chat/sidebar"
import { ChatArea } from "@/components/chat/chat-area"
import { DirectChatArea } from "@/components/chat/direct-chat-area"
import { FriendsList } from "@/components/chat/friends-list"
import { InvitationsPanel } from "@/components/chat/invitations-panel"
import { EnhancedUserSearch } from "@/components/chat/enhanced-user-search"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { signOut } from "next-auth/react"
import { LogOut, MessageSquare, Users, Mail, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ChatPage() {
  const { data: session, status } = useSession()
  const [selectedRoom, setSelectedRoom] = useState<{ id: string; name: string } | null>(null)
  const [selectedFriend, setSelectedFriend] = useState<{
    id: string
    name: string
    image?: string
    isOnline: boolean
  } | null>(null)
  const [activeTab, setActiveTab] = useState("groups")
  const [pendingInvitations, setPendingInvitations] = useState(0)

  useEffect(() => {
    if (session?.user?.id) {
      // Update user status to online
      fetch("/api/users/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: true }),
      })

      // Set up beforeunload to mark user as offline
      const handleBeforeUnload = () => {
        navigator.sendBeacon("/api/users/status", JSON.stringify({ isOnline: false }))
      }

      window.addEventListener("beforeunload", handleBeforeUnload)
      return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchPendingInvitations()
  }, [])

  const fetchPendingInvitations = async () => {
    try {
      const response = await fetch("/api/invitations")
      if (response.ok) {
        const data = await response.json()
        setPendingInvitations(data.length)
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/auth/signin")
  }

  const handleRoomSelect = (roomId: string, roomName: string) => {
    setSelectedRoom({ id: roomId, name: roomName })
    setSelectedFriend(null)
  }

  const handleFriendSelect = (friendId: string, friendName: string, friendImage?: string, isOnline?: boolean) => {
    setSelectedFriend({ id: friendId, name: friendName, image: friendImage, isOnline: isOnline || false })
    setSelectedRoom(null)
  }

  const handleInvitationUpdate = () => {
    fetchPendingInvitations()
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold">ChatApp</h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{session?.user?.name}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="bg-white text-black"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-50 border-r flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-white p-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="groups" className="text-xs">
                  <Users className="h-4 w-4 mr-1" />
                  Groups
                </TabsTrigger>
                <TabsTrigger value="friends" className="text-xs">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Friends
                </TabsTrigger>
                <TabsTrigger value="invitations" className="text-xs relative">
                  <Mail className="h-4 w-4 mr-1" />
                  Requests
                  {pendingInvitations > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                      {pendingInvitations}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="search" className="text-xs">
                  <Search className="h-4 w-4 mr-1" />
                  Find
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="groups" className="h-full m-0">
                <Sidebar onRoomSelect={handleRoomSelect} selectedRoomId={selectedRoom?.id} />
              </TabsContent>

              <TabsContent value="friends" className="h-full m-0 p-4">
                <FriendsList
                  onFriendSelect={(friendId, friendName) => {
                    // We need to get friend details for the chat
                    fetch("/api/friends")
                      .then((res) => res.json())
                      .then((friends) => {
                        const friend = friends.find((f: any) => f.id === friendId)
                        if (friend) {
                          handleFriendSelect(friendId, friendName, friend.image, friend.isOnline)
                        }
                      })
                  }}
                  selectedFriendId={selectedFriend?.id}
                />
              </TabsContent>

              <TabsContent value="invitations" className="h-full m-0 p-4">
                <InvitationsPanel onInvitationUpdate={handleInvitationUpdate} />
              </TabsContent>

              <TabsContent value="search" className="h-full m-0 p-4">
                <EnhancedUserSearch />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <ChatArea roomId={selectedRoom.id} roomName={selectedRoom.name} />
          ) : selectedFriend ? (
            <DirectChatArea
              friendId={selectedFriend.id}
              friendName={selectedFriend.name}
              friendImage={selectedFriend.image}
              isOnline={selectedFriend.isOnline}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to ChatApp</h3>
                <p className="text-gray-500 mb-4">Connect with friends and join group conversations</p>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Select a room from Groups to join group chats</p>
                  <p>• Choose a friend to start direct messaging</p>
                  <p>• Check Requests for pending friend invitations</p>
                  <p>• Use Find to search and connect with new people</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
