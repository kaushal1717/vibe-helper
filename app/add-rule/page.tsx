"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createRuleSchema, type CreateRuleInput } from "@/lib/validations/rule"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TagInput } from "@/components/shared/tag-input"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function AddRule() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateRuleInput>({
    resolver: zodResolver(createRuleSchema),
    defaultValues: {
      isPublic: true,
      tags: [],
    },
  })

  const isPublic = watch("isPublic")

  // Redirect to login if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/")
    }
  }, [isSignedIn, isLoaded, router])

  // Update form tags when state changes
  useEffect(() => {
    setValue("tags", tags)
  }, [tags, setValue])

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isSignedIn) {
    return null
  }

  const onSubmit = async (data: CreateRuleInput) => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to create rule")
        setLoading(false)
        return
      }

      toast.success("Rule created successfully!")
      router.push("/")
      router.refresh()
    } catch (error) {
      setError("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Add New Cursor Rule</CardTitle>
            <CardDescription>
              Share your cursor rules with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., React Best Practices"
                  {...register("title")}
                  disabled={loading}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="techStack">Tech Stack *</Label>
                <Input
                  id="techStack"
                  placeholder="e.g., React, Next.js, TypeScript"
                  {...register("techStack")}
                  disabled={loading}
                />
                {errors.techStack && (
                  <p className="text-sm text-red-600">{errors.techStack.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Brief description of the rule"
                  {...register("description")}
                  disabled={loading}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <TagInput
                  tags={tags}
                  onChange={setTags}
                  placeholder="Add tags (press Enter or comma)"
                />
                <p className="text-xs text-muted-foreground">
                  Add relevant tags to help others find your rule
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Cursor Rule Content *</Label>
                <Textarea
                  id="content"
                  rows={12}
                  placeholder="Paste your cursor rule here..."
                  className="font-mono text-sm"
                  {...register("content")}
                  disabled={loading}
                />
                {errors.content && (
                  <p className="text-sm text-red-600">{errors.content.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setValue("isPublic", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  disabled={loading}
                />
                <Label htmlFor="isPublic" className="font-normal cursor-pointer">
                  Make this rule public
                </Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Rule
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
