"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface CursorRule {
  id: string
  title: string
  techStack: string
  description: string | null
  content: string
  createdAt: string
  user: {
    name: string | null
    email: string
  }
}

export default function Home() {
  const [rules, setRules] = useState<CursorRule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTechStack, setSelectedTechStack] = useState<string>("")

  useEffect(() => {
    fetchRules()
  }, [selectedTechStack])

  const fetchRules = async () => {
    try {
      const url = selectedTechStack
        ? `/api/rules?techStack=${selectedTechStack}`
        : `/api/rules`
      const response = await fetch(url)
      const data = await response.json()
      setRules(data)
    } catch (error) {
      console.error("Error fetching rules:", error)
    } finally {
      setLoading(false)
    }
  }

  const techStacks = Array.from(new Set(rules.map((rule) => rule.techStack)))

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cursor Rules Library
          </h1>
          <p className="text-lg text-gray-600">
            Discover and share cursor rules for your favorite tech stacks
          </p>
        </div>

        {/* Filter */}
        {techStacks.length > 0 && (
          <div className="mb-8">
            <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Tech Stack
            </label>
            <select
              id="techStack"
              value={selectedTechStack}
              onChange={(e) => setSelectedTechStack(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Tech Stacks</option>
              {techStacks.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rules Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading rules...</p>
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No cursor rules found.</p>
            <Link
              href="/add-rule"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Be the first to add one!
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                    {rule.techStack}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {rule.title}
                </h3>
                {rule.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {rule.description}
                  </p>
                )}
                <div className="mb-4">
                  <pre className="bg-gray-50 p-3 rounded text-sm text-gray-800 overflow-hidden line-clamp-4">
                    {rule.content}
                  </pre>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>By {rule.user.name || rule.user.email}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(rule.content)
                      alert("Rule copied to clipboard!")
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
