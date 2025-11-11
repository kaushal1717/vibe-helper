import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET all public cursor rules
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const techStack = searchParams.get("techStack")

    const rules = await prisma.cursorRule.findMany({
      where: {
        isPublic: true,
        ...(techStack && { techStack }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error("Error fetching rules:", error)
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    )
  }
}

// POST create new cursor rule (protected)
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, techStack, description, content, isPublic } = await req.json()

    if (!title || !techStack || !content) {
      return NextResponse.json(
        { error: "Title, tech stack, and content are required" },
        { status: 400 }
      )
    }

    const rule = await prisma.cursorRule.create({
      data: {
        title,
        techStack,
        description: description || null,
        content,
        isPublic: isPublic ?? true,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error("Error creating rule:", error)
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    )
  }
}
