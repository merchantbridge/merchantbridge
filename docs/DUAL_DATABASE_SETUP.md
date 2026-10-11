# Dual Database Setup: Supabase + Neon

This application supports dual database configuration with Supabase as the primary database and Neon PostgreSQL as a backup/fallback.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Application Layer                     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Database Abstraction Layer                   │
│  - lib/db/client.ts (configuration & client selection)   │
└─────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────┐       ┌─────────────────────┐
│    Supabase         │       │    Neon             │
│  (Primary/Default)  │       │  (Backup/Fallback)   │
│                     │       │                     │
│  - Auth             │       │  - PostgreSQL       │
│  - Database         │       │  - Direct SQL       │
│  - Storage          │       │  - Higher limits    │
│  - Realtime         │       │                     │
└─────────────────────┘       └─────────────────────┘
```

## Current Setup

**Supabase is still required for:**
- Authentication (user sign up, sign in, sessions)
- File storage (documents, images)
- Real-time features (notifications)

**Neon can be used for:**
- Database operations (backup when Supabase hits limits)
- High-volume data storage
- Cost optimization

## Environment Configuration

### Option 1: Use Supabase Only (Default)
```env
USE_NEON=false
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# NEON_DATABASE_URL= (leave empty)
```

### Option 2: Use Neon as Database (Backup Mode)
```env
USE_NEON=true
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/dbname
```

**Note:** Even with `USE_NEON=true`, Supabase is still required for authentication. The auth layer stays on Supabase while database operations go to Neon.

## Setup Instructions

### 1. Get Neon Connection String

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or select existing
3. Go to "Connection Details"
4. Copy the connection string (PostgreSQL)
5. Add to your `.env` file:
   ```env
   NEON_DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/dbname
   ```

### 2. Run Migrations on Neon

The Supabase migration files in `supabase/migrations/` can be applied to Neon:

```bash
npm run db:migrate-neon
```

This will:
- Read all `.sql` files from `supabase/migrations/`
- Execute them in order on Neon
- Skip migrations that already exist

### 3. Sync Data from Supabase to Neon

If you have existing data in Supabase and want to copy it to Neon:

```bash
npm run db:sync-neon
```

This will:
- Fetch data from Supabase tables
- Insert into Neon with upsert logic (ON CONFLICT)
- Handle all merchant-related tables

**Required environment variables for sync:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEON_DATABASE_URL=your_neon_connection_string
```

### 4. Switch to Neon

Set in your `.env`:
```env
USE_NEON=true
```

Restart your application:
```bash
npm run dev
```

### 5. Verify Database Health

Check which database is active and health status:

```bash
npm run db:health
```

Or visit: `http://localhost:3000/api/admin/db-health`

Response:
```json
{
  "supabase": true,
  "neon": true,
  "active": "neon"
}
```

## Available Scripts

```bash
# Check database health
npm run db:health

# Run migrations on Neon
npm run db:migrate-neon

# Sync data from Supabase to Neon
npm run db:sync-neon
```

## Database Client Usage

In your code, the database abstraction layer automatically selects the correct client:

```typescript
import { getDbType, getDbClient } from "@/lib/db/client";

// Get active database type
const dbType = getDbType(); // "supabase" or "neon"

// Get active client
const client = getDbClient();
```

**Note:** For now, most of the application still uses the Supabase client directly through `lib/supabase/server.ts`. This is intentional - authentication and many features are tightly coupled with Supabase.

## Migration Path to Full Neon

To fully migrate away from Supabase (if desired), you would need to:

1. **Replace Authentication**
   - Integrate NextAuth.js, Clerk, or Lucia
   - Update all auth-related code
   - Replace session management

2. **Replace Storage**
   - Migrate to Cloudflare R2, AWS S3, or Netlify Blobs
   - Update file upload logic
   - Update all file references

3. **Replace Real-time**
   - Integrate Pusher, Ably, or polling
   - Update notification system
   - Update activity log system

4. **Rewrite Database Queries**
   - Convert Supabase queries to raw SQL or use an ORM (Drizzle/Prisma)
   - Move RLS policies to application code
   - Update all API routes

**Estimated effort:** 8-13 days of development

## Current Recommendation

**Keep the hybrid approach:**
- Use Supabase for Auth, Storage, and Real-time
- Use Neon as a database backup when Supabase hits limits
- This gives you the best of both worlds with minimal code changes

## Troubleshooting

### Error: "No database configured"
- Check that either `USE_NEON=true` with `NEON_DATABASE_URL` set, OR `NEXT_PUBLIC_SUPABASE_URL` with `NEXT_PUBLIC_SUPABASE_ANON_KEY` set

### Error: "Supabase is required for authentication"
- Even with `USE_NEON=true`, you still need Supabase credentials for auth
- Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Migration fails with "already exists"
- This is normal - the script skips already-run migrations
- Safe to continue

### Sync fails with permission errors
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)
- Service role key has full permissions for data export

## Cost Comparison

**Supabase Free Tier:**
- 500MB database
- 1GB storage
- 2GB bandwidth
- Auth included

**Neon Free Tier:**
- 0.5GB storage
- 3 billion row reads/month
- No built-in auth/storage

**Recommendation:** Use Supabase free tier initially, add Neon as backup when you hit limits.
