"use client";

import { useState } from "react";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  X,
  Scissors,
  Package,
  CreditCard,
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import type { Transaction } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface QuickButtonConfig {
  label: string;
  icon: React.ElementType;
  defaultAmount: number;
  type: "income" | "expense";
  category: string;
}

interface QuickModalState {
  label: string;
  type: "income" | "expense";
  category: string;
  defaultAmount: number;
}

interface FinancesManagerProps {
  initialTransactions: Transaction[];
  clients: { id: string; full_name: string }[];
  barbershopId: string;
  userId: string;
}

const QUICK_BUTTONS: QuickButtonConfig[] = [
  { label: "Corte", icon: Scissors, defaultAmount: 50, type: "income", category: "Corte" },
  { label: "Corte + Barba", icon: Scissors, defaultAmount: 80, type: "income", category: "Barba" },
  { label: "Venta producto", icon: Package, defaultAmount: 0, type: "income", category: "Venta producto" },
  { label: "Membresía", icon: CreditCard, defaultAmount: 200, type: "income", category: "Membresía" },
  { label: "Otro ingreso", icon: TrendingUp, defaultAmount: 0, type: "income", category: "Otro" },
  { label: "Gasto", icon: TrendingDown, defaultAmount: 0, type: "expense", category: "Otro" },
];

type PeriodFilter = "today" | "week" | "month";

function getPeriodRange(period: PeriodFilter): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  if (period === "today") {
    return { start: end, end };
  }
  if (period === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return { start: start.toISOString().split("T")[0], end };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return { start: start.toISOString().split("T")[0], end };
}

