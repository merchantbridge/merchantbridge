import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/marketplace-schema.ts',
  out: 'supabase/migrations',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  },
})
