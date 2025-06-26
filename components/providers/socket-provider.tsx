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
    // Connect directly to the Socket.IO server running on port 3001
    const socketInstance = io("http://localhost:3001", {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
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

    socketInstance.io.on("reconnect", () => {
      console.log("Socket reconnected")
      setIsConnected(true)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
}
