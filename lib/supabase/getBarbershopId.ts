import type { SupabaseClient } from "@supabase/supabase-js";

export async function getActiveBarbershopId(
  supabase: SupabaseClient,
  userId: string,
  role: string
): Promise<string | null> {
  if (role === "barbero") {
    const { data } = await supabase
      .from("profiles")
      .select("barbershop_id")
      .eq("id", userId)
      .single();
    return data?.barbershop_id ?? null;
  }
  // admin: buscar su primer barbershop por owner_id
  const { data } = await supabase
    .from("barbershops")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data?.id ?? null;
}
