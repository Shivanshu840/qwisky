"use client"

import { useSocket } from "@/components/providers/socket-provider"
import { Badge } from "@/components/ui/badge"

export function SocketStatus() {
  const { socket, isConnected } = useSocket()

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <Badge variant={isConnected ? "default" : "destructive"} className="px-3 py-1">
        Socket: {isConnected ? "Connected" : "Disconnected"}
      </Badge>
      {socket && (
        <Badge variant="secondary" className="px-3 py-1 text-xs">
          ID: {socket.id?.slice(0, 8) || "N/A"}
        </Badge>
      )}
    </div>
  )
}
