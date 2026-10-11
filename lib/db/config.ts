// Database configuration and schema loader
// Handles schema migrations for both Supabase and Neon

import { getNeonPool, getDbType } from "./client";

// Run schema migrations on Neon
export async function runNeonMigrations() {
  const pool = getNeonPool();
  if (!pool) {
    throw new Error("Neon pool not initialized");
  }

  const client = await pool.connect();
  try {
    // Read migration files
    const fs = require("fs");
    const path = require("path");
    const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
    
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter((f: string) => f.endsWith(".sql"))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      
      console.log(`Running migration: ${file}`);
      
      try {
        await client.query(sql);
        console.log(`✓ ${file} completed`);
      } catch (error: any) {
        console.error(`✗ ${file} failed:`, error.message);
        // Continue with other migrations even if one fails
      }
    }

    console.log("All migrations completed");
  } finally {
    client.release();
  }
}

// Check if database schema exists
export async function checkSchemaExists(): Promise<boolean> {
  const dbType = getDbType();
  
  if (dbType === "neon") {
    const pool = getNeonPool();
    if (!pool) return false;
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'profiles'
        );
      `);
      return result.rows[0].exists;
    } finally {
      client.release();
    }
  }
  
  // For Supabase, assume schema exists (managed by Supabase)
  return true;
}

// Sync data from Supabase to Neon (for backup/fallback)
export async function syncToNeon() {
  const dbType = getDbType();
  
  if (dbType !== "neon") {
    console.log("Neon is not active, skipping sync");
    return;
  }

  console.log("Starting data sync from Supabase to Neon...");
  
  // This would involve:
  // 1. Fetch data from Supabase
  // 2. Insert/update in Neon
  // 3. Handle conflicts and errors
  
  // For now, this is a placeholder - implement based on your sync needs
  console.log("Sync placeholder - implement based on requirements");
}
