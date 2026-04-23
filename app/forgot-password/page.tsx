"use client";

import { useState } from "react";
import Link from "next/link";
import { Scissors, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (authError) {
        setError(authError.message);
      } else {
        setSent(true);
      }
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#f9fafb" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3" style={{ textDecoration: "none" }}>
            <Scissors size={24} style={{ color: "#0a0a0a" }} />
            <span className="text-xl font-bold" style={{ color: "#0a0a0a" }}>SasBarbería</span>
          </Link>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Recupera el acceso a tu cuenta
          </p>
        </div>

        <div className="light-card" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {sent ? (
            <div className="text-center">
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "9999px",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <Mail size={22} style={{ color: "#16a34a" }} />
              </div>
              <h2 className="font-bold text-base mb-2" style={{ color: "#0a0a0a" }}>
                Revisa tu correo
              </h2>
              <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
                Si <strong>{email}</strong> tiene una cuenta, recibirás un enlace para restablecer tu contraseña.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                style={{ color: "#0a0a0a" }}
              >
                <ArrowLeft size={14} />
                Volver al login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="rounded-lg p-3 text-sm"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#dc2626",
                  }}
                >
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email" style={{ color: "#374151" }}>
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="light-input"
                />
              </div>
              <button
                type="submit"
                className="btn-dark"
                style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                disabled={loading}
              >
                <Mail size={16} />
                {loading ? "Enviando..." : "Enviar instrucciones"}
              </button>
              <p className="text-center text-sm" style={{ color: "#6b7280" }}>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 font-medium hover:underline"
                  style={{ color: "#0a0a0a" }}
                >
                  <ArrowLeft size={13} />
                  Volver al login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
