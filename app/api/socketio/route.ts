import { type NextRequest, NextResponse } from "next/server"
import { Server as ServerIO } from "socket.io"
import { Server as NetServer } from "http"
import type { Server as HTTPSServer } from "https"

type NextApiResponseServerIO = NextResponse & {
  socket: {
    server:
      | NetServer
      | (HTTPSServer & {
          io: ServerIO
        })
  }
}

let io: ServerIO | undefined

export async function GET(req: NextRequest) {
  if (!io) {
    console.log("Initializing Socket.IO server...")

    // Create HTTP server for Socket.IO
    const httpServer = new NetServer()

    io = new ServerIO(httpServer, {
      path: "/api/socketio",
      addTrailingSlash: false,
      cors: {
        origin:
          process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_SITE_URL
            : ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
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

    // Start the HTTP server on a different port for Socket.IO
    const port = process.env.SOCKET_PORT || 3001
    httpServer.listen(port, () => {
      console.log(`Socket.IO server running on port ${port}`)
    })
  }

  return NextResponse.json({
    message: "Socket.IO server initialized",
    status: "ok",
    path: "/api/socketio",
  })
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: "Socket.IO server running" })
}
