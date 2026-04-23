"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Plus,
  Scissors,
  Mail,
  Building2,
  UserPlus,
  X,
  Trash2,
  LogIn,
} from "lucide-react";
import type { Barbershop } from "@/lib/supabase/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useViewMode } from "@/components/ViewModeProvider";

interface Barbero {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function SettingsPageClient() {
  const router = useRouter();
  const { enterStore } = useViewMode();
  const [mounted, setMounted] = useState(false);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showBarberoModal, setShowBarberoModal] = useState(false);
  const [shopForm, setShopForm] = useState({ name: "", location: "" });
  const [barberoEmail, setBarberoEmail] = useState("");
  const [barberoShopId, setBarberoShopId] = useState("");
  const [inviteResult, setInviteResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, barbershop_id")
        .eq("id", user.id)
        .single();
      if (!profile || profile.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
      const { data: shops } = await supabase
        .from("barbershops")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });

      // Obtener barberos de TODOS los locales del admin
      const shopIds = (shops ?? []).map((s: { id: string }) => s.id);
      let barbers: Barbero[] = [];
      if (shopIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .in("barbershop_id", shopIds)
          .eq("role", "barbero");
        barbers = data ?? [];
      }
      setBarbershops(shops ?? []);
      setBarberos(barbers);
      setMounted(true);
    }

    load();
  }, [router]);

  async function handleAddShop() {
    setSaving(true);
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const { data } = await supabase
      .from("barbershops")
      .insert({ ...shopForm, owner_id: user.id })
      .select()
      .single();
    if (data) setBarbershops((prev) => [...prev, data]);
    setShowShopModal(false);
    setShopForm({ name: "", location: "" });
    setSaving(false);
  }

  async function handleDeleteShop(shopId: string) {
    if (!confirm("¿Eliminar este local? Se eliminarán todos sus datos.")) return;
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("barbershops").delete().eq("id", shopId);
    setBarbershops((prev) => prev.filter((s) => s.id !== shopId));
  }

  async function handleInvite() {
    if (!barberoEmail || !barberoShopId) return;
    setSaving(true);
    setInviteResult(null);
    try {
      const res = await fetch("/api/invite-barbero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: barberoEmail, barbershopId: barberoShopId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setInviteResult({ type: "error", msg: json.error ?? "Error al enviar invitación" });
      } else {
        setInviteResult({ type: "success", msg: `Invitación enviada a ${barberoEmail}. El barbero recibirá un email para crear su contraseña.` });
        setBarberoEmail("");
        setBarberoShopId("");
      }
    } catch {
      setInviteResult({ type: "error", msg: "Error de red. Intenta de nuevo." });
    } finally {
      setSaving(false);
    }
  }

  function handleEnterStore(shop: Barbershop) {
    enterStore(shop.id, shop.name);
    router.push("/dashboard");
  }

  if (!mounted) {
    return (
      <div>
        <div className="h-8 w-48 rounded-lg mb-2" style={{ background: "#e5e7eb" }} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "42rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Configuración</h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
          Gestiona tus locales y equipo de trabajo
        </p>
      </div>

      {/* Mis locales */}
      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 size={18} style={{ color: "#374151" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>Mis locales</h2>
          </div>
          <button onClick={() => setShowShopModal(true)} className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.875rem" }}>
            <Plus size={14} />
            Agregar local
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {barbershops.map((shop) => (
            <div key={shop.id} className="card" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f3f4f6",
                    flexShrink: 0,
                  }}
                >
                  <Scissors size={18} style={{ color: "#374151" }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontWeight: 600, margin: 0 }}>{shop.name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.875rem", color: "#6b7280", marginTop: "0.125rem" }}>
                    <MapPin size={12} />
                    {shop.location}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                    Creado{" "}
                    {format(new Date(shop.created_at), "dd 'de' MMMM yyyy", { locale: es })}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <button
                  onClick={() => handleEnterStore(shop)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.75rem",
                    padding: "0.3rem 0.625rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    color: "#374151",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <LogIn size={13} />
                  Entrar
                </button>
                <button
                  onClick={() => handleDeleteShop(shop.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.3rem 0.5rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #fecaca",
                    background: "#fff5f5",
                    color: "#dc2626",
                    cursor: "pointer",
                  }}
                  title="Eliminar local"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          {barbershops.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "1.5rem", color: "#9ca3af", fontSize: "0.875rem" }}>
              No hay locales registrados.
            </div>
          )}
        </div>
      </section>

      {/* Barberos */}
      <section>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Scissors size={18} style={{ color: "#374151" }} />
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>Barberos</h2>
          </div>
          <button onClick={() => setShowBarberoModal(true)} className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.4rem 0.875rem" }}>
            <UserPlus size={14} />
            Invitar barbero
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {barberos.map((b) => (
            <div key={b.id} className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    background: "#f3f4f6",
                    color: "#0a0a0a",
                    flexShrink: 0,
                  }}
                >
                  {b.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: "0.875rem", margin: 0 }}>{b.full_name}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#6b7280" }}>
                    <Mail size={10} />
                    {b.email}
                  </div>
                </div>
              </div>
              <span className="badge badge-blue">Barbero</span>
            </div>
          ))}
          {barberos.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "1.5rem", fontSize: "0.875rem", color: "#9ca3af" }}>
              No hay barberos registrados. Invita a tu equipo.
            </div>
          )}
        </div>
      </section>

      {/* Add shop modal */}
      {showShopModal && (
        <div className="modal-overlay" onClick={() => setShowShopModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Agregar local</h2>
              <button onClick={() => setShowShopModal(false)} className="btn-ghost" style={{ padding: "0.25rem 0.5rem", border: "none" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  Nombre del local *
                </label>
                <input
                  type="text"
                  placeholder="SasBarbería Norte"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Av. Principal 123"
                  value={shopForm.location}
                  onChange={(e) => setShopForm({ ...shopForm, location: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button onClick={() => setShowShopModal(false)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
              <button
                onClick={handleAddShop}
                disabled={saving || !shopForm.name}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {saving ? "Guardando..." : "Agregar local"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {showBarberoModal && (
        <div className="modal-overlay" onClick={() => { setShowBarberoModal(false); setInviteResult(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Invitar barbero</h2>
              <button onClick={() => { setShowBarberoModal(false); setInviteResult(null); }} className="btn-ghost" style={{ padding: "0.25rem 0.5rem", border: "none" }}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
              El barbero recibirá un email para crear su contraseña. Solo tendrá acceso al local que asignes — sin acceso admin.
            </p>

            {inviteResult && (
              <div
                style={{
                  padding: "0.625rem 0.875rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.825rem",
                  marginBottom: "1rem",
                  background: inviteResult.type === "success" ? "#dcfce7" : "#fee2e2",
                  color: inviteResult.type === "success" ? "#166534" : "#991b1b",
                  border: `1px solid ${inviteResult.type === "success" ? "#bbf7d0" : "#fecaca"}`,
                }}
              >
                {inviteResult.msg}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  Correo del barbero *
                </label>
                <input
                  type="email"
                  placeholder="barbero@email.com"
                  value={barberoEmail}
                  onChange={(e) => setBarberoEmail(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  Asignar al local *
                </label>
                <select
                  value={barberoShopId}
                  onChange={(e) => setBarberoShopId(e.target.value)}
                >
                  <option value="">Seleccionar local...</option>
                  {barbershops.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button onClick={() => { setShowBarberoModal(false); setInviteResult(null); }} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
              <button
                onClick={handleInvite}
                disabled={saving || !barberoEmail || !barberoShopId}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Mail size={15} />
                {saving ? "Enviando..." : "Enviar invitación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
