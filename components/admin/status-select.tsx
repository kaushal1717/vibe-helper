"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function StatusSelect() {
  const [value, setValue] = useState<string>("")

  return (
    <>
      <input type="hidden" name="status" value={value} required={!value} />
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id="status" className="w-full">
          <SelectValue placeholder="Select status..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="APPROVED">Approve</SelectItem>
          <SelectItem value="REJECTED">Reject</SelectItem>
          <SelectItem value="CHANGES_REQUESTED">Request Changes</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}

