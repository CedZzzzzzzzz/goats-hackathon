import { createClient } from "@supabase/supabase-js"

// ── Server-side URL/key (API routes only — never import in client components) ──
const supabaseUrl =
  process.env.SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  ""

// Anon key — used for reads / public operations
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  ""

// Service-role key — bypasses ALL RLS policies.
// Only available server-side; never exposed to the browser.
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

/** true when real Supabase credentials are present */
export const supabaseReady =
  supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 10

/**
 * Standard anon client — subject to RLS.
 * Use for reads that should respect row-level security.
 */
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder",
)

/**
 * Admin client — uses the service-role key, bypasses RLS entirely.
 * Use for all server-side writes (enrollments, schedule entries, etc.)
 * to avoid being blocked by RLS policies on auth-related tables.
 */
export const supabaseAdmin = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  // Fall back to anon key if service key not yet set
  (supabaseServiceKey || supabaseAnonKey) || "placeholder",
  {
    auth: {
      autoRefreshToken:  false,
      persistSession:    false,
    },
  }
)
