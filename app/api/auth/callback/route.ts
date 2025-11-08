import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import {
  type Session,
  type User,
  type UserMetadata,
} from "@supabase/supabase-js";

// #region CONFIGURATION
/**
 * @description Force dynamic rendering to prevent caching of this server-side function.
 */
export const dynamic = "force-dynamic";
// #endregion CONFIGURATION

// #region TYPES
// NOTE: Use your actual schema types (e.g., from database.types.ts) here for safety.
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
  bio: string | null;
  role: string | null;
  phone_number: string | null;
}
// #endregion TYPES

// #region HELPER_FUNCTIONS

/**
 * @function determineRedirectPath
 * @description Determines the final destination URL based on user status and profile completeness.
 * Includes a cache-busting parameter to force client-side session refresh.
 */
function determineRedirectPath(
  finalRedirectBaseUrl: string,
  profile: Profile,
  isNewUser: boolean,
): string {
  // 🚨 FIX: Add a cache-busting parameter to the redirect path.
  // This ensures the browser treats the destination as a hard navigation,
  // forcing the client-side app to read the new session cookies immediately.
  const cacheBust: string = `_t=${Date.now()}`;

  // NEW USERS → Always go to profile edit
  if (isNewUser) {
    console.log("🆕 NEW USER → Redirecting to /profile/edit");
    return `${finalRedirectBaseUrl}/profile/edit?${cacheBust}`;
  }

  // Check profile completeness for existing users
  const hasCompleteBio: boolean = !!profile.bio &&
    profile.bio.trim().length > 0;
  const hasRole: boolean = !!profile.role && profile.role.trim().length > 0;
  const hasPhone: boolean = !!profile.phone_number &&
    profile.phone_number.trim().length > 0;

  console.log("📊 Profile completeness check:");
  console.log("   ✓ Bio:", hasCompleteBio ? "✅ Complete" : "❌ Missing");
  console.log("   ✓ Role:", hasRole ? "✅ Complete" : "❌ Missing");
  console.log("   ✓ Phone:", hasPhone ? "✅ Complete" : "❌ Missing");

  // Existing user logic
  if (hasCompleteBio && hasRole && hasPhone) {
    console.log("✅ PROFILE COMPLETE → Redirecting to /community");
    return `${finalRedirectBaseUrl}/community?${cacheBust}`;
  } else {
    console.log("📝 PROFILE INCOMPLETE → Redirecting to /profile/edit");
    return `${finalRedirectBaseUrl}/profile/edit?${cacheBust}`;
  }
}

/**
 * @async
 * @function processCodeExchangeAndProfileUpdate
 * @description Executes the core logic: exchange code, update profile, send email, and route.
 */
async function processCodeExchangeAndProfileUpdate(
  requestUrl: URL,
  code: string,
): Promise<NextResponse> {
  // Use createClient() which is configured to default to the secure Anon Key and handles cookies.
  const supabase = await createClient();

  // 1. Exchange Code
  const { data, error: exchangeError } = await supabase.auth
    .exchangeCodeForSession(code) as {
      data: { session: Session | null; user: User | null };
      error: unknown;
    };

  if (exchangeError) {
    console.error("Session exchange error:", exchangeError);
    return NextResponse.redirect(
      new URL("/signin?error=session_exchange_failed", requestUrl.origin),
    );
  }

  if (!data.session || !data.user) {
    console.error("No session or user created after code exchange");
    return NextResponse.redirect(
      new URL("/signin?error=no_session", requestUrl.origin),
    );
  }

  const user: User = data.user;
  const finalRedirectBaseUrl: string = requestUrl.origin;

  // 2. New User Check
  const userCreatedAt = new Date(user.created_at);
  const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
  const isNewUser: boolean = userCreatedAt > thirtySecondsAgo;

  console.log(
    isNewUser
      ? "🆕 NEW USER DETECTED (created within last 30 seconds)"
      : "👤 EXISTING USER",
  );

  // 3. Profile Fetch and Data Merge
  const userMetadata: UserMetadata = user.user_metadata || {};
  const googleGivenName: string | undefined = userMetadata.given_name ||
    userMetadata.first_name;
  const googleFamilyName: string | undefined = userMetadata.family_name ||
    userMetadata.last_name;
  const googlePicture: string | undefined = userMetadata.picture ||
    userMetadata.avatar_url;

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select<string, Profile>("*")
    .eq("id", user.id)
    .single();

  const updateData: Partial<Profile> = {
    first_name: googleGivenName || existingProfile?.first_name || null,
    last_name: googleFamilyName || existingProfile?.last_name || null,
    profile_photo_url: googlePicture || existingProfile?.profile_photo_url ||
      null,
  };

  // 4. Profile Update
  const { data: updatedProfile } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select()
    .single<Profile>();

  console.log("✅ Profile updated with Google data");

  if (!updatedProfile) {
    console.error("Profile update failed to return data.");
    return NextResponse.redirect(
      new URL("/signin?error=profile_update_failed", requestUrl.origin),
    );
  }

  // 5. Welcome Email
  if (isNewUser) {
    try {
      await fetch(`${requestUrl.origin}/api/emails/send-welcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      console.log("✅ Welcome email queued");
    } catch (emailError) {
      console.error("❌ Error sending welcome email:", emailError);
    }
  }

  // 6. Routing
  const redirectPath = determineRedirectPath(
    finalRedirectBaseUrl,
    updatedProfile,
    isNewUser,
  );

  // Use NextResponse.redirect() which sets the status and Location header.
  return NextResponse.redirect(redirectPath);
}
// #endregion HELPER_FUNCTIONS

// #region HANDLER
/**
 * @async
 * @function GET
 * @description Handles the OAuth callback from a provider.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(req.url);
  const code: string | null = requestUrl.searchParams.get("code");
  const error: string | null = requestUrl.searchParams.get("error");
  const errorDescription: string | null = requestUrl.searchParams.get(
    "error_description",
  );

  // 1. Handle OAuth Errors (Guard Clause)
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      new URL("/signin?error=" + encodeURIComponent(error), requestUrl.origin),
    );
  }

  // 2. Process Authentication Code
  if (code) {
    try {
      return await processCodeExchangeAndProfileUpdate(requestUrl, code);
    } catch (error) { // Catch unexpected errors
      console.error("Unexpected error during session exchange:", error);
      return NextResponse.redirect(
        new URL("/signin?error=unexpected_error", requestUrl.origin),
      );
    }
  }

  // 3. Fallback: No Code Present
  console.log("⚠️ No code present - Redirecting to signin");
  return NextResponse.redirect(new URL("/signin", requestUrl.origin));
}
// #endregion HANDLER
