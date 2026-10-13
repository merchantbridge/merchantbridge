import type { SupabaseClient } from "@supabase/supabase-js";

export const googleAuthEnabled =
  process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

export async function startGoogleAuth(
  supabase: SupabaseClient,
  next?: string,
) {
  const queryParams: Record<string, string> = { account_type: "merchant" };
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    queryParams.next = next;
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams,
    },
  });

  if (error) throw new Error(error.message);
}