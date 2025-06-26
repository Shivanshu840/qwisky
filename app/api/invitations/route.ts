import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invitations = await prisma.invitation.findMany({
      where: {
        receiverId: session.user.id,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error("Error fetching invitations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { receiverId, message } = await req.json()

    // Check if invitation already exists
    const existingInvitation = await prisma.invitation.findUnique({
      where: {
        senderId_receiverId: {
          senderId: session.user.id,
          receiverId,
        },
      },
    })

    if (existingInvitation) {
      return NextResponse.json({ error: "Invitation already sent" }, { status: 400 })
    }

    // Check if they're already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: session.user.id, user2Id: receiverId },
          { user1Id: receiverId, user2Id: session.user.id },
        ],
      },
    })

    if (existingFriendship) {
      return NextResponse.json({ error: "Already friends" }, { status: 400 })
    }

    const invitation = await prisma.invitation.create({
      data: {
        senderId: session.user.id,
        receiverId,
        message,
        type: "FRIEND_REQUEST",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(invitation)
  } catch (error) {
    console.error("Error creating invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
