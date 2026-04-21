"use client";

import { useEffect, useState } from "react";
import MembershipsManager from "@/components/MembershipsManager";
import { useViewMode } from "@/components/ViewModeProvider";
import type { Membership, Client, Role } from "@/lib/supabase/types";

export default function MembershipsPageClient() {
  const { viewMode } = useViewMode();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [role, setRole] = useState<Role>("admin");
  const [barbershopId, setBarbershopId] = useState("");
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
      const [{ data: mems }, { data: cls }] = await Promise.all([
        supabase
          .from("memberships")
          .select("*, client:clients(*)")
          .eq("barbershop_id", resolvedId)
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("*")
          .eq("barbershop_id", resolvedId),
      ]);
      setMemberships(mems ?? []);
      setClients(cls ?? []);
      setMounted(true);
    }

    load();
  }, [viewMode]);

  if (!mounted) {
    return (
      <div>
        <div className="h-8 w-48 rounded-lg mb-2" style={{ background: "#e5e7eb" }} />
      </div>
    );
  }

  return (
    <MembershipsManager
      initialMemberships={memberships}
      clients={clients}
      role={role}
      barbershopId={barbershopId}
    />
  );
}
