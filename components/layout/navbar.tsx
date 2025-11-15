"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Plus, User } from "lucide-react"

export default function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isLoaded) {
    return (
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition">
                Cursor Rules
              </Link>
            </div>
            <div className="flex items-center gap-4">
              {/* Placeholder to prevent layout shift */}
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition">
              Cursor Rules
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <Button asChild variant="default" size="sm">
                  <Link href="/add-rule">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Link>
                </Button>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="default" size="sm">
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
