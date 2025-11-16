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
        <Label htmlFor="search">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="text"
            placeholder="Search rules..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="techStack">Filter by Tech Stack</Label>
        <select
          id="techStack"
          value={techStack}
          onChange={(e) => onTechStackChange(e.target.value)}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">All Tech Stacks</option>
          {techStacks.map((tech) => (
            <option key={tech} value={tech}>
              {tech}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortBy">Sort By</Label>
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="likes">Most Liked</option>
          <option value="copies">Most Copied</option>
          <option value="views">Most Viewed</option>
        </select>
      </div>
    </div>
  )
}
