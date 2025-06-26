"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"

interface GroupMember {
  id: string
  role: string
  user: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface GroupMembersProps {
  groupId: string
  members: GroupMember[]
}

export function GroupMembers({ groupId, members }: GroupMembersProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Users className="h-4 w-4 text-gray-500" />
        <h3 className="font-medium text-gray-900">Members ({members.length})</h3>
      </div>

      <ScrollArea className="h-48">
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.user.image || ""} />
                  <AvatarFallback>{member.user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm text-gray-900">{member.user.name}</p>
                  <p className="text-xs text-gray-500">{member.user.email}</p>
                </div>
              </div>
              <Badge variant={member.role === "admin" ? "default" : "secondary"} className="text-xs">
                {member.role}
              </Badge>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
