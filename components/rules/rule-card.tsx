"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/shared/copy-button";
import {
  Eye,
  Copy as CopyIcon,
  Heart,
  MessageCircle,
  CheckIcon,
} from "lucide-react";
import type { CursorRule } from "@/types";
import { toast } from "sonner";
import { hasCopiedRule, markRuleAsCopied } from "@/lib/utils/localStorage";
import { getSessionId } from "@/lib/utils/session";

interface RuleCardProps {
  rule: CursorRule;
  onCopy?: (ruleId: string, copyCount?: number) => void;
  onLikeUpdate?: (ruleId: string, liked: boolean, likeCount: number) => void;
  onCopyCountUpdate?: (ruleId: string, copyCount: number) => void;
}

export function RuleCard({
  rule,
  onCopy,
  onLikeUpdate,
  onCopyCountUpdate,
}: RuleCardProps) {
  const { isSignedIn } = useUser();
  const [isLiking, setIsLiking] = useState(false);
  const [liked, setLiked] = useState(rule.hasLiked || false);
  const [likeCount, setLikeCount] = useState(rule._count?.likes || 0);
  const [copyCount, setCopyCount] = useState(rule.copyCount || 0);
  const [cliCopied, setCliCopied] = useState(false);

  const cliCommand = `npx cursorize@latest add ${rule.id}`;

  const handleCliCopy = async () => {
    try {
      await navigator.clipboard.writeText(cliCommand);
      setCliCopied(true);
      toast.success("Command copied to clipboard!");

      const isNewCopy = !hasCopiedRule(rule.id);
      if (isNewCopy) {
        markRuleAsCopied(rule.id);
      }

      try {
        const sessionId = getSessionId();
        const response = await fetch(`/api/rules/${rule.id}/copy`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.copyCount !== undefined) {
            setCopyCount(data.copyCount);
            onCopyCountUpdate?.(rule.id, data.copyCount);
            onCopy?.(rule.id, data.copyCount);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error tracking copy:", errorData);
        }
      } catch (error) {
        console.error("Error tracking copy:", error);
      }

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
            setLiked(data.liked);
          }
        })
        .catch(() => {
          // Silently fail
        });
    } else {
      setLiked(false);
    }
  }, [isSignedIn, rule.id]);

  // Update like count when rule changes
  useEffect(() => {
    setLikeCount(rule._count?.likes || 0);
  }, [rule._count?.likes]);

  // Update copy count when rule changes
  useEffect(() => {
    setCopyCount(rule.copyCount || 0);
  }, [rule.copyCount]);

  const handleCopy = (copyCount?: number) => {
    onCopy?.(rule.id, copyCount);
  };

  const handleCopyCountUpdate = (newCopyCount: number) => {
    setCopyCount(newCopyCount);
    onCopyCountUpdate?.(rule.id, newCopyCount);
  };

  const handleLike = async () => {
    if (!isSignedIn) {
      toast.error("Please log in to like rules");
      return;
    }

    setIsLiking(true);
    try {
      const response = await fetch(`/api/rules/${rule.id}/like`, {
        method: "POST",
      });

      if (response.status === 401) {
        toast.error("Please log in to like rules");
        setIsLiking(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to like");
      }

      const data = await response.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);
      onLikeUpdate?.(rule.id, data.liked, data.likeCount);
      toast.success(data.liked ? "Liked!" : "Unliked");
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to toggle like");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Card className="glass-panel hover-glow transition-all duration-300 border-[1.5px] border-white/60 shadow-xl slide-up overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="mb-2 bg-secondary/10 border-secondary/20 text-secondary border font-bold text-xs px-3 py-1">
            {rule.techStack}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-foreground/60 font-semibold">
            <Eye className="h-3.5 w-3.5" />
            <span>{rule.viewCount}</span>
          </div>
        </div>
        <Link href={`/rules/${rule.id}`} className="group">
          <h3 className="text-xl font-extrabold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {rule.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="pb-3">
        {rule.description && (
          <p className="text-foreground/70 mb-3 line-clamp-2 text-sm font-semibold">
            {rule.description}
          </p>
        )}

        {rule.tags && rule.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {rule.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs font-semibold border-foreground/20 text-foreground/70">
                {tag}
              </Badge>
            ))}
            {rule.tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-semibold border-foreground/20 text-foreground/70">
                +{rule.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="bg-foreground/5 p-4 rounded-xl mb-3 border border-foreground/10">
          <pre className="text-sm text-foreground/80 overflow-hidden line-clamp-3 whitespace-pre-wrap font-semibold">
            {rule.content}
          </pre>
        </div>

        <div className="mt-3 glass-panel flex items-center gap-2 px-3 py-2.5 rounded-lg overflow-hidden border border-white/40 shadow-md">
          <code className="flex-1 text-xs text-foreground/70 font-mono whitespace-nowrap overflow-x-auto scrollbar-hide font-semibold">
            {cliCommand}
          </code>
          <button
            onClick={handleCliCopy}
            className="copy-btn-scale shrink-0 p-1.5 hover:bg-primary/20 rounded-lg transition-all duration-200"
            aria-label="Copy command"
          >
            {cliCopied ? (
              <CheckIcon className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" />
            ) : (
              <CopyIcon className="h-4 w-4 text-foreground/60" />
            )}
          </button>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-3 border-t border-foreground/10">
        <div className="flex items-center gap-3 text-sm text-foreground/60 font-semibold">
          <span className="line-clamp-1">
            By {rule.user?.name || rule.user?.email}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 text-xs text-foreground/60 font-semibold mr-2">
            {rule._count && (
              <>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{rule._count.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CopyIcon className="h-3.5 w-3.5" />
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
              className={`text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all duration-200 ${liked ? "bg-red-500/10" : ""}`}
              title="Like this rule"
            >
              <Heart
                className={`h-4 w-4 transition-transform duration-200 ${liked ? "fill-red-500 text-red-500 scale-110" : ""}`}
              />
              {likeCount}
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all duration-200"
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
  );
}
