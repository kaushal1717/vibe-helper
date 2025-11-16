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
    <Card className="mb-8 glass-panel border-[1.5px] border-white/60 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/70 mb-3 block">Status</label>
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="glass-panel w-full px-4 py-2.5 border-2 border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/50 font-semibold text-foreground transition-all duration-200 hover:border-secondary/30 cursor-pointer shadow-md"
            >
              <option value="all" className="bg-white text-foreground font-semibold">All Statuses</option>
              <option value="PENDING" className="bg-white text-foreground font-semibold">Pending</option>
              <option value="CHANGES_REQUESTED" className="bg-white text-foreground font-semibold">Changes Requested</option>
              <option value="APPROVED" className="bg-white text-foreground font-semibold">Approved</option>
              <option value="REJECTED" className="bg-white text-foreground font-semibold">Rejected</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground/70 mb-3 block">Tech Stack</label>
            <select
              value={techStackFilter}
              onChange={handleTechStackChange}
              className="glass-panel w-full px-4 py-2.5 border-2 border-white/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/50 font-semibold text-foreground transition-all duration-200 hover:border-secondary/30 cursor-pointer shadow-md"
            >
              <option value="all" className="bg-white text-foreground font-semibold">All Tech Stacks</option>
              {techStacks.map((tech) => (
                <option key={tech} value={tech} className="bg-white text-foreground font-semibold">
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
