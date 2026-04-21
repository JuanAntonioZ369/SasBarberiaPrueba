"use client";

import {
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RecentTx {
  type: string;
  amount: number;
  description: string;
  category: string;
  date: string;
  created_at: string;
}

interface DashboardStats {
  totalClients: number;
  totalProducts: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  activeMemberships: number;
  lowStock: number;
  todayIncome: number;
  todayClients: number;
  recentTransactions: RecentTx[];
}

interface Props {
  role: string;
  displayName: string;
  stats: DashboardStats;
}

export default function DashboardOverviewClient({ role, displayName, stats }: Props) {
  const firstName = displayName.split(" ")[0];
  const today = format(new Date(), "EEEE, dd 'de' MMMM yyyy", { locale: es });

  if (role === "barbero") {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            Hola, {firstName}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem", textTransform: "capitalize" }}>
            {today}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {[
            {
              label: "Clientes hoy",
              value: stats.todayClients,
              icon: UserCheck,
              color: "#0a0a0a",
              bg: "#f3f4f6",
            },
            {
              label: "Ingresos hoy",
              value: `$${stats.todayIncome}`,
              icon: DollarSign,
              color: "#16a34a",
              bg: "#dcfce7",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="card"
              style={{ display: "flex", alignItems: "center", gap: "1rem", background: bg, border: "none" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fff",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>{label}</p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color, margin: 0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "1rem" }}>
            Actividad reciente
          </h2>
          {stats.recentTransactions.slice(0, 5).map((tx, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.625rem 0",
                borderBottom: i < 4 ? "1px solid #f3f4f6" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: tx.type === "income" ? "#dcfce7" : "#fee2e2",
                  }}
                >
                  {tx.type === "income" ? (
                    <TrendingUp size={14} style={{ color: "#16a34a" }} />
                  ) : (
                    <TrendingDown size={14} style={{ color: "#dc2626" }} />
                  )}
                </div>
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>{tx.description}</p>
                  <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: 0 }}>{tx.category}</p>
                </div>
              </div>
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: tx.type === "income" ? "#16a34a" : "#dc2626",
                }}
              >
                {tx.type === "income" ? "+" : "-"}${tx.amount}
              </span>
            </div>
          ))}
          {stats.recentTransactions.length === 0 && (
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "1rem 0" }}>
              No hay transacciones recientes
            </p>
          )}
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
          Hola, {firstName}
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem", textTransform: "capitalize" }}>
          {today}
        </p>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            label: "Clientes",
            value: stats.totalClients,
            icon: Users,
            color: "#0a0a0a",
          },
          {
            label: "Ingresos",
            value: `$${stats.totalIncome}`,
            icon: TrendingUp,
            color: "#16a34a",
          },
          {
            label: "Gastos",
            value: `$${stats.totalExpense}`,
            icon: TrendingDown,
            color: "#dc2626",
          },
          {
            label: "Membresías",
            value: stats.activeMemberships,
            icon: CreditCard,
            color: "#1d4ed8",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{label}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.25rem", color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "1rem",
          marginBottom: "1rem",
          alignItems: "start",
        }}
      >
        {/* Recent transactions */}
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <h2 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "1rem" }}>
            Transacciones recientes
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Fecha</th>
                  <th style={{ textAlign: "right" }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "1.5rem", color: "#9ca3af" }}>
                      No hay transacciones
                    </td>
                  </tr>
                ) : (
                  stats.recentTransactions.map((tx, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{tx.description}</td>
                      <td>
                        <span className="badge badge-blue">{tx.category}</span>
                      </td>
                      <td style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                        {format(new Date(tx.date), "dd MMM yyyy", { locale: es })}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "0.875rem",
                            color: tx.type === "income" ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {tx.type === "income" ? "+" : "-"}${tx.amount}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Extra cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div className="card">
          <h2 style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.9rem" }}>Balance neto</h2>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: stats.balance >= 0 ? "#16a34a" : "#dc2626",
              margin: 0,
            }}
          >
            ${stats.balance}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
            Ingresos - Gastos
          </p>
        </div>

        {stats.lowStock > 0 && (
          <div
            className="card"
            style={{ background: "#fff5f5", border: "1px solid #fecaca" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <AlertTriangle size={15} style={{ color: "#dc2626" }} />
              <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#dc2626" }}>
                Stock bajo
              </span>
            </div>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#dc2626", margin: 0 }}>
              {stats.lowStock}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
              Productos bajo mínimo
            </p>
          </div>
        )}

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Package size={15} style={{ color: "#374151" }} />
            <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>Inventario</span>
          </div>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>{stats.totalProducts}</p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
            Productos registrados
          </p>
        </div>
      </div>
    </div>
  );
}
