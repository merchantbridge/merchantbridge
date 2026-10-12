"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/use-session";
import SignOutButton from "./SignOutButton";
export default function AuthControls() {
  const { signedIn, loading } = useSession();
  const pathname = usePathname();
  if (loading) return <span className="text-xs text-slate-500" role="status">Checking account...</span>;
  return signedIn ? <div className="flex items-center gap-1"><SignOutButton /></div> : <Link href={"/auth/sign-in?next=" + encodeURIComponent(pathname === "/community" || pathname === "/merchantbridge" ? "/" : pathname)} className="rounded-full px-4 py-2 text-sm font-semibold text-accentDim transition hover:bg-accentTint">Sign in</Link>;
}
