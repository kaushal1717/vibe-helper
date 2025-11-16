export interface User {
  user_id: string
  name: string | null
  email: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CursorRule {
  id: string
  title: string
  techStack: string
  description: string | null
  content: string
  isPublic: boolean
  userId: string
  viewCount: number
  copyCount: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
  user?: {
    name: string | null
    email: string
    image: string | null
  }
  _count?: {
    likes: number
    comments: number
    favorites: number
  }
  hasLiked?: boolean
}

export interface Like {
  id: string
  userId: string
  ruleId: string
  createdAt: Date
}

export interface Comment {
  id: string
  content: string
  userId: string
  ruleId: string
  createdAt: Date
  updatedAt: Date
  user?: {
    name: string | null
    email: string
    image: string | null
  }
}

export interface Favorite {
  id: string
  userId: string
  ruleId: string
  createdAt: Date
}
