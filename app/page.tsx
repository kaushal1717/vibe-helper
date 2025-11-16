"use client"

import { useEffect, useState, useMemo } from "react"
import { RuleCard } from "@/components/rules/rule-card"
import { RuleFilters } from "@/components/rules/rule-filters"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import type { CursorRule } from "@/types"

type SortOption = "newest" | "oldest" | "likes" | "copies" | "views"

export default function Home() {
  const [rules, setRules] = useState<CursorRule[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTechStack, setSelectedTechStack] = useState<string>("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      const response = await fetch("/api/rules")
      const data = await response.json()
      setRules(data)
    } catch (error) {
      console.error("Error fetching rules:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyRule = (ruleId: string, copyCount?: number) => {
    // Update copy count in UI
    if (copyCount !== undefined) {
      setRules((prevRules) =>
        prevRules.map((rule) =>
          rule.id === ruleId
            ? { ...rule, copyCount }
            : rule
        )
      )
    }
  }

  const handleCopyCountUpdate = (ruleId: string, copyCount: number) => {
    setRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === ruleId
          ? { ...rule, copyCount }
          : rule
      )
    )
  }

  const handleLikeUpdate = (ruleId: string, liked: boolean, likeCount: number) => {
    setRules((prevRules) =>
      prevRules.map((rule) =>
        rule.id === ruleId
          ? {
              ...rule,
              hasLiked: liked,
              _count: rule._count
                ? {
                    ...rule._count,
                    likes: likeCount,
                  }
                : {
                    likes: likeCount,
                    comments: 0,
                    favorites: 0,
                  },
            }
          : rule
      )
    )
  }

  // Get unique tech stacks from rules
  const techStacks = useMemo(
    () => Array.from(new Set(rules.map((rule) => rule.techStack))).sort(),
    [rules]
  )

  // Filter and sort rules
  const filteredAndSortedRules = useMemo(() => {
    let filtered = rules.filter((rule) => {
      const matchesSearch =
        search === "" ||
        rule.title.toLowerCase().includes(search.toLowerCase()) ||
        rule.description?.toLowerCase().includes(search.toLowerCase()) ||
        rule.content.toLowerCase().includes(search.toLowerCase()) ||
        rule.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))

      const matchesTechStack =
        selectedTechStack === "" || rule.techStack === selectedTechStack

      return matchesSearch && matchesTechStack
    })

    // Sort rules
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "likes":
          return (b._count?.likes || 0) - (a._count?.likes || 0)
        case "copies":
          return b.copyCount - a.copyCount
        case "views":
          return b.viewCount - a.viewCount
        default:
          return 0
      }
    })

    return filtered
  }, [rules, search, selectedTechStack, sortBy])

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cursor Rules Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover and share cursor rules for your favorite tech stacks
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
            <div>
              <span className="font-semibold text-gray-900">{rules.length}</span> rules
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div>
              <span className="font-semibold text-gray-900">{techStacks.length}</span> tech stacks
            </div>
          </div>
        </div>

        {/* Filters */}
        {techStacks.length > 0 && (
          <RuleFilters
            search={search}
            onSearchChange={setSearch}
            techStack={selectedTechStack}
            onTechStackChange={setSelectedTechStack}
            techStacks={techStacks}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        )}

        {/* Rules Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredAndSortedRules.length === 0 ? (
          <EmptyState
            title={search || selectedTechStack ? "No matching rules found" : "No cursor rules found"}
            description={
              search || selectedTechStack
                ? "Try adjusting your filters"
                : "Be the first to add one!"
            }
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedRules.map((rule) => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onCopy={handleCopyRule}
                onLikeUpdate={handleLikeUpdate}
                onCopyCountUpdate={handleCopyCountUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
