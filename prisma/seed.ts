import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  })

  console.log('Created user:', user.email)

  // Create sample cursor rules
  const rules = [
    {
      title: 'React Best Practices',
      techStack: 'React',
      description: 'Essential React development guidelines',
      content: `You are an expert in React and TypeScript.

Key Principles:
- Write functional components with hooks
- Use TypeScript for type safety
- Follow React naming conventions (PascalCase for components)
- Use prop destructuring
- Implement proper error boundaries
- Optimize with React.memo when needed

Code Style:
- Use arrow functions for components
- Prefer composition over inheritance
- Keep components small and focused
- Use custom hooks for reusable logic`,
    },
    {
      title: 'Next.js 14 App Router',
      techStack: 'Next.js',
      description: 'Guidelines for Next.js 14 with App Router',
      content: `You are an expert in Next.js 14, React, and TypeScript.

Key Principles:
- Use App Router (app/ directory)
- Implement Server Components by default
- Use 'use client' directive only when needed
- Leverage Server Actions for mutations
- Implement proper loading and error states
- Use TypeScript for type safety

File Structure:
- page.tsx for pages
- layout.tsx for layouts
- loading.tsx for loading states
- error.tsx for error boundaries
- route.ts for API routes

Performance:
- Use Image component for images
- Implement proper metadata
- Optimize fonts with next/font
- Use dynamic imports for code splitting`,
    },
    {
      title: 'TypeScript Advanced Patterns',
      techStack: 'TypeScript',
      description: 'Advanced TypeScript patterns and practices',
      content: `You are an expert in TypeScript.

Key Principles:
- Use strict mode
- Leverage type inference
- Avoid 'any' type
- Use union types and type guards
- Implement proper generics
- Use utility types (Partial, Pick, Omit, etc.)

Best Practices:
- Define interfaces for object shapes
- Use enums for fixed sets of values
- Implement proper error handling with custom types
- Use const assertions when appropriate
- Leverage discriminated unions
- Document complex types with JSDoc`,
    },
    {
      title: 'Tailwind CSS Conventions',
      techStack: 'Tailwind CSS',
      description: 'Tailwind CSS best practices and conventions',
      content: `You are an expert in Tailwind CSS.

Key Principles:
- Use utility-first approach
- Follow mobile-first responsive design
- Use consistent spacing scale
- Leverage Tailwind's color palette
- Use custom configuration sparingly

Best Practices:
- Group utilities logically (layout, spacing, colors, typography)
- Use @apply for repeated patterns in components
- Implement dark mode with dark: prefix
- Use arbitrary values [value] only when necessary
- Extract components for repeated patterns
- Use Tailwind plugins for extended functionality`,
    },
    {
      title: 'Node.js API Development',
      techStack: 'Node.js',
      description: 'Best practices for Node.js API development',
      content: `You are an expert in Node.js, Express, and TypeScript.

Key Principles:
- Use Express.js for REST APIs
- Implement proper error handling
- Use middleware for cross-cutting concerns
- Validate input data
- Use environment variables for configuration
- Implement proper logging

Security:
- Use helmet for security headers
- Implement rate limiting
- Validate and sanitize user input
- Use CORS properly
- Hash passwords with bcrypt
- Use JWT for authentication

Performance:
- Implement caching where appropriate
- Use connection pooling for databases
- Handle async operations properly
- Implement proper error handling`,
    },
  ]

  for (const rule of rules) {
    await prisma.cursorRule.create({
      data: {
        ...rule,
        userId: user.user_id,
      },
    })
    console.log(`Created rule: ${rule.title}`)
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