function exportToExcel(transactions: Transaction[], period: string) {
  const data = transactions.map((t) => ({
    Fecha: t.date,
    Tipo: t.type === "income" ? "Ingreso" : "Gasto",
    Descripción: t.description,
    Categoría: t.category ?? "",
    Monto: t.type === "income" ? t.amount : -t.amount,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
  XLSX.writeFile(wb, `finanzas-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export default function FinancesManager({
  initialTransactions,
  clients,
  barbershopId,
  userId,
}: FinancesManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [period, setPeriod] = useState<PeriodFilter>("today");
  const [quickModal, setQuickModal] = useState<QuickModalState | null>(null);
  const [quickAmount, setQuickAmount] = useState("");
  const [quickClientId, setQuickClientId] = useState("");
  const [quickNote, setQuickNote] = useState("");
  const [saving, setSaving] = useState(false);

  const { start, end } = getPeriodRange(period);

  const periodTransactions = transactions.filter((t) => t.date >= start && t.date <= end);

  const totalIncome = periodTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = periodTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  const net = totalIncome - totalExpense;

  function openQuickModal(btn: QuickButtonConfig) {
    setQuickModal({
      label: btn.label,
      type: btn.type,
      category: btn.category,
      defaultAmount: btn.defaultAmount,
    });
    setQuickAmount(btn.defaultAmount > 0 ? btn.defaultAmount.toString() : "");
    setQuickClientId("");
    setQuickNote("");
  }

  async function handleQuickSave() {
    if (!quickModal) return;
    const amount = parseFloat(quickAmount);
    if (isNaN(amount) || amount <= 0) return;
    setSaving(true);

    const today = new Date().toISOString().split("T")[0];
    const payload = {
      barbershop_id: barbershopId,
      type: quickModal.type,
      amount,
      description: quickNote || quickModal.label,
      category: quickModal.category,
      client_id: quickClientId || null,
      date: today,
      created_by: userId,
    };

    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .insert(payload)
      .select()
      .single();

    if (data) setTransactions((prev) => [data, ...prev]);
    setQuickModal(null);
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta transacción?")) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("transactions").delete().eq("id", id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  const periodLabel: Record<PeriodFilter, string> = {
    today: "Hoy",
    week: "Esta semana",
    month: "Este mes",
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Finanzas</h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
          {transactions.length} transacciones registradas
        </p>
      </div>

      {/* Sección A: Registro rápido */}
      <div
        className="card"
        style={{ marginBottom: "1.25rem" }}
      >
        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#6b7280", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Registro rápido
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {QUICK_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            const isExpense = btn.type === "expense";
            return (
              <button
                key={btn.label}
                onClick={() => openQuickModal(btn)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.875rem 0.5rem",
                  borderRadius: "0.625rem",
                  border: `1px solid ${isExpense ? "#fecaca" : "#e5e7eb"}`,
                  background: isExpense ? "#fff5f5" : "#fafafa",
                  cursor: "pointer",
                  transition: "background 0.12s, border-color 0.12s",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: isExpense ? "#dc2626" : "#0a0a0a",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isExpense ? "#fee2e2" : "#f3f4f6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isExpense ? "#fff5f5" : "#fafafa";
                }}
              >
                <Icon size={20} style={{ color: isExpense ? "#dc2626" : "#374151" }} />
                {btn.label}
                {btn.defaultAmount > 0 && (
                  <span style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 400 }}>
                    $ {btn.defaultAmount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sección B: Filtros de período + Exportar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        {(["today", "week", "month"] as PeriodFilter[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "0.5rem",
              border: "1px solid",
              borderColor: period === p ? "#0a0a0a" : "#d1d5db",
              background: period === p ? "#0a0a0a" : "transparent",
              color: period === p ? "#ffffff" : "#6b7280",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            {periodLabel[p]}
          </button>
        ))}
        <button
          onClick={() => exportToExcel(periodTransactions, period)}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.375rem 0.875rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
            fontSize: "0.8rem",
            color: "#374151",
            fontWeight: 500,
          }}
        >
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      {/* Resumen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem",
          marginBottom: "1.25rem",
        }}
      >
        {[
          { label: "Ingresos", value: totalIncome, color: "#16a34a", bg: "#dcfce7" },
          { label: "Gastos", value: totalExpense, color: "#dc2626", bg: "#fee2e2" },
          { label: "Neto", value: net, color: net >= 0 ? "#16a34a" : "#dc2626", bg: net >= 0 ? "#dcfce7" : "#fee2e2" },
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="card"
            style={{ background: bg, border: "none", textAlign: "center", padding: "0.875rem" }}
          >
            <p style={{ fontSize: "0.75rem", color: "#374151", margin: "0 0 0.25rem", fontWeight: 500 }}>
              {label}
            </p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color, margin: 0 }}>
              $ {value.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Hora</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th style={{ textAlign: "right" }}>Monto</th>
                <th style={{ textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {periodTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                    No hay transacciones en este período
                  </td>
                </tr>
              ) : (
                periodTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ color: "#6b7280", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                      {format(new Date(tx.created_at), "HH:mm", { locale: es })}
                    </td>
                    <td style={{ fontWeight: 500 }}>{tx.description}</td>
                    <td>
                      <span className="badge badge-blue">{tx.category}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontWeight: 700,
                          color: tx.type === "income" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {tx.type === "income" ? "+" : "-"}${tx.amount}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="btn-ghost"
                        style={{
                          padding: "0.25rem 0.5rem",
                          color: "#dc2626",
                          border: "none",
                          fontSize: "0.75rem",
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Modal */}
      {quickModal && (
        <div className="modal-overlay" onClick={() => setQuickModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                Registrar {quickModal.label}
              </h2>
              <button
                onClick={() => setQuickModal(null)}
                className="btn-ghost"
                style={{ padding: "0.25rem 0.5rem", border: "none" }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem", color: "#374151" }}>
                  Monto ($) *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  autoFocus
                  style={{ fontSize: "1.125rem", fontWeight: 600 }}
                />
              </div>

              {quickModal.type === "income" && (
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem", color: "#374151" }}>
                    Cliente (opcional)
                  </label>
                  <select
                    value={quickClientId}
                    onChange={(e) => setQuickClientId(e.target.value)}
                  >
                    <option value="">Sin cliente</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem", color: "#374151" }}>
                  Nota (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Descripción adicional..."
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={handleQuickSave}
              disabled={saving || !quickAmount || parseFloat(quickAmount) <= 0}
              style={{
                marginTop: "1.25rem",
                width: "100%",
                padding: "0.75rem",
                background: quickModal.type === "expense" ? "#dc2626" : "#0a0a0a",
                color: "#ffffff",
                border: "none",
                borderRadius: "0.625rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer",
                opacity: saving || !quickAmount || parseFloat(quickAmount) <= 0 ? 0.5 : 1,
                transition: "opacity 0.12s",
              }}
            >
              {saving
                ? "Guardando..."
                : `Guardar — $ ${parseFloat(quickAmount) > 0 ? parseFloat(quickAmount).toFixed(2) : "0.00"}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
