import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RequestFilters } from '@/components/admin/request-filters'
import Link from 'next/link'
import moment from 'moment'

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
  searchParams: Promise<{ status?: string; techStack?: string }>
}

export default async function AdminRequestsPage({ searchParams }: PageProps) {
  await requireAdmin()

  const params = await searchParams
  const statusFilter = params.status || 'all'
  const techStackFilter = params.techStack || 'all'

  // Build where clause for filtering
  const where: any = {}
  if (statusFilter !== 'all') {
    where.status = statusFilter
  }
  if (techStackFilter !== 'all') {
    where.techStack = techStackFilter
  }

  const requests = await prisma.ruleRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  // Get unique tech stacks for filter
  const allRequests = await prisma.ruleRequest.findMany({
    select: { techStack: true },
    distinct: ['techStack'],
  })
  const techStacks = allRequests.map(r => r.techStack).sort()

  // Count by status
  const pendingCount = await prisma.ruleRequest.count({ where: { status: 'PENDING' } })
  const approvedCount = await prisma.ruleRequest.count({ where: { status: 'APPROVED' } })
  const rejectedCount = await prisma.ruleRequest.count({ where: { status: 'REJECTED' } })
  const changesRequestedCount = await prisma.ruleRequest.count({ where: { status: 'CHANGES_REQUESTED' } })

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rule Requests</h1>
          <p className="text-gray-600 mt-2">Review and manage cursor rule requests from users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Changes Requested</CardDescription>
              <CardTitle className="text-3xl">{changesRequestedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl">{approvedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl">{rejectedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <RequestFilters techStacks={techStacks} />

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">No requests match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{request.title}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {formatStatus(request.status)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-4">
                        <span className="font-medium text-primary">{request.techStack}</span>
                        <span>•</span>
                        <span>Submitted {moment(request.createdAt).fromNow()}</span>
                        <span>•</span>
                        <span className="font-mono text-xs">{request.userId.slice(0, 8)}...</span>
                      </CardDescription>
                    </div>
                    <Button asChild>
                      <Link href={`/admin/requests/${request.id}`}>Review</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {request.description && (
                    <p className="text-gray-700">{request.description}</p>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-2">
                      {request.requestText}
                    </p>
                  </div>

                  {request.adminResponse && (
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <span className="font-semibold">Response: </span>
                        {request.adminResponse}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
