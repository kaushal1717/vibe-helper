import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

export default async function MyRequestsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const requests = await prisma.ruleRequest.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
            <p className="text-gray-600 mt-2">Track the status of your cursor rule requests</p>
          </div>
          <Button asChild>
            <Link href="/request-rule">New Request</Link>
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests yet</h3>
              <p className="text-gray-600 mb-6">You haven't submitted any cursor rule requests yet.</p>
              <Button asChild>
                <Link href="/request-rule">Submit Your First Request</Link>
              </Button>
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
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {request.description && (
                    <p className="text-gray-700">{request.description}</p>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Your Request:</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-3">
                      {request.requestText}
                    </p>
                  </div>

                  {request.adminResponse && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h4 className="font-semibold text-sm text-blue-900 mb-2">Admin Response:</h4>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {request.adminResponse}
                      </p>
                      {request.reviewedAt && (
                        <p className="text-xs text-blue-600 mt-2">
                          Reviewed {moment(request.reviewedAt).fromNow()}
                        </p>
                      )}
                    </div>
                  )}

                  {request.status === 'PENDING' && (
                    <p className="text-sm text-gray-500 italic">
                      Your request is awaiting review by our admin team.
                    </p>
                  )}

                  {request.status === 'CHANGES_REQUESTED' && (
                    <div className="flex gap-2">
                      <Button size="sm" asChild>
                        <Link href="/request-rule">Submit Updated Request</Link>
                      </Button>
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
