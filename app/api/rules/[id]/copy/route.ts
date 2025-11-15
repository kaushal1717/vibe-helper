import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Increment copy count
    const updatedRule = await prisma.cursorRule.update({
      where: { id },
      data: {
        copyCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json({ success: true, copyCount: updatedRule.copyCount })
  } catch (error) {
    console.error("Error incrementing copy count:", error)
    return NextResponse.json(
      { error: "Failed to increment copy count" },
      { status: 500 }
    )
  }
}
