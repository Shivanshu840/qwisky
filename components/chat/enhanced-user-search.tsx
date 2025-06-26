"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, UserPlus, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface User {
  id: string
  name: string
  email: string
  image?: string
}

export function EnhancedUserSearch() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [invitingUsers, setInvitingUsers] = useState<Set<string>>(new Set())
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [inviteMessage, setInviteMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchUsers()
      } else {
        setUsers([])
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const searchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users?search=${encodeURIComponent(searchTerm)}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error searching users:", error)
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async () => {
    if (!selectedUser) return

    try {
      setInvitingUsers((prev) => new Set(prev).add(selectedUser.id))

      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: selectedUser.id,
          message: inviteMessage.trim() || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Friend request sent!",
          description: `Your friend request has been sent to ${selectedUser.name}`,
        })
        setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id))
        setIsDialogOpen(false)
        setInviteMessage("")
        setSelectedUser(null)
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to send friend request",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending friend request:", error)
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      })
    } finally {
      setInvitingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(selectedUser.id)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search people to connect with..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white border-gray-300"
        />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-pulse text-gray-500">Searching users...</div>
        </div>
      )}

      {users.length > 0 && (
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Dialog
                  open={isDialogOpen && selectedUser?.id === user.id}
                  onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) {
                      setSelectedUser(null)
                      setInviteMessage("")
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                      disabled={invitingUsers.has(user.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {invitingUsers.has(user.id) ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Send Friend Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="inviteMessage" className="text-gray-700">
                          Message (Optional)
                        </Label>
                        <Textarea
                          id="inviteMessage"
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          placeholder="Hi! I'd like to connect with you..."
                          className="bg-white border-gray-300"
                          rows={3}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={sendFriendRequest}
                          disabled={invitingUsers.has(user.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                        >
                          {invitingUsers.has(user.id) ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Send Request
                            </>
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {searchTerm && !loading && users.length === 0 && (
        <div className="text-center py-4 text-gray-500">No users found matching "{searchTerm}"</div>
      )}
    </div>
  )
}
