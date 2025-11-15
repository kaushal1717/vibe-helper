import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  title = "No cursor rules found",
  description = "Be the first to add one!",
  actionLabel = "Add Rule",
  actionHref = "/add-rule",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  )
}
