const { Server } = require("socket.io")
const { createServer } = require("http")

const httpServer = createServer()
const io = new Server(httpServer, {
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

  // Group chat events
  socket.on("join-room", (roomId) => {
    socket.join(roomId)
    console.log(`User ${socket.id} joined room ${roomId}`)
    socket.to(roomId).emit("user-joined", { userId: socket.id })
  })

  socket.on("leave-room", (roomId) => {
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

  // Direct message events
  socket.on("send-direct-message", (data) => {
    console.log("Broadcasting direct message to room:", data.roomId)
    // Broadcast the message to the specific room
    socket.to(data.roomId).emit("receive-direct-message", data)
  })

  socket.on("typing-direct", (data) => {
    console.log("User typing in direct chat:", data.userId, "in room:", data.roomId)
    socket.to(data.roomId).emit("user-typing-direct", data)
  })

  socket.on("stop-typing-direct", (data) => {
    console.log("User stopped typing in direct chat:", data.userId, "in room:", data.roomId)
    socket.to(data.roomId).emit("user-stop-typing-direct", data)
  })

  // User status events
  socket.on("user-online", (userId) => {
    socket.broadcast.emit("user-status-change", { userId, isOnline: true })
  })

  socket.on("user-offline", (userId) => {
    socket.broadcast.emit("user-status-change", { userId, isOnline: false })
  })

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id)
  })
})

const port = process.env.SOCKET_PORT || 3001
httpServer.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`)
})
