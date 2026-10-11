// Database client abstraction layer
// Supports both Supabase and Neon PostgreSQL with automatic fallback

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Pool } from "pg";

// Environment variables
const USE_NEON = process.env.USE_NEON === "true";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;

// Supabase client (default)
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

// Neon PostgreSQL client (fallback)
let neonPool: Pool | null = null;

// Initialize Supabase client
export function getSupabaseClient() {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabaseClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
}

// Initialize Neon Pool
export function getNeonPool() {
  if (!neonPool && NEON_DATABASE_URL) {
    neonPool = new Pool({
      connectionString: NEON_DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return neonPool;
}

// Database type
export type DbType = "supabase" | "neon";

// Get active database type
export function getDbType(): DbType {
  if (USE_NEON && NEON_DATABASE_URL) {
    return "neon";
  }
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    return "supabase";
  }
  throw new Error("No database configured. Set either Supabase or Neon environment variables.");
}

// Get active database client
export function getDbClient() {
  const dbType = getDbType();
  
  if (dbType === "neon") {
    return getNeonPool();
  }
  
  return getSupabaseClient();
}

// Health check for both databases
export async function checkDatabaseHealth() {
  const results = {
    supabase: false,
    neon: false,
    active: "" as DbType,
  };

  // Check Supabase
  try {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      if (!error) results.supabase = true;
    }
  } catch (e) {
    console.error("Supabase health check failed:", e);
  }

  // Check Neon
  try {
    const pool = getNeonPool();
    if (pool) {
      const client = await pool.connect();
      try {
        await client.query("SELECT 1");
        results.neon = true;
      } finally {
        client.release();
      }
    }
  } catch (e) {
    console.error("Neon health check failed:", e);
  }

  // Determine active database
  results.active = getDbType();

  return results;
}

// Graceful shutdown
export async function closeDbConnections() {
  if (neonPool) {
    await neonPool.end();
    neonPool = null;
  }
  // Supabase client doesn't need explicit cleanup
}
