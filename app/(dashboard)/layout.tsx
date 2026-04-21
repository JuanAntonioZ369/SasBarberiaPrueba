import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ViewModeProvider } from "@/components/ViewModeProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, barbershop_id")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "barbero";

  let barbershopName = "Mi Barbería";
  if (role === "admin") {
    const { data: bs } = await supabase
      .from("barbershops")
      .select("name")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();
    barbershopName = bs?.name ?? "Mi Barbería";
  } else {
    const barbershopId = profile?.barbershop_id;
    if (barbershopId) {
      const { data: bs } = await supabase
        .from("barbershops")
        .select("name")
        .eq("id", barbershopId)
        .single();
      barbershopName = bs?.name ?? "Mi Barbería";
    }
  }

  return (
    <ViewModeProvider>
      <div style={{ display: "flex", height: "100vh", background: "#f9fafb" }}>
        <aside
          style={{
            width: 240,
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <Sidebar user={user} role={role} barbershopName={barbershopName} />
        </aside>
        <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
          {children}
        </main>
      </div>
    </ViewModeProvider>
  );
}
