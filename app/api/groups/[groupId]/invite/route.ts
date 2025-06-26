import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { groupId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = await req.json()
    const { groupId } = params

    // Check if current user is admin of the group
    const membership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: session.user.id,
          groupId,
        },
      },
    })

    if (!membership || membership.role !== "admin") {
      return NextResponse.json({ error: "Only group admins can invite users" }, { status: 403 })
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member of this group" }, { status: 400 })
    }

    // Add user to group
    const newMember = await prisma.groupMember.create({
      data: {
        userId,
        groupId,
        role: "member",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(newMember)
  } catch (error) {
    console.error("Error inviting user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
