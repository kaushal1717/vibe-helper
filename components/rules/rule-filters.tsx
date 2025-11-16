"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
    <div className="grid gap-6 md:grid-cols-3 mb-12">
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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
        <Label htmlFor="techStack" className="text-sm font-medium">Filter by technologies</Label>
        <Select value={techStack || "all"} onValueChange={(value) => onTechStackChange(value === "all" ? "" : value)}>
          <SelectTrigger id="techStack" className="w-full">
            <SelectValue placeholder="All Technologies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technologies</SelectItem>
            {techStacks.map((tech) => (
              <SelectItem key={tech} value={tech}>
                {tech}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortBy" className="text-sm font-medium">Sort By</Label>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger id="sortBy" className="w-full">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="likes">Most Liked</SelectItem>
            <SelectItem value="copies">Most Copied</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
