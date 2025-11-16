"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton, SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Plus, User, FileText, ShieldCheck, Inbox } from "lucide-react";

export default function Navbar() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "ADMIN";

  console.log("isAdmin: ", isAdmin);

  if (!mounted || !isLoaded) {
    return (
      <nav className='glass-panel-strong shadow-lg border-0 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center'>
              <Link
                href='/'
                className='text-xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hover:from-secondary hover:to-secondary/70 transition-all duration-300'
              >
                Cursorize
              </Link>
            </div>
            <div className='flex items-center gap-4'>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className='glass-panel-strong shadow-lg border-0 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          <div className='flex items-center'>
            <Link
              href='/'
              className='text-xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent hover:from-secondary hover:to-secondary/70 transition-all duration-300'
            >
              Cursorize
            </Link>
          </div>

          <div className='flex items-center gap-4'>
            {isSignedIn ? (
              <>
                <Button asChild variant='ghost' size='sm'>
                  <Link href='/request-rule'>
                    <FileText className='h-4 w-4 mr-2' />
                    Request Rule
                  </Link>
                </Button>
                <Button asChild variant='ghost' size='sm'>
                  <Link href='/my-requests'>
                    <Inbox className='h-4 w-4 mr-2' />
                    My Requests
                  </Link>
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      asChild
                      variant='ghost'
                      size='sm'
                      className='text-purple-600 hover:text-purple-700'
                    >
                      <Link href='/admin/requests'>
                        <ShieldCheck className='h-4 w-4 mr-2' />
                        Admin
                      </Link>
                    </Button>
                  </>
                )}
                <UserButton
                  afterSignOutUrl='/'
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <SignInButton mode='modal'>
                  <Button variant='ghost' size='sm'>
                    <User className='h-4 w-4 mr-2' />
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode='modal'>
                  <Button variant='default' size='sm'>
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
