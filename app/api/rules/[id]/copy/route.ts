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

    // Check if copy already exists
    let existingCopy = null
    if (userId) {
      existingCopy = await prisma.copy.findFirst({
        where: {
          ruleId: id,
          userId: userId,
        },
      })
    } else if (sessionId) {
      existingCopy = await prisma.copy.findFirst({
        where: {
          ruleId: id,
          sessionId: sessionId,
        },
      })
    }

    // If copy doesn't exist, create it
    if (!existingCopy) {
      await prisma.copy.create({
        data: {
          ruleId: id,
          userId: userId || null,
          sessionId: userId ? null : sessionId || null,
        },
      })

      // Update copyCount on rule for quick access
      await prisma.cursorRule.update({
        where: { id },
        data: {
          copyCount: {
            increment: 1,
          },
        },
      })
    }

    // Get total copy count from database
    const copyCount = await prisma.copy.count({
      where: { ruleId: id },
    })

    // Sync copyCount on rule with actual count
    await prisma.cursorRule.update({
      where: { id },
      data: {
        copyCount,
      },
    })

    return NextResponse.json({ 
      success: true, 
      copyCount,
      isNewCopy: !existingCopy
    })
  } catch (error) {
    console.error("Error tracking copy:", error)
    return NextResponse.json(
      { error: "Failed to track copy" },
      { status: 500 }
    )
  }
}
