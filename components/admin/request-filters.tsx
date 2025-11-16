'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'

interface RequestFiltersProps {
  techStacks: string[]
}

export function RequestFilters({ techStacks }: RequestFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const statusFilter = searchParams.get('status') || 'all'
  const techStackFilter = searchParams.get('techStack') || 'all'

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('status', e.target.value)
    if (e.target.value === 'all') {
      params.delete('status')
    }
    router.push(`/admin/requests?${params.toString()}`)
  }

  const handleTechStackChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('techStack', e.target.value)
    if (e.target.value === 'all') {
      params.delete('techStack')
    }
    router.push(`/admin/requests?${params.toString()}`)
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CHANGES_REQUESTED">Changes Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-medium mb-2 block">Tech Stack</label>
            <select
              value={techStackFilter}
              onChange={handleTechStackChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Tech Stacks</option>
              {techStacks.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
