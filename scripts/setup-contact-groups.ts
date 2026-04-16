/**
 * One-time migration: creates contact_groups table and adds group_id to contacts.
 *
 * Usage:
 *   npx tsx scripts/setup-contact-groups.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SERVICE_ROLE_KEY in .env.local
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const SQL = `
-- 1. Create contact_groups table
CREATE TABLE IF NOT EXISTS contact_groups (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL DEFAULT 'Geral',
  position    int  NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. RLS
ALTER TABLE contact_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own groups" ON contact_groups;
CREATE POLICY "Users manage own groups" ON contact_groups
  FOR ALL
  USING  (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- 3. Add group_id to contacts (nullable → NULL means default "Geral" tab)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS group_id uuid
  REFERENCES contact_groups(id) ON DELETE SET NULL;
`;

async function main() {
  console.log("Running contact_groups migration…");
  const { error } = await supabase.rpc("exec_sql", { sql: SQL }).maybeSingle();

  if (error) {
    // Supabase might not expose exec_sql — fall back to direct REST
    console.warn("rpc exec_sql unavailable, trying direct approach…");
    // Try each statement separately via supabase-js (limited)
    console.error("Please run the following SQL in your Supabase SQL editor:\n");
    console.log(SQL);
    process.exit(1);
  }

  console.log("✓ Migration complete.");
}

main().catch((e) => { console.error(e); process.exit(1); });
