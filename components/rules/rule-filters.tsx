"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

type SortOption = "newest" | "oldest" | "likes" | "copies" | "views"

interface RuleFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  techStack: string
  onTechStackChange: (value: string) => void
  techStacks: string[]
  sortBy: SortOption
  onSortChange: (value: SortOption) => void
}

export function RuleFilters({
  search,
  onSearchChange,
  techStack,
  onTechStackChange,
  techStacks,
  sortBy,
  onSortChange,
}: RuleFiltersProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <div className="space-y-2">
        <Label htmlFor="search" className="font-semibold text-foreground/80">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/50" />
          <Input
            id="search"
            type="text"
            placeholder="Search rules..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 glass-panel border-white/40 focus:border-secondary/50 focus:ring-secondary/30 font-medium"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack" className="font-semibold text-foreground/80">Filter by Tech Stack</Label>
        <select
          id="techStack"
          value={techStack}
          onChange={(e) => onTechStackChange(e.target.value)}
          className="glass-panel flex h-9 w-full items-center justify-between rounded-md border-2 border-white/40 px-3 py-2 text-sm font-semibold text-foreground shadow-md focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all duration-200 hover:border-secondary/30"
        >
          <option value="" className="bg-white text-foreground font-semibold">All Tech Stacks</option>
          {techStacks.map((tech) => (
            <option key={tech} value={tech} className="bg-white text-foreground font-semibold">
              {tech}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortBy" className="font-semibold text-foreground/80">Sort By</Label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="glass-panel flex h-9 w-full items-center justify-between rounded-md border-2 border-white/40 px-3 py-2 text-sm font-semibold text-foreground shadow-md focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition-all duration-200 hover:border-secondary/30"
        >
          <option value="newest" className="bg-white text-foreground font-semibold">Newest First</option>
          <option value="oldest" className="bg-white text-foreground font-semibold">Oldest First</option>
          <option value="likes" className="bg-white text-foreground font-semibold">Most Liked</option>
          <option value="copies" className="bg-white text-foreground font-semibold">Most Copied</option>
          <option value="views" className="bg-white text-foreground font-semibold">Most Viewed</option>
        </select>
      </div>
    </div>
  )
}
