import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { createRequest } from '@/app/actions/requests'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function RequestRulePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  async function handleSubmit(formData: FormData) {
    'use server'

    const result = await createRequest(formData)

    if (result.success) {
      redirect('/my-requests')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Request a Cursor Rule</CardTitle>
            <CardDescription>
              Describe the cursor rule you need and our team will create it for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., React Best Practices for TypeScript"
                  required
                  minLength={3}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  Give your request a clear, descriptive title
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="techStack">Tech Stack *</Label>
                <Input
                  id="techStack"
                  name="techStack"
                  placeholder="e.g., React, Next.js, TypeScript"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  What technologies should this rule cover?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Brief Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Optional: Brief description of what you need"
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestText">Detailed Request *</Label>
                <Textarea
                  id="requestText"
                  name="requestText"
                  rows={10}
                  placeholder="Please describe in detail what kind of cursor rule you need. Include:&#10;- What problem you're trying to solve&#10;- Specific patterns or practices you want enforced&#10;- Any examples or reference materials&#10;- Expected behavior and outcomes"
                  required
                  minLength={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  The more details you provide, the better we can create a rule that meets your needs
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Submit Request
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  asChild
                >
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Your request will be reviewed by our admin team</li>
            <li>• We may reach out if we need clarification</li>
            <li>• Once approved, we'll create and publish the rule for you</li>
            <li>• You'll be notified when your rule is ready</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
