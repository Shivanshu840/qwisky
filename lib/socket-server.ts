import { Server as ServerIO } from "socket.io"
import { createServer } from "http"

let io: ServerIO | null = null
let httpServer: any = null

export function initializeSocketIO() {
  if (!io) {
    console.log("Creating Socket.IO server...")

    httpServer = createServer()

    io = new ServerIO(httpServer, {
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SITE_URL
            : ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    })

    io.on("connection", (socket) => {
      console.log("User connected:", socket.id)

      socket.on("join-room", (roomId: string) => {
        socket.join(roomId)
        console.log(`User ${socket.id} joined room ${roomId}`)
        socket.to(roomId).emit("user-joined", { userId: socket.id })
      })

      socket.on("leave-room", (roomId: string) => {
        socket.leave(roomId)
        console.log(`User ${socket.id} left room ${roomId}`)
        socket.to(roomId).emit("user-left", { userId: socket.id })
      })

      socket.on("send-message", (data) => {
        console.log("Broadcasting message to room:", data.roomId)
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

    const port = process.env.SOCKET_PORT || 3001
    httpServer.listen(port, () => {
      console.log(`Socket.IO server running on port ${port}`)
    })
  }

  return io
}

export function getSocketIO() {
  return io
}
