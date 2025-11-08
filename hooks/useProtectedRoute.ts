"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/components/providers/SupabaseUserProvider";
import config from "@/config";
import type { User } from "@supabase/supabase-js";

// Define the return type for the hook
interface ProtectedRouteResult {
  /**
   * The authenticated Supabase user object, or null if not authenticated.
   */
  user: User | null;
  /**
   * True if the authentication state is still being resolved, false otherwise.
   */
  isLoading: boolean;
}

/**
 * A custom hook to protect a client-side route.
 *
 * It uses the `useUser` context to check the auth state.
 * 1. Shows a loading state while auth is resolving.
 * 2. If auth is resolved and no user is found, it redirects to the login page.
 * 3. If a user is found, it returns the user and a 'false' loading state.
 *
 * @returns {ProtectedRouteResult} An object containing the user and loading state.
 */
export const useProtectedRoute = (): ProtectedRouteResult => {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  // Local loading state to manage the "initial" load vs. the userLoading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userLoading) {
      // Still waiting for the user context to resolve
      setIsLoading(true);
      return;
    }

    if (!user) {
      // Auth is resolved, but no user. Redirect.
      router.push(config.auth.loginUrl);
      // We don't need to setIsLoading(false) because we're redirecting
      return;
    }

    // Auth is resolved, and we have a user.
    setIsLoading(false);
  }, [user, userLoading, router]);

  return { user, isLoading };
};
