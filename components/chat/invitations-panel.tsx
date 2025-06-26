"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Check, X, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface Invitation {
  id: string
  message?: string
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
    image?: string
  }
}

interface InvitationsPanelProps {
  onInvitationUpdate: () => void
}

export function InvitationsPanel({ onInvitationUpdate }: InvitationsPanelProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/invitations")
      if (response.ok) {
        const data = await response.json()
        setInvitations(data)
      }
    } catch (error) {
      console.error("Error fetching invitations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvitation = async (invitationId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      setProcessingIds((prev) => new Set(prev).add(invitationId))

      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitationId))
        toast({
          title: status === "ACCEPTED" ? "Friend request accepted!" : "Friend request rejected",
          description:
            status === "ACCEPTED" ? "You can now chat with your new friend" : "The request has been declined",
        })
        onInvitationUpdate()
      } else {
        throw new Error("Failed to update invitation")
      }
    } catch (error) {
      console.error("Error handling invitation:", error)
      toast({
        title: "Error",
        description: "Failed to process invitation",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(invitationId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Mail className="h-4 w-4 text-gray-500" />
        <h3 className="font-medium text-gray-900">Friend Requests ({invitations.length})</h3>
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <div key={invitation.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={invitation.sender.image || ""} />
                  <AvatarFallback>{invitation.sender.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900">{invitation.sender.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{invitation.sender.email}</p>
                  {invitation.message && <p className="text-sm text-gray-700 mb-3 italic">"{invitation.message}"</p>}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleInvitation(invitation.id, "ACCEPTED")}
                      disabled={processingIds.has(invitation.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingIds.has(invitation.id) ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleInvitation(invitation.id, "REJECTED")}
                      disabled={processingIds.has(invitation.id)}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {invitations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Mail className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No pending invitations</p>
        </div>
      )}
    </div>
  )
}
