"use client";

import { useEffect, useState } from "react";
import InventoryManager from "@/components/InventoryManager";
import { useViewMode } from "@/components/ViewModeProvider";
import type { Product, Role } from "@/lib/supabase/types";

export default function InventoryPageClient() {
  const { viewMode } = useViewMode();
  const [products, setProducts] = useState<Product[]>([]);
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
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("barbershop_id", resolvedId)
        .order("created_at", { ascending: false });
      setProducts(data ?? []);
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
    <InventoryManager
      initialProducts={products}
      role={role}
      barbershopId={barbershopId}
    />
  );
}
