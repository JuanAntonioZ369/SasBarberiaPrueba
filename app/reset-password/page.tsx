"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, KeyRound, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  // Supabase envía el token en el hash de la URL (#access_token=...&type=recovery)
  // Al cargar la página, el cliente Supabase detecta el token y establece la sesión.
  useEffect(() => {
    async function waitForSession() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Escuchar el evento PASSWORD_RECOVERY que Supabase dispara automáticamente
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setReady(true);
        }
      });

      // También verificar si ya hay sesión activa (recarga de página)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setReady(true);

      return () => subscription.unsubscribe();
    }
    waitForSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch {
      setError("Error al actualizar la contraseña.");
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
            Crea tu nueva contraseña
          </p>
        </div>

        <div className="light-card" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          {success ? (
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
                <CheckCircle2 size={22} style={{ color: "#16a34a" }} />
              </div>
              <h2 className="font-bold text-base mb-2" style={{ color: "#0a0a0a" }}>
                Contraseña actualizada
              </h2>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                Redirigiendo al login...
              </p>
            </div>
          ) : !ready ? (
            <div className="text-center py-4">
              <p className="text-sm" style={{ color: "#6b7280" }}>
                Verificando enlace...
              </p>
              <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>
                Si este mensaje no desaparece, el enlace puede haber expirado.{" "}
                <Link href="/forgot-password" className="underline" style={{ color: "#0a0a0a" }}>
                  Solicitar uno nuevo
                </Link>
              </p>
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
                <label className="block text-sm font-medium mb-1" style={{ color: "#374151" }}>
                  Nueva contraseña
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="light-input"
                    style={{ paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "#9ca3af",
                    }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#374151" }}>
                  Confirmar contraseña
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Repite la contraseña"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                <KeyRound size={16} />
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
