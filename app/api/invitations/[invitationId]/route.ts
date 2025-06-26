import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: NextRequest, { params }: { params: { invitationId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { status } = await req.json()
    const { invitationId } = params

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        sender: true,
        receiver: true,
      },
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    if (invitation.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized to respond to this invitation" }, { status: 403 })
    }

    // Update invitation status
    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status },
    })

    // If accepted, create friendship
    if (status === "ACCEPTED") {
      await prisma.friendship.create({
        data: {
          user1Id: invitation.senderId,
          user2Id: invitation.receiverId,
        },
      })
    }

    return NextResponse.json(updatedInvitation)
  } catch (error) {
    console.error("Error updating invitation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
