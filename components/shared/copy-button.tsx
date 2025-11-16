"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { markRuleAsCopied, hasCopiedRule } from "@/lib/utils/localStorage"
import { getSessionId } from "@/lib/utils/session"

interface CopyButtonProps {
  content: string
  onCopy?: (copyCount?: number) => void
  ruleId?: string
  onCopyCountUpdate?: (copyCount: number) => void
}

export function CopyButton({ content, onCopy, ruleId, onCopyCountUpdate }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success("Copied to clipboard!")
      
      // Track copy in database if ruleId is provided
      if (ruleId) {
        const isNewCopy = !hasCopiedRule(ruleId)
        if (isNewCopy) {
          markRuleAsCopied(ruleId)
        }
        
        // Always track copy to get latest count from server
        try {
          const sessionId = getSessionId()
          const response = await fetch(`/api/rules/${ruleId}/copy`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId }),
          })
          
          if (response.ok) {
            const data = await response.json()
            // Always update UI with the latest count from server
            if (data.copyCount !== undefined) {
              onCopyCountUpdate?.(data.copyCount)
              onCopy?.(data.copyCount)
            } else {
              onCopy?.()
            }
          } else {
            const errorData = await response.json().catch(() => ({}))
            console.error("Error tracking copy:", errorData)
            onCopy?.()
          }
        } catch (error) {
          // Silently fail - copy to clipboard still succeeded
          console.error("Error tracking copy:", error)
          onCopy?.()
        }
      } else {
        onCopy?.()
      }
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="text-blue-600 hover:text-blue-700"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-1" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </>
      )}
    </Button>
  )
}
