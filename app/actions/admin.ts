'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireAuth } from '@/lib/permissions'
import { adminResponseSchema, createRuleFromRequestSchema } from '@/lib/validations/request'

export async function getAllRequests(status?: string, techStack?: string) {
  try {
    await requireAdmin()

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    if (techStack && techStack !== 'all') {
      where.techStack = techStack
    }

    const requests = await prisma.ruleRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, requests }
  } catch (error) {
    console.error('Error fetching requests:', error)
    return { success: false, error: 'Failed to fetch requests' }
  }
}

export async function getRequestByIdAdmin(id: string) {
  try {
    await requireAdmin()

    const request = await prisma.ruleRequest.findUnique({
      where: { id },
    })

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    return { success: true, request }
  } catch (error) {
    console.error('Error fetching request:', error)
    return { success: false, error: 'Failed to fetch request' }
  }
}

export async function respondToRequest(requestId: string, formData: FormData) {
  try {
    await requireAdmin()
    const userId = await requireAuth()

    // Parse and validate form data
    const data = {
      status: formData.get('status') as string,
      adminResponse: formData.get('adminResponse') as string,
      adminNotes: formData.get('adminNotes') as string || undefined,
    }

    const validatedData = adminResponseSchema.parse(data)

    // Update the request
    const request = await prisma.ruleRequest.update({
      where: { id: requestId },
      data: {
        status: validatedData.status,
        adminResponse: validatedData.adminResponse,
        adminNotes: validatedData.adminNotes,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    })

    revalidatePath('/admin/requests')
    revalidatePath(`/admin/requests/${requestId}`)
    return { success: true, request }
  } catch (error) {
    console.error('Error responding to request:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to respond to request' }
  }
}

export async function createRuleFromRequest(requestId: string, formData: FormData) {
  try {
    await requireAdmin()
    const userId = await requireAuth()

    // Get the request
    const request = await prisma.ruleRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    // Parse and validate form data for the rule
    const data = {
      title: formData.get('title') as string,
      techStack: formData.get('techStack') as string,
      description: formData.get('description') as string || undefined,
      content: formData.get('content') as string,
      tags: JSON.parse(formData.get('tags') as string || '[]'),
    }

    const validatedData = createRuleFromRequestSchema.parse(data)

    // Upsert user in database (in case they don't exist yet)
    await prisma.user.upsert({
      where: { user_id: request.userId },
      update: {},
      create: {
        user_id: request.userId,
        email: `user-${request.userId}@clerk.user`,
      },
    })

    // Create the cursor rule
    const rule = await prisma.cursorRule.create({
      data: {
        ...validatedData,
        userId: request.userId,
        isPublic: true,
      },
    })

    // Update the request status to approved
    await prisma.ruleRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        adminResponse: `Your rule has been created and published: ${validatedData.title}`,
        reviewedBy: userId,
        reviewedAt: new Date(),
      },
    })

    revalidatePath('/admin/requests')
    revalidatePath(`/admin/requests/${requestId}`)
    revalidatePath('/')
    return { success: true, rule, ruleId: rule.id }
  } catch (error) {
    console.error('Error creating rule from request:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create rule' }
  }
}
