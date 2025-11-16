import { z } from "zod"

export const createRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  techStack: z.string().min(1, "Tech stack is required"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  requestText: z.string().min(20, "Please provide at least 20 characters describing what you need"),
})

export const adminResponseSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "CHANGES_REQUESTED"]),
  adminResponse: z.string().min(1, "Response is required"),
  adminNotes: z.string().optional(),
})

export const createRuleFromRequestSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  techStack: z.string().min(1, "Tech stack is required"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  tags: z.array(z.string()).default([]),
})

export type CreateRequestInput = z.infer<typeof createRequestSchema>
export type AdminResponseInput = z.infer<typeof adminResponseSchema>
export type CreateRuleFromRequestInput = z.infer<typeof createRuleFromRequestSchema>
