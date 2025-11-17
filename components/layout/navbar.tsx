"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { FileText, ShieldCheck, Inbox } from "lucide-react";

export default function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "ADMIN";

  if (!mounted || !isLoaded) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
              >
                Cursorize
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
            >
              Cursorize
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Link
                    href="/request-rule"
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden md:inline">Request Rule</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Link href="/my-requests" className="flex items-center gap-2">
                    <Inbox className="h-4 w-4" />
                    <span className="hidden md:inline">My Requests</span>
                  </Link>
                </Button>
                {isAdmin && (
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex text-primary hover:text-primary/80"
                  >
                    <Link
                      href="/admin/requests"
                      className="flex items-center gap-2"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      <span className="hidden md:inline">Admin</span>
                    </Link>
                  </Button>
                )}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button
                    variant="default"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
