"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Phone,
  X,
  UserCheck,
} from "lucide-react";
import type { Client, Role } from "@/lib/supabase/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ClientsManagerProps {
  initialClients: Client[];
  role: Role;
  barbershopId: string;
  userId: string;
}

const emptyForm = {
  full_name: "",
  phone: "",
  age: "",
  birthday: "",
  notes: "",
};

export default function ClientsManager({
  initialClients,
  role,
  barbershopId,
  userId,
}: ClientsManagerProps) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const [showAttendance, setShowAttendance] = useState(false);
  const [attendanceClient, setAttendanceClient] = useState<Client | null>(null);
  const [attendanceAmount, setAttendanceAmount] = useState("50");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const filtered = clients.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").includes(search)
  );

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      full_name: client.full_name,
      phone: client.phone ?? "",
      age: client.age?.toString() ?? "",
      birthday: client.birthday ?? "",
      notes: client.notes ?? "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    setLoading(true);
    const payload = {
      full_name: form.full_name,
      phone: form.phone || null,
      age: form.age ? parseInt(form.age) : null,
      birthday: form.birthday || null,
      notes: form.notes || null,
      barbershop_id: barbershopId,
    };

    const { createClient: sbClient } = await import("@/lib/supabase/client");
    const supabase = sbClient();

    if (editingId) {
      const { data } = await supabase
        .from("clients")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
      if (data) setClients((prev) => prev.map((c) => (c.id === editingId ? data : c)));
    } else {
      const { data } = await supabase
        .from("clients")
        .insert(payload)
        .select()
        .single();
      if (data) setClients((prev) => [data, ...prev]);
    }
    setShowModal(false);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return;
    const { createClient: sbClient } = await import("@/lib/supabase/client");
    const supabase = sbClient();
    await supabase.from("clients").delete().eq("id", id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  function openAttendance(client: Client) {
    setAttendanceClient(client);
    setAttendanceAmount("50");
    setShowAttendance(true);
  }

  async function handleAttendance() {
    if (!attendanceClient) return;
    setAttendanceLoading(true);

    const transaction = {
      barbershop_id: barbershopId,
      type: "income" as const,
      amount: parseFloat(attendanceAmount),
      description: `Corte de cabello — ${attendanceClient.full_name}`,
      category: "Servicios",
      client_id: attendanceClient.id,
      date: new Date().toISOString().split("T")[0],
      created_by: userId,
    };

    const { createClient: sbClient } = await import("@/lib/supabase/client");
    const supabase = sbClient();
    await supabase.from("transactions").insert(transaction);

    setAttendanceLoading(false);
    setShowAttendance(false);
    setSuccessMsg(`Asistencia de ${attendanceClient.full_name} registrada`);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Clientes</h1>
            <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
              {clients.length} clientes registrados
            </p>
          </div>
          {role === "admin" && (
            <button onClick={openCreate} className="btn-primary">
              <Plus size={16} />
              Nuevo cliente
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            fontSize: "0.875rem",
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            color: "#16a34a",
          }}
        >
          <CheckCircle2 size={15} />
          {successMsg}
        </div>
      )}

      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <Search
          size={15}
          style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}
        />
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
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
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Edad</th>
                <th>Registro</th>
                <th>Notas</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id}>
                    <td style={{ fontWeight: 500 }}>{client.full_name}</td>
                    <td style={{ color: "#6b7280" }}>
                      {client.phone ? (
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Phone size={12} />
                          {client.phone}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ color: "#6b7280" }}>{client.age ?? "—"}</td>
                    <td style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                      {format(new Date(client.created_at), "dd MMM yyyy", { locale: es })}
                    </td>
                    <td
                      style={{
                        color: "#6b7280",
                        fontSize: "0.8rem",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {client.notes ?? "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.5rem" }}>
                        {role === "barbero" ? (
                          <button
                            onClick={() => openAttendance(client)}
                            className="btn-primary"
                            style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
                          >
                            <UserCheck size={13} />
                            Marcar asistencia
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(client)}
                              className="btn-ghost"
                              style={{ padding: "0.375rem 0.625rem" }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="btn-ghost"
                              style={{ padding: "0.375rem 0.625rem", color: "#dc2626" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                {editingId ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ padding: "0.25rem 0.5rem", border: "none" }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+591 70000000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Edad</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={form.birthday}
                  onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>Notas</label>
                <textarea
                  rows={3}
                  placeholder="Preferencias, alergias, notas especiales..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
              <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !form.full_name}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Crear cliente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAttendance && attendanceClient && (
        <div className="modal-overlay" onClick={() => setShowAttendance(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>Registrar asistencia</h2>
              <button onClick={() => setShowAttendance(false)} className="btn-ghost" style={{ padding: "0.25rem 0.5rem", border: "none" }}>
                <X size={16} />
              </button>
            </div>
            <div
              style={{
                borderRadius: "0.5rem",
                padding: "0.75rem",
                marginBottom: "1rem",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <p style={{ fontWeight: 500, margin: 0 }}>{attendanceClient.full_name}</p>
              {attendanceClient.phone && (
                <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: "0.125rem 0 0" }}>
                  {attendanceClient.phone}
                </p>
              )}
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Monto del servicio ($)
              </label>
              <input
                type="number"
                value={attendanceAmount}
                onChange={(e) => setAttendanceAmount(e.target.value)}
                min="1"
              />
              <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                Se registrará como ingreso de tipo "Corte"
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowAttendance(false)} className="btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                Cancelar
              </button>
              <button
                onClick={handleAttendance}
                disabled={attendanceLoading || !attendanceAmount}
                className="btn-primary"
                style={{ flex: 1, justifyContent: "center" }}
              >
                <UserCheck size={15} />
                {attendanceLoading ? "Registrando..." : "Confirmar asistencia"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
