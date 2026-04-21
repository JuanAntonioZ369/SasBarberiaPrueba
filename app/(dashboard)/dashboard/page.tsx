import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardOverviewClient from "./DashboardOverviewClient";
import { getActiveBarbershopId } from "@/lib/supabase/getBarbershopId";

async function getData(barbershopId: string) {
  const { createClient: sb } = await import("@/lib/supabase/server");
  const supabase = await sb();
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalClients },
    { count: totalProducts },
    { data: transactions },
    { count: activeMemberships },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("barbershop_id", barbershopId),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("barbershop_id", barbershopId),
    supabase
      .from("transactions")
      .select("type, amount, date, client_id, description, category, created_at")
      .eq("barbershop_id", barbershopId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("memberships")
      .select("*", { count: "exact", head: true })
      .eq("barbershop_id", barbershopId)
      .eq("status", "active"),
    supabase
      .from("products")
      .select("stock, min_stock")
      .eq("barbershop_id", barbershopId),
  ]);

  const txList = transactions ?? [];
  const totalIncome = txList
    .filter((t) => t.type === "income")
    .reduce((s: number, t: { amount: number }) => s + t.amount, 0);
  const totalExpense = txList
    .filter((t) => t.type === "expense")
    .reduce((s: number, t: { amount: number }) => s + t.amount, 0);
  const todayTx = txList.filter((t: { date: string }) => t.date === today);
  const todayIncome = todayTx
    .filter((t: { type: string }) => t.type === "income")
    .reduce((s: number, t: { amount: number }) => s + t.amount, 0);

  const products = lowStockProducts ?? [];
  const lowStock = products.filter(
    (p: { stock: number; min_stock: number }) => p.stock <= p.min_stock
  ).length;

  return {
    totalClients: totalClients ?? 0,
    totalProducts: totalProducts ?? 0,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    activeMemberships: activeMemberships ?? 0,
    lowStock,
    todayIncome,
    todayClients: new Set(todayTx.filter((t: { client_id: string | null }) => t.client_id).map((t: { client_id: string | null }) => t.client_id)).size,
    recentTransactions: txList.slice(0, 6),
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, barbershop_id, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "barbero";
  const displayName =
    (profile?.full_name as string | null) ??
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Usuario";

  const barbershopId = await getActiveBarbershopId(supabase, user.id, role);
  if (!barbershopId) {
    return (
      <DashboardOverviewClient
        role={role}
        displayName={displayName}
        stats={{
          totalClients: 0,
          totalProducts: 0,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          activeMemberships: 0,
          lowStock: 0,
          todayIncome: 0,
          todayClients: 0,
          recentTransactions: [],
        }}
      />
    );
  }

  const stats = await getData(barbershopId);

  return (
    <DashboardOverviewClient
      role={role}
      displayName={displayName}
      stats={stats}
    />
  );
}
