import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET all public rules formatted for registry
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const techStack = searchParams.get("techStack")

    const rules = await prisma.cursorRule.findMany({
      where: {
        isPublic: true,
        ...(techStack && { techStack }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        techStack: true,
        tags: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Format as registry list
    return NextResponse.json(
      rules.map((rule) => ({
        name: rule.title.toLowerCase().replace(/\s+/g, "-"),
        id: rule.id,
        description: rule.description || rule.title,
        techStack: rule.techStack,
        tags: rule.tags,
      }))
    )
  } catch (error) {
    console.error("Error fetching registry:", error)
    return NextResponse.json(
      { error: "Failed to fetch registry" },
      { status: 500 }
    )
  }
}

