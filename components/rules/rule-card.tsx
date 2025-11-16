"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/shared/copy-button";
import {
  Eye,
  Copy as CopyIcon,
  Heart,
  MessageCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { CursorRule } from "@/types";

interface RuleCardProps {
  rule: CursorRule;
  onCopy?: (ruleId: string) => void;
}

export function RuleCard({ rule, onCopy }: RuleCardProps) {
  const [cliCopied, setCliCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.(rule.id);
  };

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

        <div className="mt-3 flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-md border border-gray-200 overflow-hidden">
          <code className="flex-1 text-xs text-gray-700 font-mono whitespace-nowrap overflow-x-auto scrollbar-hide">
            {cliCommand}
          </code>
          <button
            onClick={handleCliCopy}
            className="shrink-0 p-1.5 hover:bg-gray-200 rounded transition-colors"
            aria-label="Copy command"
          >
            {cliCopied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <CopyIcon className="h-4 w-4 text-gray-600" />
            )}
          </button>
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
                  <Heart className="h-3 w-3" />
                  <span>{rule._count.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  <span>{rule._count.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CopyIcon className="h-3 w-3" />
                  <span>{rule.copyCount}</span>
                </div>
              </>
            )}
          </div>
          <CopyButton content={rule.content} onCopy={handleCopy} />
        </div>
      </CardFooter>
    </Card>
  );
}
