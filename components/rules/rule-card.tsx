"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useUser, SignInButton } from "@clerk/nextjs"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/shared/copy-button"
import { Eye, Copy as CopyIcon, Heart, MessageCircle, CheckIcon } from "lucide-react"
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
  const [cliCopied, setCliCopied] = useState(false);

  const cliCommand = `npx cursorize@latest add ${rule.id}`;

  const handleCliCopy = async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCliCopied(true);
      toast.success("Command copied to clipboard!");
      setTimeout(() => setCliCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

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
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant="secondary" className="text-xs">
            {rule.techStack}
          </Badge>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium">{rule.viewCount}</span>
          </div>
        </div>
        <Link href={`/rules/${rule.id}`} className="group/link">
          <h3 className="text-xl font-semibold text-foreground line-clamp-2 mb-2 group-hover/link:text-primary transition-colors">
            {rule.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="pb-4 space-y-4">
        {rule.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {rule.description}
          </p>
        )}

        {rule.tags && rule.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rule.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {rule.tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{rule.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="bg-muted/50 p-4 rounded-lg border border-border/50">
          <pre className="text-xs text-foreground/80 overflow-hidden line-clamp-3 whitespace-pre-wrap font-mono leading-relaxed">
            {rule.content}
          </pre>
        </div>

        <div className="flex items-center gap-2 bg-muted/30 px-4 py-2.5 rounded-lg border border-border/50 overflow-hidden group/code">
          <code className="flex-1 text-xs text-foreground/70 font-mono whitespace-nowrap overflow-x-auto scrollbar-hide">
            {cliCommand}
          </code>
          <button
            onClick={handleCliCopy}
            className="shrink-0 p-1.5 hover:bg-accent rounded-md transition-colors"
            aria-label="Copy command"
          >
            {cliCopied ? (
              <CheckIcon className="h-4 w-4 text-primary" />
            ) : (
              <CopyIcon className="h-4 w-4 text-muted-foreground group-hover/code:text-foreground" />
            )}
          </button>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="line-clamp-1 text-xs">
            {rule.user?.name || rule.user?.email}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {rule._count && (
            <>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="font-medium">{rule._count.comments}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CopyIcon className="h-3.5 w-3.5" />
                <span className="font-medium">{copyCount}</span>
              </div>
            </>
          )}
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
              className={`gap-1.5 ${liked ? "text-red-600 hover:text-red-700 hover:bg-red-50/50 dark:hover:bg-red-950/20" : "text-muted-foreground hover:text-foreground"}`}
              title="Like this rule"
            >
              <Heart
                className={`h-4 w-4 transition-all ${liked ? "fill-red-600 text-red-600 scale-110" : ""}`}
              />
              <span className="font-medium">{likeCount}</span>
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                title="Like this rule"
              >
                <Heart className="h-4 w-4" />
                <span className="font-medium">{likeCount}</span>
              </Button>
            </SignInButton>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
