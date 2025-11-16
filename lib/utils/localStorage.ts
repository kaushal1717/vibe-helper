// Utility functions for localStorage tracking of views and copies

const STORAGE_KEYS = {
  VIEWED_RULES: "vibe_helper_viewed_rules",
  COPIED_RULES: "vibe_helper_copied_rules",
}

export function getViewedRules(): string[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VIEWED_RULES)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function hasViewedRule(ruleId: string): boolean {
  const viewed = getViewedRules()
  return viewed.includes(ruleId)
}

export function markRuleAsViewed(ruleId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const viewed = getViewedRules()
    if (!viewed.includes(ruleId)) {
      viewed.push(ruleId)
      localStorage.setItem(STORAGE_KEYS.VIEWED_RULES, JSON.stringify(viewed))
      return true // New view
    }
    return false // Already viewed
  } catch {
    return false
  }
}

export function getCopiedRules(): string[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COPIED_RULES)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function hasCopiedRule(ruleId: string): boolean {
  const copied = getCopiedRules()
  return copied.includes(ruleId)
}

export function markRuleAsCopied(ruleId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const copied = getCopiedRules()
    if (!copied.includes(ruleId)) {
      copied.push(ruleId)
      localStorage.setItem(STORAGE_KEYS.COPIED_RULES, JSON.stringify(copied))
      return true // New copy
    }
    return false // Already copied
  } catch {
    return false
  }
}

