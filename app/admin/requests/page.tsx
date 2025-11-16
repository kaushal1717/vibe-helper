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
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4 tracking-tight">Rule Requests</h1>
          <p className="text-lg text-muted-foreground">Review and manage cursor rule requests from users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-muted-foreground">Pending</CardDescription>
              <CardTitle className="text-4xl font-semibold text-yellow-600 dark:text-yellow-500">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-muted-foreground">Changes Requested</CardDescription>
              <CardTitle className="text-4xl font-semibold text-blue-600 dark:text-blue-500">{changesRequestedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-muted-foreground">Approved</CardDescription>
              <CardTitle className="text-4xl font-semibold text-primary">{approvedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-sm font-medium text-muted-foreground">Rejected</CardDescription>
              <CardTitle className="text-4xl font-semibold text-red-600 dark:text-red-500">{rejectedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <RequestFilters techStacks={techStacks} />

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <h3 className="text-2xl font-semibold text-foreground mb-3">No requests found</h3>
              <p className="text-muted-foreground">No requests match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <CardTitle className="text-2xl font-black tracking-tight">{request.title}</CardTitle>
                        <Badge className={`${getStatusColor(request.status)} font-bold text-xs px-3 py-1`}>
                          {formatStatus(request.status)}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-3 font-medium text-sm">
                        <span className="font-bold text-secondary">{request.techStack}</span>
                        <span className="text-foreground/30">•</span>
                        <span>Submitted {moment(request.createdAt).fromNow()}</span>
                        <span className="text-foreground/30">•</span>
                        <span className="font-mono text-xs bg-foreground/5 px-2 py-1 rounded">{request.userId.slice(0, 8)}...</span>
                      </CardDescription>
                    </div>
                    <Button asChild className="btn-lift bg-secondary hover:bg-mint-hover font-bold">
                      <Link href={`/admin/requests/${request.id}`}>Review</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.description && (
                    <p className="text-foreground/70 font-medium tracking-wide">{request.description}</p>
                  )}

                  <div className="bg-foreground/5 rounded-xl p-4 border border-foreground/10">
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap line-clamp-2 font-medium">
                      {request.requestText}
                    </p>
                  </div>

                  {request.adminResponse && (
                    <div className="glass-panel rounded-xl p-4 border-[1.5px] border-blue-500/30 bg-blue-50/50">
                      <p className="text-sm text-foreground/90 font-semibold">
                        <span className="font-black text-blue-600">Response: </span>
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
