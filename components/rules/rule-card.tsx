"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/shared/copy-button"
import { Eye, Copy as CopyIcon, Heart, MessageCircle } from "lucide-react"
import type { CursorRule } from "@/types"
import { toast } from "sonner"

interface RuleCardProps {
  rule: CursorRule
  onCopy?: (ruleId: string, copyCount?: number) => void
  onLikeUpdate?: (ruleId: string, liked: boolean, likeCount: number) => void
  onCopyCountUpdate?: (ruleId: string, copyCount: number) => void
}

export function RuleCard({ rule, onCopy, onLikeUpdate, onCopyCountUpdate }: RuleCardProps) {
  const { isSignedIn } = useUser()
  const [isLiking, setIsLiking] = useState(false)
  const [liked, setLiked] = useState(rule.hasLiked || false)
  const [likeCount, setLikeCount] = useState(rule._count?.likes || 0)
  const [copyCount, setCopyCount] = useState(rule.copyCount || 0)

  // Initialize like state from API if logged in
  useEffect(() => {
    if (isSignedIn && rule.id) {
      fetch(`/api/rules/${rule.id}/like`)
        .then((res) => res.json())
        .then((data) => {
          if (data.liked !== undefined) {
            setLiked(data.liked)
          }
        })
        .catch(() => {
          // Silently fail
        })
    } else {
      setLiked(false)
    }
  }, [isSignedIn, rule.id])

  // Update like count when rule changes
  useEffect(() => {
    setLikeCount(rule._count?.likes || 0)
  }, [rule._count?.likes])

  // Update copy count when rule changes
  useEffect(() => {
    setCopyCount(rule.copyCount || 0)
  }, [rule.copyCount])

  const handleCopy = (copyCount?: number) => {
    onCopy?.(rule.id, copyCount)
  }

  const handleCopyCountUpdate = (newCopyCount: number) => {
    setCopyCount(newCopyCount)
    onCopyCountUpdate?.(rule.id, newCopyCount)
  }

  const handleLike = async () => {
    if (!isSignedIn) {
      toast.error("Please log in to like rules")
      return
    }

    setIsLiking(true)
    try {
      const response = await fetch(`/api/rules/${rule.id}/like`, {
        method: "POST",
      })

      if (response.status === 401) {
        toast.error("Please log in to like rules")
        setIsLiking(false)
        return
      }

      if (!response.ok) {
        throw new Error("Failed to like")
      }

      const data = await response.json()
      setLiked(data.liked)
      setLikeCount(data.likeCount)
      onLikeUpdate?.(rule.id, data.liked, data.likeCount)
      toast.success(data.liked ? "Liked!" : "Unliked")
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("Failed to toggle like")
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="mb-2">
            {rule.techStack}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{rule.viewCount}</span>
          </div>
        </div>
        <Link href={`/rules/${rule.id}`} className="hover:underline">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-1">
            {rule.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="pb-3">
        {rule.description && (
          <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
            {rule.description}
          </p>
        )}

        {rule.tags && rule.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {rule.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {rule.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{rule.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-md">
          <pre className="text-sm text-gray-800 overflow-hidden line-clamp-3 whitespace-pre-wrap">
            {rule.content}
          </pre>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="line-clamp-1">
            By {rule.user?.name || rule.user?.email}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground mr-2">
            {rule._count && (
              <>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{rule._count.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CopyIcon className="h-3 w-3" />
                  <span>{copyCount}</span>
                </div>
              </>
            )}
          </div>
          <CopyButton 
            content={rule.content} 
            onCopy={handleCopy} 
            ruleId={rule.id}
            onCopyCountUpdate={handleCopyCountUpdate}
          />
          {isSignedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${liked ? "bg-red-50" : ""}`}
              title="Like this rule"
            >
              <Heart
                className={`h-4 w-4 ${liked ? "fill-red-600 text-red-600" : ""}`}
              />
              {likeCount}
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Like this rule"
              >
                <Heart className="h-4 w-4" />
                {likeCount}
              </Button>
            </SignInButton>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
