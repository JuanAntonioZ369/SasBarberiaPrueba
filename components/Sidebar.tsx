"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  CreditCard,
  Settings,
  Scissors,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { useViewMode } from "@/components/ViewModeProvider";

interface SidebarProps {
  user: User;
  role: string;
  barbershopName: string;
}

const allNavItems = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: ["admin", "barbero"],
  },
  {
    href: "/dashboard/clients",
    icon: Users,
    label: "Clientes",
    roles: ["admin", "barbero"],
  },
  {
    href: "/dashboard/inventory",
    icon: Package,
    label: "Inventario",
    roles: ["admin", "barbero"],
  },
  {
    href: "/dashboard/finances",
    icon: DollarSign,
    label: "Finanzas",
    roles: ["admin"],
  },
  {
    href: "/dashboard/memberships",
    icon: CreditCard,
    label: "Membresías",
    roles: ["admin", "barbero"],
  },
  {
    href: "/dashboard/settings",
    icon: Settings,
    label: "Configuración",
    roles: ["admin"],
  },
];

function SidebarContent({
  user,
  role,
  barbershopName,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { viewMode, exitStore } = useViewMode();
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitPassword, setExitPassword] = useState("");
  const [exitError, setExitError] = useState("");
  const [exitLoading, setExitLoading] = useState(false);

  // When in store view mode, behave as "barbero" for nav filtering
  const effectiveRole = viewMode.mode === "store" ? "barbero" : role;
  const navItems = allNavItems.filter((item) => item.roles.includes(effectiveRole));

  async function handleLogout() {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleExitStore() {
    if (!exitPassword) return;
    setExitLoading(true);
    setExitError("");
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: exitPassword,
    });
    setExitLoading(false);
    if (error) {
      setExitError("Contraseña incorrecta");
      return;
    }
    exitStore();
    setShowExitModal(false);
    setExitPassword("");
    router.push("/dashboard");
    router.refresh();
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.email?.split("@")[0] ??
    "Usuario";

  const storeName = viewMode.mode === "store" ? viewMode.storeName : "";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#ffffff",
        borderRight: "1px solid #e5e7eb",
      }}
    >
      {/* Store view mode banner */}
      {viewMode.mode === "store" && (
        <div
          style={{
            background: "#fef3c7",
            borderBottom: "1px solid #fde68a",
            padding: "0.5rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.75rem", color: "#92400e", fontWeight: 600 }}>
            Vista: {storeName}
          </span>
          <button
            onClick={() => { setShowExitModal(true); setExitPassword(""); setExitError(""); }}
            style={{
              fontSize: "0.7rem",
              color: "#92400e",
              background: "transparent",
              border: "1px solid #f59e0b",
              borderRadius: "0.375rem",
              padding: "0.15rem 0.5rem",
              cursor: "pointer",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Salir
          </button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: "1.25rem",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Scissors size={18} style={{ color: "#0a0a0a" }} />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0a0a0a" }}>
            {viewMode.mode === "store" ? storeName : barbershopName}
          </span>
        </div>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0a0a0a", margin: 0, lineHeight: 1.3 }}>
          {displayName}
        </p>
        <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.1rem 0 0.5rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.email}
        </p>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.15rem 0.5rem",
            borderRadius: "9999px",
            fontSize: "0.7rem",
            fontWeight: 600,
            background: effectiveRole === "admin" ? "#fef9c3" : "#dbeafe",
            color: effectiveRole === "admin" ? "#854d0e" : "#1d4ed8",
          }}
        >
          {effectiveRole === "admin" ? "Admin" : "Barbero"}
        </span>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "0.75rem",
          overflowY: "auto",
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                textDecoration: "none",
                marginBottom: "0.125rem",
                transition: "background 0.12s",
                background: isActive ? "#f3f4f6" : "transparent",
                color: isActive ? "#0a0a0a" : "#6b7280",
                borderLeft: isActive ? "3px solid #0a0a0a" : "3px solid transparent",
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div
        style={{
          padding: "0.75rem",
          borderTop: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            width: "100%",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #d1d5db",
            background: "transparent",
            color: "#dc2626",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.12s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>

      {/* Exit store modal */}
      {showExitModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowExitModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              width: "100%",
              maxWidth: "22rem",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ShieldCheck size={18} style={{ color: "#0a0a0a" }} />
                <h2 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Volver a Admin</h2>
              </div>
              <button
                onClick={() => setShowExitModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: "0.25rem", color: "#6b7280" }}
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
              Confirma tu contraseña para salir de la vista de tienda.
            </p>
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Contraseña
              </label>
              <input
                type="password"
                placeholder="Tu contraseña"
                value={exitPassword}
                onChange={(e) => { setExitPassword(e.target.value); setExitError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleExitStore(); }}
                autoFocus
              />
            </div>
            {exitError && (
              <p style={{ fontSize: "0.8rem", color: "#dc2626", marginBottom: "0.75rem" }}>{exitError}</p>
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowExitModal(false)}
                style={{ flex: 1, padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "0.5rem", background: "transparent", cursor: "pointer", fontSize: "0.875rem", color: "#374151" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleExitStore}
                disabled={exitLoading || !exitPassword}
                style={{
                  flex: 1,
                  padding: "0.5rem",
                  border: "none",
                  borderRadius: "0.5rem",
                  background: "#0a0a0a",
                  color: "#fff",
                  cursor: exitLoading || !exitPassword ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  opacity: exitLoading || !exitPassword ? 0.5 : 1,
                }}
              >
                {exitLoading ? "Verificando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar(props: SidebarProps) {
  return <SidebarContent {...props} />;
}
