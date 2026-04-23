"use client";

import { useEffect, useState } from "react";
import ClientsManager from "@/components/ClientsManager";
import { useViewMode } from "@/components/ViewModeProvider";
import type { Client, Role } from "@/lib/supabase/types";

export default function ClientsPageClient() {
  const { viewMode } = useViewMode();
  const [clients, setClients] = useState<Client[]>([]);
  const [role, setRole] = useState<Role>("admin");
  const [barbershopId, setBarbershopId] = useState("");
  const [userId, setUserId] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function load() {
      const { createClient } = await import("@/lib/supabase/client");
      const { getActiveBarbershopId } = await import("@/lib/supabase/getBarbershopId");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, barbershop_id")
        .eq("id", user.id)
        .single();
      if (!profile) return;
      const defaultId = await getActiveBarbershopId(supabase, user.id, profile.role);
      if (!defaultId) return;
      const resolvedId = viewMode.mode === "store" ? viewMode.storeId : defaultId;
      setRole(profile.role);
      setBarbershopId(resolvedId);
      setUserId(user.id);
      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("barbershop_id", resolvedId)
        .order("created_at", { ascending: false });
      setClients(data ?? []);
      setMounted(true);
    }

    load();
  }, [viewMode]);

  if (!mounted) {
    return (
      <div>
        <div className="h-8 w-48 rounded-lg mb-2" style={{ background: "#e5e7eb" }} />
        <div className="h-4 w-32 rounded" style={{ background: "#e5e7eb" }} />
      </div>
    );
  }

  return (
    <ClientsManager
      initialClients={clients}
      role={role}
      barbershopId={barbershopId}
      userId={userId}
    />
  );
}
