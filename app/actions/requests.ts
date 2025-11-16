'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/permissions'
import { createRequestSchema } from '@/lib/validations/request'

export async function createRequest(formData: FormData) {
  try {
    // Ensure user is authenticated
    const userId = await requireAuth()

    // Parse and validate form data
    const data = {
      title: formData.get('title') as string,
      techStack: formData.get('techStack') as string,
      description: formData.get('description') as string || undefined,
      requestText: formData.get('requestText') as string,
    }

    const validatedData = createRequestSchema.parse(data)

    // Create the request
    const request = await prisma.ruleRequest.create({
      data: {
        ...validatedData,
        userId,
        status: 'PENDING',
      },
    })

    revalidatePath('/my-requests')
    return { success: true, requestId: request.id }
  } catch (error) {
    console.error('Error creating request:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create request' }
  }
}

export async function getUserRequests() {
  try {
    const userId = await requireAuth()

    const requests = await prisma.ruleRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, requests }
  } catch (error) {
    console.error('Error fetching user requests:', error)
    return { success: false, error: 'Failed to fetch requests' }
  }
}

export async function getRequestById(id: string) {
  try {
    const userId = await requireAuth()

    const request = await prisma.ruleRequest.findUnique({
      where: { id },
    })

    if (!request) {
      return { success: false, error: 'Request not found' }
    }

    // Ensure user can only view their own requests
    if (request.userId !== userId) {
      return { success: false, error: 'Unauthorized' }
    }

    return { success: true, request }
  } catch (error) {
    console.error('Error fetching request:', error)
    return { success: false, error: 'Failed to fetch request' }
  }
}
