import { type NextRequest, NextResponse } from "next/server"
import { Server as ServerIO } from "socket.io"
import { createServer } from "http"

let io: ServerIO

export async function GET(req: NextRequest) {
  if (!io) {
    try {
      const httpServer = createServer()
      io = new ServerIO(httpServer, {
        path: "/api/socketio",
        addTrailingSlash: false,
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      })

      io.on("connection", (socket) => {
        console.log("User connected:", socket.id)

        socket.on("join-room", (roomId: string) => {
          socket.join(roomId)
          console.log(`User ${socket.id} joined room ${roomId}`)
        })

        socket.on("leave-room", (roomId: string) => {
          socket.leave(roomId)
          console.log(`User ${socket.id} left room ${roomId}`)
        })

        socket.on("send-message", (data) => {
          socket.to(data.roomId).emit("receive-message", data)
        })

        socket.on("typing", (data) => {
          socket.to(data.roomId).emit("user-typing", data)
        })

        socket.on("stop-typing", (data) => {
          socket.to(data.roomId).emit("user-stop-typing", data)
        })

        socket.on("disconnect", () => {
          console.log("User disconnected:", socket.id)
        })
      })

      console.log("Socket.IO server initialized")
    } catch (error) {
      console.error("Failed to initialize Socket.IO:", error)
      return NextResponse.json({ error: "Failed to initialize Socket.IO" }, { status: 500 })
    }
  }

  return NextResponse.json({ message: "Socket.IO server running" }, { status: 200 })
}
