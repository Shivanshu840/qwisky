import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
    })

    const friends = friendships.map((friendship) => {
      const friend = friendship.user1Id === session.user.id ? friendship.user2 : friendship.user1
      return {
        ...friend,
        friendshipId: friendship.id,
      }
    })

    return NextResponse.json(friends)
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
