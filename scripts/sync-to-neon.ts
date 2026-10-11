// Sync data from Supabase to Neon PostgreSQL
// Run this script when switching databases or for periodic backups

import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase credentials not found. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

if (!NEON_DATABASE_URL) {
  console.error("Neon connection string not found. Set NEON_DATABASE_URL.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const neonPool = new Pool({ connectionString: NEON_DATABASE_URL });

async function syncTable(tableName: string, columns: string[]) {
  console.log(`\nSyncing ${tableName}...`);
  
  try {
    // Fetch from Supabase
    const { data: supabaseData, error: fetchError } = await supabase
      .from(tableName)
      .select("*");
    
    if (fetchError) {
      console.error(`Error fetching ${tableName} from Supabase:`, fetchError);
      return;
    }
    
    if (!supabaseData || supabaseData.length === 0) {
      console.log(`No data in ${tableName}, skipping`);
      return;
    }
    
    console.log(`Fetched ${supabaseData.length} rows from ${tableName}`);
    
    // Insert into Neon
    const neonClient = await neonPool.connect();
    try {
      for (const row of supabaseData) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        
        const query = `
          INSERT INTO ${tableName} (${columns.join(", ")})
          VALUES (${placeholders})
          ON CONFLICT (id) DO UPDATE SET
          ${columns.map((col, i) => `${col} = EXCLUDED.${col}`).join(", ")}
        `;
        
        await neonClient.query(query, values);
      }
      
      console.log(`✓ Synced ${supabaseData.length} rows to ${tableName}`);
    } finally {
      neonClient.release();
    }
  } catch (error) {
    console.error(`Error syncing ${tableName}:`, error);
  }
}

async function main() {
  console.log("Starting Supabase to Neon sync...");
  
  // Define tables to sync (in dependency order)
  const tables = [
    { name: "profiles", columns: ["id", "email", "role", "full_name", "is_active", "created_at", "updated_at"] },
    { name: "merchant_profiles", columns: ["id", "user_id", "business_name", "business_email", "phone", "country", "location", "store_url", "business_category", "product_category", "business_description", "target_market", "average_order_value", "monthly_order_volume", "custom_branding_packaging", "shipping_markets", "current_monthly_revenue", "current_sales_channels", "supplier_profile_document_url", "supplier_profile_document_status", "onboarding_required", "onboarding_completed_at", "created_at"] },
    { name: "merchant_applications", columns: ["id", "merchant_id", "store_id", "status", "notes", "submitted_at", "reviewed_at", "reviewed_by"] },
    { name: "merchant_opportunity_applications", columns: ["id", "merchant_id", "opportunity_id", "opportunity_title", "opportunity_type", "status", "notes", "applied_at", "updated_at"] },
    { name: "merchant_notifications", columns: ["id", "merchant_id", "type", "title", "message", "action_url", "read", "created_at"] },
    { name: "merchant_testimonials", columns: ["id", "merchant_id", "opportunity_id", "content", "status", "submitted_at", "reviewed_at", "reviewed_by"] },
    { name: "opportunities", columns: ["id", "company_name", "logo_url", "website", "category", "relationship_label", "description", "requirements", "submission_url", "contact_info", "internal_notes", "active", "public_display", "created_at"] },
  ];
  
  for (const table of tables) {
    await syncTable(table.name, table.columns);
  }
  
  console.log("\n✓ Sync completed!");
  
  await neonPool.end();
}

main().catch(console.error);
