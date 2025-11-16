"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { markRuleAsCopied, hasCopiedRule } from "@/lib/utils/localStorage";
import { getSessionId } from "@/lib/utils/session";

interface CopyButtonProps {
  content: string;
  onCopy?: (copyCount?: number) => void;
  ruleId?: string;
  onCopyCountUpdate?: (copyCount: number) => void;
  copyLabel?: string;
  copiedLabel?: string;
}

export function CopyButton({
  content,
  onCopy,
  ruleId,
  onCopyCountUpdate,
  copyLabel,
  copiedLabel,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard!");

      // Track copy in database if ruleId is provided
      if (ruleId) {
        const isNewCopy = !hasCopiedRule(ruleId);
        if (isNewCopy) {
          markRuleAsCopied(ruleId);
        }

        // Always track copy to get latest count from server
        try {
          const sessionId = getSessionId();
          const response = await fetch(`/api/rules/${ruleId}/copy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          });

          if (response.ok) {
            const data = await response.json();
            // Always update UI with the latest count from server
            if (data.copyCount !== undefined) {
              onCopyCountUpdate?.(data.copyCount);
              onCopy?.(data.copyCount);
            } else {
              onCopy?.();
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("Error tracking copy:", errorData);
            onCopy?.();
          }
        } catch (error) {
          // Silently fail - copy to clipboard still succeeded
          console.error("Error tracking copy:", error);
          onCopy?.();
        }
      } else {
        onCopy?.();
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="copy-btn-scale text-primary hover:text-accent hover:bg-accent/10 transition-all duration-200 font-medium"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1 animate-in zoom-in duration-200" />
            {copiedLabel}
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1" />
            {copyLabel}
          </>
        )}
      </Button>
      {copied && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass-panel px-3 py-1.5 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          <span className="text-xs font-semibold text-foreground whitespace-nowrap">Copied!</span>
        </div>
      )}
    </div>
  );
}
