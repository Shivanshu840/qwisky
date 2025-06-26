import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const friendId = searchParams.get("friendId")

    if (!friendId) {
      return NextResponse.json({ error: "Friend ID required" }, { status: 400 })
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: friendId },
          { senderId: friendId, receiverId: session.user.id },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 50,
    })

    // Mark messages as read
    await prisma.directMessage.updateMany({
      where: {
        senderId: friendId,
        receiverId: session.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching direct messages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, receiverId } = await req.json()

    const message = await prisma.directMessage.create({
      data: {
        content,
        senderId: session.user.id,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error creating direct message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
