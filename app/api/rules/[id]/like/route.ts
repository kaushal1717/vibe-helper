import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to like rules." },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if rule exists
    const rule = await prisma.cursorRule.findUnique({
      where: { id },
    })

    if (!rule) {
      return NextResponse.json(
        { error: "Rule not found" },
        { status: 404 }
      )
    }

    // Check if user already liked this rule
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_ruleId: {
          userId,
          ruleId: id,
        },
      },
    })

    if (existingLike) {
      // Unlike: remove the like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      // Get updated like count
      const likeCount = await prisma.like.count({
        where: { ruleId: id },
      })

      return NextResponse.json({
        success: true,
        liked: false,
        likeCount,
      })
    } else {
      // Like: create new like
      await prisma.like.create({
        data: {
          userId,
          ruleId: id,
        },
      })

      // Get updated like count
      const likeCount = await prisma.like.count({
        where: { ruleId: id },
      })

      return NextResponse.json({
        success: true,
        liked: true,
        likeCount,
      })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    )
  }
}

// GET to check if user has liked the rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ liked: false })
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_ruleId: {
          userId,
          ruleId: id,
        },
      },
    })

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error("Error checking like status:", error)
    return NextResponse.json({ liked: false })
  }
}

