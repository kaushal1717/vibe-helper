import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { respondToRequest, createRuleFromRequest } from '@/app/actions/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import moment from 'moment'
import { ArrowLeft } from 'lucide-react'

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'APPROVED':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'CHANGES_REQUESTED':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ')
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminRequestDetailPage({ params }: PageProps) {
  await requireAdmin()

  const { id } = await params

  const request = await prisma.ruleRequest.findUnique({
    where: { id },
  })

  if (!request) {
    redirect('/admin/requests')
  }

  async function handleResponse(formData: FormData) {
    'use server'

    const result = await respondToRequest(id, formData)

    if (result.success) {
      redirect('/admin/requests')
    }
  }

  async function handleCreateRule(formData: FormData) {
    'use server'

    const result = await createRuleFromRequest(id, formData)

    if (result.success) {
      redirect('/admin/requests')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/admin/requests">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Requests
          </Link>
        </Button>

        {/* Request Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl">{request.title}</CardTitle>
                  <Badge className={getStatusColor(request.status)}>
                    {formatStatus(request.status)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-4 text-base">
                  <span className="font-medium text-primary">{request.techStack}</span>
                  <span>•</span>
                  <span>Submitted {moment(request.createdAt).fromNow()}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">User ID:</h3>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{request.userId}</code>
            </div>

            {request.description && (
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Description:</h3>
                <p className="text-gray-700">{request.description}</p>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-sm text-gray-700 mb-2">Request Details:</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{request.requestText}</p>
              </div>
            </div>

            {request.adminNotes && (
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Admin Notes (Internal):</h3>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-purple-900 whitespace-pre-wrap">{request.adminNotes}</p>
                </div>
              </div>
            )}

            {request.adminResponse && (
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Previous Response:</h3>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-blue-900 whitespace-pre-wrap">{request.adminResponse}</p>
                  {request.reviewedAt && request.reviewedBy && (
                    <p className="text-xs text-blue-600 mt-2">
                      By {request.reviewedBy.slice(0, 8)}... • {moment(request.reviewedAt).fromNow()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Rule Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create & Publish Rule</CardTitle>
            <CardDescription>
              Create a cursor rule based on this request and publish it immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreateRule} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Rule Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={request.title}
                  required
                  minLength={3}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="techStack">Tech Stack *</Label>
                <Input
                  id="techStack"
                  name="techStack"
                  defaultValue={request.techStack}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={request.description || ''}
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Cursor Rule Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  rows={15}
                  placeholder="Write the actual cursor rule content here..."
                  className="font-mono text-sm"
                  required
                  minLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  This is the actual cursor rule that will be published
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (JSON array)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder='["react", "typescript", "best-practices"]'
                  defaultValue="[]"
                />
                <p className="text-xs text-muted-foreground">
                  Enter tags as a JSON array
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Create & Publish Rule
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Response Form */}
        <Card>
          <CardHeader>
            <CardTitle>Respond to Request</CardTitle>
            <CardDescription>
              Send a response to the user (approve, reject, or request changes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleResponse} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  name="status"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select status...</option>
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                  <option value="CHANGES_REQUESTED">Request Changes</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminResponse">Response to User *</Label>
                <Textarea
                  id="adminResponse"
                  name="adminResponse"
                  rows={6}
                  placeholder="This message will be visible to the user..."
                  required
                  minLength={1}
                />
                <p className="text-xs text-muted-foreground">
                  This response will be visible to the user
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">Internal Notes (Optional)</Label>
                <Textarea
                  id="adminNotes"
                  name="adminNotes"
                  rows={4}
                  placeholder="Internal notes for other admins (not visible to user)..."
                />
                <p className="text-xs text-muted-foreground">
                  These notes are for internal use only and won't be shown to the user
                </p>
              </div>

              <Button type="submit" variant="outline" className="w-full">
                Send Response
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
