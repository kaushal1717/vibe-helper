import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rule = await prisma.cursorRule.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
            favorites: true,
          },
        },
      },
    })

    if (!rule) {
      return NextResponse.json(
        { error: "Rule not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(rule)
  } catch (error) {
    console.error("Error fetching rule:", error)
    return NextResponse.json(
      { error: "Failed to fetch rule" },
      { status: 500 }
    )
  }
}
