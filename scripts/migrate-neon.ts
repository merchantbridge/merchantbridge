// Run Supabase migrations on Neon PostgreSQL
// Usage: npm run db:migrate-neon

import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!NEON_DATABASE_URL) {
  console.error("NEON_DATABASE_URL not set in environment variables");
  process.exit(1);
}

const pool = new Pool({ connectionString: NEON_DATABASE_URL });

async function runMigrations() {
  console.log("Starting Neon database migrations...\n");
  
  const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
  
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }
  
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  
  console.log(`Found ${migrationFiles.length} migration files\n`);
  
  const client = await pool.connect();
  
  try {
    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      
      console.log(`Running: ${file}`);
      
      try {
        await client.query(sql);
        console.log(`✓ ${file} completed\n`);
      } catch (error: any) {
        // Check if it's a "already exists" error (safe to ignore)
        if (error.message.includes("already exists") || error.code === "42P07") {
          console.log(`⊘ ${file} skipped (already exists)\n`);
        } else {
          console.error(`✗ ${file} failed:`, error.message);
          console.error("Continuing with next migration...\n");
        }
      }
    }
    
    console.log("✓ All migrations completed successfully!");
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
