# Cursor Rules App

A Next.js application for sharing and discovering cursor rules for different tech stacks. Users can browse public cursor rules or create an account to add their own.

## Features

- 🔍 Browse cursor rules for various tech stacks
- 🔐 User authentication (login/register)
- ➕ Add custom cursor rules (requires login)
- 🏷️ Filter rules by tech stack
- 📋 Copy rules to clipboard
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite with Prisma ORM
- **Authentication:** NextAuth.js
- **Password Hashing:** bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vibe-helper
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Push the Prisma schema to create the database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application uses SQLite for simplicity. The database file will be created at `prisma/dev.db`.

### Available Commands

- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed database with sample data

### Demo Account

After seeding, you can login with:
- **Email:** demo@example.com
- **Password:** demo123

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth configuration
│   │   ├── register/            # User registration endpoint
│   │   └── rules/               # Cursor rules CRUD endpoints
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── add-rule/                # Add new rule page (protected)
│   ├── layout.tsx              # Root layout with navbar
│   └── page.tsx                # Home page with rules listing
├── components/
│   ├── Navbar.tsx              # Navigation component
│   └── SessionProvider.tsx     # NextAuth session provider
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
└── types/
    └── next-auth.d.ts          # NextAuth type extensions
```

## Features Overview

### Public Access
- View all public cursor rules
- Filter rules by tech stack
- Copy rules to clipboard

### Authenticated Users
- All public features
- Create new cursor rules
- Choose visibility (public/private)

## Environment Variables

The application uses the following environment variables (already configured in `.env`):

- `DATABASE_URL` - SQLite database connection string
- `NEXTAUTH_SECRET` - Secret for NextAuth session encryption
- `NEXTAUTH_URL` - Application URL

**Note:** Update `NEXTAUTH_SECRET` in production!

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT
