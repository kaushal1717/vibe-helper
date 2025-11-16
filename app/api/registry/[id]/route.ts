import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const rule = await prisma.cursorRule.findUnique({
      where: { id, isPublic: true },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    // Format as registry item (shadcn-style)
    return NextResponse.json({
      $schema: "https://cursorrules.com/schema.json",
      name: rule.title.toLowerCase().replace(/\s+/g, "-"),
      description: rule.description || rule.title,
      techStack: rule.techStack,
      tags: rule.tags,
      author: rule.user?.name || "Unknown",
      files: [
        {
          type: "cursor-rule",
          path: `.cursor/rules/${rule.techStack.toLowerCase()}.mdc`,
          content: rule.content,
        },
      ],
    })
  } catch (error) {
    console.error("Error fetching rule:", error)
    return NextResponse.json(
      { error: "Failed to fetch rule" },
      { status: 500 }
    )
  }
}

