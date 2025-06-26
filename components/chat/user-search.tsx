"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, UserPlus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  image?: string
}

interface UserSearchProps {
  groupId: string
  onUserInvited: () => void
}

export function UserSearch({ groupId, onUserInvited }: UserSearchProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [invitingUsers, setInvitingUsers] = useState<Set<string>>(new Set())
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

  const inviteUser = async (userId: string) => {
    try {
      setInvitingUsers((prev) => new Set(prev).add(userId))

      const response = await fetch(`/api/groups/${groupId}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User invited to group successfully",
        })
        onUserInvited()
        // Remove user from search results
        setUsers((prev) => prev.filter((user) => user.id !== userId))
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error || "Failed to invite user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error inviting user:", error)
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive",
      })
    } finally {
      setInvitingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
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
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => inviteUser(user.id)}
                  disabled={invitingUsers.has(user.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {invitingUsers.has(user.id) ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Invite
                    </>
                  )}
                </Button>
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
