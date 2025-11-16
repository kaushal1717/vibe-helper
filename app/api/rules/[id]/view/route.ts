import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    
    // Get client-side tracking info from request body
    let sessionId: string | undefined
    try {
      const body = await request.json()
      sessionId = body.sessionId
    } catch {
      // No body or invalid JSON
    }

    // Check if view already exists
    let existingView = null
    if (userId) {
      existingView = await prisma.view.findFirst({
        where: {
          ruleId: id,
          userId: userId,
        },
      })
    } else if (sessionId) {
      existingView = await prisma.view.findFirst({
        where: {
          ruleId: id,
          sessionId: sessionId,
        },
      })
    }

    // If view doesn't exist, create it
    if (!existingView) {
      await prisma.view.create({
        data: {
          ruleId: id,
          userId: userId || null,
          sessionId: userId ? null : sessionId || null,
        },
      })

      // Update viewCount on rule for quick access
      await prisma.cursorRule.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
    }

    // Get total view count from database
    const viewCount = await prisma.view.count({
      where: { ruleId: id },
    })

    // Sync viewCount on rule with actual count
    await prisma.cursorRule.update({
      where: { id },
      data: {
        viewCount,
      },
    })

    return NextResponse.json({ 
      success: true, 
      viewCount,
      isNewView: !existingView
    })
  } catch (error) {
    console.error("Error tracking view:", error)
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    )
  }
}
