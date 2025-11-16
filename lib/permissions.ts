import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Role types
export type UserRole = 'USER' | 'ADMIN';

/**
 * Check if the current user is an admin
 * Uses Clerk's publicMetadata to determine role
 */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  console.log('Server-side isAdmin check - userId:', userId);
  if (!userId) return false;

  try {
    // Fetch the full user object to get publicMetadata
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;
    console.log('Server-side role from publicMetadata:', role);
    return role === 'ADMIN';
  } catch (error) {
    console.error('Error fetching user:', error);
    return false;
  }
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<UserRole> {
  const { userId } = await auth();
  if (!userId) return 'USER';

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;
    return role === 'ADMIN' ? 'ADMIN' : 'USER';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'USER';
  }
}

/**
 * Require admin role or redirect to home page
 * Use this in Server Components that should only be accessible to admins
 */
export async function requireAdmin(): Promise<void> {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect('/');
  }
}

/**
 * Get the current authenticated user ID from Clerk
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication or redirect to sign-in
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  return userId;
}
