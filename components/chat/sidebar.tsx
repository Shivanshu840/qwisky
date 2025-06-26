"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Users, MessageSquare } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserSearch } from "./user-search"
import { GroupMembers } from "./group-members"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Group {
  id: string
  name: string
  description?: string
  rooms: Room[]
  members: Array<{
    user: {
      id: string
      name: string
      image?: string
    }
  }>
}

interface Room {
  id: string
  name: string
  description?: string
}

interface SidebarProps {
  onRoomSelect: (roomId: string, roomName: string) => void
  selectedRoomId?: string
}

export function Sidebar({ onRoomSelect, selectedRoomId }: SidebarProps) {
  const { data: session } = useSession()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupDescription, setNewGroupDescription] = useState("")
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomDescription, setNewRoomDescription] = useState("")
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false)
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch("/api/groups")
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
    } finally {
      setLoading(false)
    }
  }

  const createGroup = async () => {
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDescription,
        }),
      })

      if (response.ok) {
        const newGroup = await response.json()
        setGroups([...groups, newGroup])
        setNewGroupName("")
        setNewGroupDescription("")
        setIsGroupDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }

  const createRoom = async () => {
    if (!selectedGroupId) return

    try {
      const response = await fetch(`/api/groups/${selectedGroupId}/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRoomName,
          description: newRoomDescription,
        }),
      })

      if (response.ok) {
        const newRoom = await response.json()
        setGroups(
          groups.map((group) =>
            group.id === selectedGroupId ? { ...group, rooms: [...group.rooms, newRoom] } : group,
          ),
        )
        setNewRoomName("")
        setNewRoomDescription("")
        setSelectedGroupId("")
        setIsRoomDialogOpen(false)
      }
    } catch (error) {
      console.error("Error creating room:", error)
    }
  }

  if (loading) {
    return (
      <div className="w-64 bg-gray-50 border-r p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-gray-50 border-r flex flex-col">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-gray-900">Chat Groups</h2>
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName" className="text-gray-700">
                    Group Name
                  </Label>
                  <Input
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name"
                    className="bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor="groupDescription" className="text-gray-700">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="groupDescription"
                    value={newGroupDescription}
                    onChange={(e) => setNewGroupDescription(e.target.value)}
                    placeholder="Enter group description"
                    className="bg-white border-gray-300"
                  />
                </div>
                <Button
                  onClick={createGroup}
                  disabled={!newGroupName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-sm text-gray-900">{group.name}</span>
                </div>
                <Dialog
                  open={isRoomDialogOpen && selectedGroupId === group.id}
                  onOpenChange={(open) => {
                    setIsRoomDialogOpen(open)
                    if (!open) setSelectedGroupId("")
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedGroupId(group.id)}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Manage {group.name}</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="create-room" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="create-room">Create Room</TabsTrigger>
                        <TabsTrigger value="invite-users">Invite Users</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                      </TabsList>

                      <TabsContent value="create-room" className="space-y-4">
                        <div>
                          <Label htmlFor="roomName" className="text-gray-700">
                            Room Name
                          </Label>
                          <Input
                            id="roomName"
                            value={newRoomName}
                            onChange={(e) => setNewRoomName(e.target.value)}
                            placeholder="Enter room name"
                            className="bg-white border-gray-300"
                          />
                        </div>
                        <div>
                          <Label htmlFor="roomDescription" className="text-gray-700">
                            Description (Optional)
                          </Label>
                          <Textarea
                            id="roomDescription"
                            value={newRoomDescription}
                            onChange={(e) => setNewRoomDescription(e.target.value)}
                            placeholder="Enter room description"
                            className="bg-white border-gray-300"
                          />
                        </div>
                        <Button
                          onClick={createRoom}
                          disabled={!newRoomName.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                        >
                          Create Room
                        </Button>
                      </TabsContent>

                      <TabsContent value="invite-users">
                        <UserSearch groupId={group.id} onUserInvited={fetchGroups} />
                      </TabsContent>

                      <TabsContent value="members">
                        <GroupMembers groupId={group.id} members={group.members} />
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="ml-6 space-y-1">
                {group.rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => onRoomSelect(room.id, room.name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center space-x-2 transition-colors ${
                      selectedRoomId === room.id ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>{room.name}</span>
                  </button>
                ))}
              </div>

              {group !== groups[groups.length - 1] && <Separator className="bg-gray-200" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
