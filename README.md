# Cursor Rules App

A Next.js application for sharing and discovering cursor rules for different tech stacks. Users can browse public cursor rules or create an account to add their own.

## Features

- 🔍 Browse cursor rules for various tech stacks
- 🔐 User authentication with email/password or Google OAuth
- ➕ Add custom cursor rules (requires login)
- 🏷️ Filter rules by tech stack
- 📋 Copy rules to clipboard
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB with Prisma ORM
- **Authentication:** Better Auth
- **OAuth Providers:** Google

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- MongoDB instance (local or cloud like MongoDB Atlas)
- Google OAuth credentials (for Google sign-in)

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

3. Set up environment variables:

Create or update the `.env` file with the following:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/cursor-rules"
# Or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/cursor-rules"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-at-least-32-characters-long"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

4. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
   - Copy Client ID and Client Secret to `.env`

5. Set up the database:
```bash
# Push the Prisma schema to create the database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application uses MongoDB. You can use either:
- **Local MongoDB:** Install MongoDB locally and use `mongodb://localhost:27017/cursor-rules`
- **MongoDB Atlas:** Create a free cluster at mongodb.com and use the connection string

### Available Commands

- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed database with sample data

### Demo Account

After seeding, you can login with:
- **Email:** demo@example.com
- **Password:** demo123

Or use **Sign in with Google** for OAuth authentication.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/[...all]/       # Better Auth API routes
│   │   └── rules/               # Cursor rules CRUD endpoints
│   ├── login/                   # Login page with Google OAuth
│   ├── register/                # Registration page with Google OAuth
│   ├── add-rule/                # Add new rule page (protected)
│   ├── layout.tsx              # Root layout with navbar
│   └── page.tsx                # Home page with rules listing
├── components/
│   └── Navbar.tsx              # Navigation component
├── lib/
│   ├── auth.ts                 # Better Auth configuration
│   ├── auth-client.ts          # Better Auth client helpers
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed script
```

## Features Overview

### Public Access
- View all public cursor rules
- Filter rules by tech stack
- Copy rules to clipboard

### Authenticated Users
- Sign in with email/password or Google
- Create new cursor rules
- Choose visibility (public/private)

## Authentication

The application uses Better Auth with support for:
- **Email/Password:** Traditional authentication with secure password hashing
- **Google OAuth:** One-click sign in with Google account

Better Auth provides:
- Secure session management
- Built-in CSRF protection
- Type-safe API
- Multiple provider support

## Environment Variables

The application requires the following environment variables:

- `DATABASE_URL` - MongoDB connection string
- `BETTER_AUTH_SECRET` - Secret for Better Auth session encryption (min 32 chars)
- `BETTER_AUTH_URL` - Application URL (for OAuth callbacks)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret

**Important:** Always update secrets before deploying to production!

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

## Deployment

When deploying to production:

1. Update environment variables with production values
2. Set `BETTER_AUTH_SECRET` to a secure random string (min 32 characters)
3. Update `BETTER_AUTH_URL` to your production URL
4. Add production URL to Google OAuth authorized redirect URIs
5. Ensure MongoDB is accessible from your hosting environment

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT
