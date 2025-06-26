"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export const useSocket = () => {
  return useContext(SocketContext)
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize Socket.IO server first
    fetch("/api/socketio")
      .then(() => {
        console.log("Socket.IO server initialized")

        // Connect to Socket.IO server
        const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001", {
          transports: ["websocket", "polling"],
          upgrade: true,
          rememberUpgrade: true,
        })

        socketInstance.on("connect", () => {
          console.log("Socket connected:", socketInstance.id)
          setIsConnected(true)
        })

        socketInstance.on("disconnect", (reason) => {
          console.log("Socket disconnected:", reason)
          setIsConnected(false)
        })

        socketInstance.on("connect_error", (error) => {
          console.error("Socket connection error:", error)
          setIsConnected(false)
        })

        setSocket(socketInstance)

        return () => {
          socketInstance.disconnect()
        }
      })
      .catch((error) => {
        console.error("Failed to initialize Socket.IO:", error)
      })
  }, [])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}
