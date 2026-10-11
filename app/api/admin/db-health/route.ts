import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db/client";

export async function GET() {
  try {
    const health = await checkDatabaseHealth();
    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { error: "Health check failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
