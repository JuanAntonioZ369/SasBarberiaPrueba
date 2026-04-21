"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  X,
  CreditCard,
} from "lucide-react";
import type { Membership, Client, Role, MembershipPlan, MembershipStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface MembershipsManagerProps {
  initialMemberships: Membership[];
  clients: Client[];
  role: Role;
  barbershopId: string;
}

const PLANS: { value: MembershipPlan; label: string; months: number }[] = [
  { value: "monthly", label: "Mensual", months: 1 },
  { value: "quarterly", label: "Trimestral", months: 3 },
  { value: "annual", label: "Anual", months: 12 },
];

const planLabel: Record<MembershipPlan, string> = {
  monthly: "Mensual",
  quarterly: "Trimestral",
  annual: "Anual",
};

const statusLabel: Record<MembershipStatus, string> = {
  active: "Activa",
  expired: "Vencida",
  cancelled: "Cancelada",
};

const statusBadge: Record<MembershipStatus, string> = {
  active: "badge-green",
  expired: "badge-yellow",
  cancelled: "badge-red",
};

const emptyForm = {
  client_id: "",
  plan: "monthly" as MembershipPlan,
  price: "200",
  start_date: new Date().toISOString().split("T")[0],
};

export default function MembershipsManager({
  initialMemberships,
  clients,
  role,
  barbershopId,
}: MembershipsManagerProps) {
  const [memberships, setMemberships] = useState<Membership[]>(initialMemberships);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const filtered = memberships.filter((m) => {
    const clientName =
      m.client?.full_name ?? clients.find((c) => c.id === m.client_id)?.full_name ?? "";
    return (
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      planLabel[m.plan].toLowerCase().includes(search.toLowerCase())
    );
  });

  function getEndDate(startDate: string, months: number): string {
    const d = new Date(startDate);
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split("T")[0];
  }

  async function handleSave() {
    setLoading(true);
    const planConfig = PLANS.find((p) => p.value === form.plan)!;
    const end_date = getEndDate(form.start_date, planConfig.months);
    const payload: Omit<Membership, "id" | "created_at" | "client"> = {
      barbershop_id: barbershopId,
      client_id: form.client_id,
      plan: form.plan,
      price: parseFloat(form.price),
      start_date: form.start_date,
      end_date,
      status: "active",
    };

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data } = await supabase
      .from("memberships")
      .insert(payload)
      .select("*, client:clients(*)")
      .single();
    if (data) setMemberships((prev) => [data, ...prev]);
    setShowModal(false);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta membresía?")) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("memberships").delete().eq("id", id);
    setMemberships((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleStatusChange(id: string, status: MembershipStatus) {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("memberships").update({ status }).eq("id", id);
    setMemberships((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
  }

  const activeCount = memberships.filter((m) => m.status === "active").length;
  const totalRevenue = memberships
    .filter((m) => m.status === "active")
    .reduce((s, m) => s + m.price, 0);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Membresías</h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
            {activeCount} activas · ${totalRevenue}/mes en ingresos recurrentes
          </p>
        </div>
        {role === "admin" && (
          <button onClick={() => { setForm(emptyForm); setShowModal(true); }} className="btn-primary">
            <Plus size={16} />
            Nueva membresía
          </button>
        )}
      </div>

      {role === "barbero" && (
        <div
          style={{
            borderRadius: "0.5rem",
            padding: "0.75rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
            background: "#dbeafe",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
          }}
        >
          Vista de solo lectura — solo el administrador puede crear o modificar membresías.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        {PLANS.map((plan) => {
          const count = memberships.filter(
            (m) => m.plan === plan.value && m.status === "active"
          ).length;
          return (
            <div key={plan.value} className="card" style={{ textAlign: "center" }}>
              <CreditCard size={20} style={{ margin: "0 auto 0.5rem", color: "#374151" }} />
              <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0 }}>{count}</p>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.125rem 0 0" }}>
                {plan.label}
              </p>
            </div>
          );
        })}
        <div className="card" style={{ textAlign: "center" }}>
          <CreditCard size={20} style={{ margin: "0 auto 0.5rem", color: "#16a34a" }} />
          <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#16a34a", margin: 0 }}>
            {activeCount}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.125rem 0 0" }}>
            Total activas
          </p>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <Search
          size={15}
          style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
        />
        <input
          type="text"
          placeholder="Buscar cliente o plan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: "2.25rem" }}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Plan</th>
                <th>Precio</th>
                <th>Inicio</th>
                <th>Vence</th>
                <th>Estado</th>
                {role === "admin" && <th style={{ textAlign: "right" }}>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={role === "admin" ? 7 : 6}
                    style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}
                  >
                    No hay membresías
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const clientName =
                    m.client?.full_name ??
                    clients.find((c) => c.id === m.client_id)?.full_name ??
                    "—";
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500 }}>{clientName}</td>
                      <td>
                        <span className="badge badge-blue">{planLabel[m.plan]}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>${m.price}</td>
                      <td style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                        {format(parseISO(m.start_date), "dd MMM yyyy", { locale: es })}
                      </td>
                      <td style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                        {format(parseISO(m.end_date), "dd MMM yyyy", { locale: es })}
                      </td>
                      <td>
                        {role === "admin" ? (
                          <select
                            value={m.status}
                            onChange={(e) =>
                              handleStatusChange(m.id, e.target.value as MembershipStatus)
                            }
                            style={{ width: "auto", fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}
                          >
                            <option value="active">Activa</option>
                            <option value="expired">Vencida</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                        ) : (
                          <span className={cn("badge", statusBadge[m.status])}>
                            {statusLabel[m.status]}
                          </span>
                        )}
                      </td>
                      {role === "admin" && (
                        <td style={{ textAlign: "right" }}>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="btn-ghost"
                            style={{ padding: "0.375rem 0.625rem", color: "#dc2626" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && role === "admin" && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Nueva membresía</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ padding: "0.25rem 0.5rem", border: "none" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Cliente *</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Plan *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                  {PLANS.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setForm({ ...form, plan: p.value })}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.12s",
                        background: form.plan === p.value ? "#0a0a0a" : "transparent",
                        color: form.plan === p.value ? "#ffffff" : "#6b7280",
                        border: form.plan === p.value ? "1px solid #0a0a0a" : "1px solid #d1d5db",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Precio ($)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Fecha inicio</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
              </div>
              {form.plan && form.start_date && (
                <div
                  style={{
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    fontSize: "0.875rem",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    color: "#6b7280",
                  }}
                >
                  Vence el{" "}
                  <strong style={{ color: "#0a0a0a" }}>
                    {format(
                      parseISO(getEndDate(form.start_date, PLANS.find(p => p.value === form.plan)!.months)),
                      "dd 'de' MMMM yyyy",
                      { locale: es }
                    )}
                  </strong>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !form.client_id}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {loading ? "Guardando..." : "Crear membresía"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
