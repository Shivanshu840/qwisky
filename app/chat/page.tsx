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
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { signOut } from "next-auth/react"
import { LogOut, MessageSquare, Users, Mail, Search, Settings } from "lucide-react"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading Qwisky...</div>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/")
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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Qwisky
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeSwitcher />
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger
                  value="groups"
                  className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                >
                  <Users className="h-4 w-4 mr-1" />
                  Groups
                </TabsTrigger>
                <TabsTrigger
                  value="friends"
                  className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Friends
                </TabsTrigger>
                <TabsTrigger
                  value="invitations"
                  className="text-xs relative data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Requests
                  {pendingInvitations > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 text-white">
                      {pendingInvitations}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="search"
                  className="text-xs data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600"
                >
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
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
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
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="h-20 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome to Qwisky</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Connect with friends and join group conversations to get started.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
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
