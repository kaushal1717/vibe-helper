// Utility to get or create a session ID for non-logged users
// This is stored in localStorage and used to track views/copies

const SESSION_KEY = "vibe_helper_session_id"

export function getSessionId(): string {
  if (typeof window === "undefined") {
    // Server-side, generate a temporary ID
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  let sessionId = localStorage.getItem(SESSION_KEY)
  
  if (!sessionId) {
    // Generate a new session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  
  return sessionId
}

