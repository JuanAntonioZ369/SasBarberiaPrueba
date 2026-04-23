import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin client — usa la service role key.
 * SOLO usar en Server Components o API Routes (nunca en el browser).
 * Requiere SUPABASE_SERVICE_ROLE_KEY en las variables de entorno del servidor.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
