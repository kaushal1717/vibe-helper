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
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Header */}
        <div className="text-center mb-16 slide-up">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight leading-[1.1]">
            Cursorize
          </h1>
          <p className="text-xl md:text-2xl font-medium text-foreground/60 max-w-3xl mx-auto mb-8 leading-relaxed tracking-wide italic">
            Discover and share cursor rules for your favorite tech stacks
          </p>
          <div className="glass-panel inline-flex items-center gap-8 px-12 py-6 rounded-full shadow-xl border-[1.5px] border-white/60">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black bg-gradient-to-br from-secondary to-secondary/60 bg-clip-text text-transparent dark:neon-glow">{rules.length}</span>
              <span className="text-xs font-extrabold text-foreground/50 uppercase tracking-[0.2em]">Rules</span>
            </div>
            <div className="h-12 w-[2px] bg-gradient-to-b from-transparent via-foreground/20 to-transparent" />
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black bg-gradient-to-br from-secondary to-secondary/60 bg-clip-text text-transparent dark:neon-glow">{techStacks.length}</span>
              <span className="text-xs font-extrabold text-foreground/50 uppercase tracking-[0.2em]">Tech Stacks</span>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mb-12 glass-panel hover-glow rounded-2xl p-8 shadow-2xl border-[1.5px] border-white/60">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight">
                Need a custom cursor rule?
              </h3>
              <p className="text-foreground/60 text-lg font-medium tracking-wide">
                Request a cursor rule and our team will create it for you
              </p>
            </div>
            <a
              href="/request-rule"
              className="btn-lift px-8 py-3.5 bg-secondary text-secondary-foreground rounded-xl hover:bg-mint-hover transition-all duration-300 whitespace-nowrap font-bold shadow-lg text-base"
            >
              Request a Rule
            </a>
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
