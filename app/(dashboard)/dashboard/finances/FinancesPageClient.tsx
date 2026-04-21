"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FinancesManager from "@/components/FinancesManager";
import { useViewMode } from "@/components/ViewModeProvider";
import type { Transaction } from "@/lib/supabase/types";

export default function FinancesPageClient() {
  const router = useRouter();
  const { viewMode } = useViewMode();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [barbershopId, setBarbershopId] = useState("");
  const [userId, setUserId] = useState("");
  const [clients, setClients] = useState<{ id: string; full_name: string }[]>([]);
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
      if (profile.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
      const defaultId = await getActiveBarbershopId(supabase, user.id, profile.role);
      if (!defaultId) return;
      const resolvedId = viewMode.mode === "store" ? viewMode.storeId : defaultId;
      setBarbershopId(resolvedId);
      setUserId(user.id);
      const [{ data: txData }, { data: clientData }] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .eq("barbershop_id", resolvedId)
          .order("date", { ascending: false }),
        supabase
          .from("clients")
          .select("id, full_name")
          .eq("barbershop_id", resolvedId),
      ]);
      setTransactions(txData ?? []);
      setClients(clientData ?? []);
      setMounted(true);
    }

    load();
  }, [router, viewMode]);

  if (!mounted) {
    return (
      <div>
        <div className="h-8 w-48 rounded-lg mb-2" style={{ background: "#e5e7eb" }} />
      </div>
    );
  }

  return (
    <FinancesManager
      initialTransactions={transactions}
      clients={clients}
      barbershopId={barbershopId}
      userId={userId}
    />
  );
}
