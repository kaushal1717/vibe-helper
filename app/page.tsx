"use client"

import { useEffect, useState, useMemo } from "react"
import { RuleCard } from "@/components/rules/rule-card"
import { RuleFilters } from "@/components/rules/rule-filters"
import { LoadingSpinner } from "@/components/shared/loading-spinner"
import { EmptyState } from "@/components/shared/empty-state"
import type { CursorRule } from "@/types"

export default function Home() {
  const [rules, setRules] = useState<CursorRule[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedTechStack, setSelectedTechStack] = useState<string>("")

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

  const handleCopyRule = async (ruleId: string) => {
    try {
      await fetch(`/api/rules/${ruleId}/copy`, {
        method: "POST",
      })
      // Optionally update the local copy count
      setRules((prevRules) =>
        prevRules.map((rule) =>
          rule.id === ruleId
            ? { ...rule, copyCount: rule.copyCount + 1 }
            : rule
        )
      )
    } catch (error) {
      console.error("Error incrementing copy count:", error)
    }
  }

  // Get unique tech stacks from rules
  const techStacks = useMemo(
    () => Array.from(new Set(rules.map((rule) => rule.techStack))).sort(),
    [rules]
  )

  // Filter rules based on search and tech stack
  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
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
  }, [rules, search, selectedTechStack])

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

        {/* CTA Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Need a custom cursor rule?
              </h3>
              <p className="text-gray-600 text-sm">
                Request a cursor rule and our team will create it for you
              </p>
            </div>
            <a
              href="/request-rule"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap font-medium"
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
          />
        )}

        {/* Rules Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredRules.length === 0 ? (
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
            {filteredRules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} onCopy={handleCopyRule} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
