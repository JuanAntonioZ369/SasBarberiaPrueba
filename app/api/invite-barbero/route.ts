import { createClient as createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Verify the calling user is an authenticated admin
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { email, barbershopId } = await request.json();
  if (!email || !barbershopId) {
    return NextResponse.json({ error: "email y barbershopId son requeridos" }, { status: 400 });
  }

  // Verify the barbershop belongs to this admin
  const { data: shop } = await supabase
    .from("barbershops")
    .select("id")
    .eq("id", barbershopId)
    .eq("owner_id", user.id)
    .single();
  if (!shop) {
    return NextResponse.json({ error: "Local no encontrado o no autorizado" }, { status: 403 });
  }

  // Use service role key to invite the user
  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor" },
      { status: 500 }
    );
  }

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: {
      role: "barbero",
      barbershop_id: barbershopId,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, userId: data.user?.id });
}
