import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
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
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            favorites: true,
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
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { title, techStack, description, content, isPublic, tags } = await req.json()

    if (!title || !techStack || !content) {
      return NextResponse.json(
        { error: "Title, tech stack, and content are required" },
        { status: 400 }
      )
    }

    // Find or create user in database
    const user = await prisma.user.upsert({
      where: { user_id: userId },
      update: {},
      create: {
        user_id: userId,
        email: "", // Clerk handles auth, email not required
      },
    })

    const rule = await prisma.cursorRule.create({
      data: {
        title,
        techStack,
        description: description || null,
        content,
        isPublic: isPublic ?? true,
        tags: tags || [],
        userId: user.user_id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            favorites: true,
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
