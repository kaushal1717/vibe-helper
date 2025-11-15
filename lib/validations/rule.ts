import { z } from "zod"

export const createRuleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  techStack: z.string().min(1, "Tech stack is required"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  isPublic: z.boolean(),
  tags: z.array(z.string()),
})

export const updateRuleSchema = createRuleSchema.partial()

export type CreateRuleInput = z.infer<typeof createRuleSchema>
export type UpdateRuleInput = z.infer<typeof updateRuleSchema>
