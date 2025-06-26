import { type NextRequest, NextResponse } from "next/server"
import { initializeSocketIO } from "@/lib/socket-server"

export async function GET(req: NextRequest) {
  try {
    const io = initializeSocketIO()

    return NextResponse.json({
      message: "Socket.IO server initialized successfully",
      status: "running",
    })
  } catch (error) {
    console.error("Failed to initialize Socket.IO:", error)
    return NextResponse.json({ error: "Failed to initialize Socket.IO server" }, { status: 500 })
  }
}
