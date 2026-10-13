import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signInDestination } from "@/lib/auth/destination";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "";

  const fail = (message: string) =>
    NextResponse.redirect(
      new URL(
        `/auth/sign-in?error=${encodeURIComponent(message)}`,
        request.url
      )
    );

  if (!code) return fail("Google sign in was not completed.");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return fail("Google sign in could not be completed. Please try again.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  // Google can authenticate someone who has no Merchant Bridge account yet.
  // Redirect to sign-in with a flag to show a popup notification explaining
  // they need to create an account first.
  if (!profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL(
        `/auth/sign-in?google_not_linked=true`,
        request.url
      ),
      303
    );
  }

  const destination = profile.role === "merchant" ? next || "/merchant/setup" : "";

  return NextResponse.redirect(
    new URL(signInDestination(profile.role, destination), request.url),
    303
  );
}