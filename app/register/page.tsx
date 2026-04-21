"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { DEMO_MODE } from "@/lib/demo";

type Step = 1 | 2;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [barbershopName, setBarbershopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function goToStep2(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  async function handlePay() {
    setError("");
    setLoading(true);

    if (DEMO_MODE) {
      if (typeof window !== "undefined") {
        localStorage.setItem("demo_role", "admin");
      }
      router.push("/dashboard");
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            barbershop_name: barbershopName,
          },
        },
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Error al crear la cuenta.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#f9fafb" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-3"
            style={{ textDecoration: "none" }}
          >
            <Scissors size={24} style={{ color: "#0a0a0a" }} />
            <span className="text-xl font-bold" style={{ color: "#0a0a0a" }}>
              SasBarbería
            </span>
          </Link>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            {step === 1 ? "Crea tu cuenta gratis" : "Activa tu plan Pro"}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                style={{
                  background: step >= s ? "#0a0a0a" : "#e5e7eb",
                  color: step >= s ? "#ffffff" : "#9ca3af",
                }}
              >
                {s}
              </div>
              {s < 2 && (
                <div
                  className="w-8 h-px transition-colors"
                  style={{
                    background: step > s ? "#0a0a0a" : "#e5e7eb",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div
          className="light-card"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {step === 1 ? (
            <form onSubmit={goToStep2} className="space-y-4">
              <h2
                className="font-semibold mb-1"
                style={{ color: "#0a0a0a" }}
              >
                Datos básicos
              </h2>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="name"
                  style={{ color: "#374151" }}
                >
                  Nombre completo
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Carlos Mendoza"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="light-input"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="shop"
                  style={{ color: "#374151" }}
                >
                  Nombre de tu barbería
                </label>
                <input
                  id="shop"
                  type="text"
                  placeholder="Barbería El Maestro"
                  value={barbershopName}
                  onChange={(e) => setBarbershopName(e.target.value)}
                  required
                  className="light-input"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="email"
                  style={{ color: "#374151" }}
                >
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
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="pass"
                  style={{ color: "#374151" }}
                >
                  Contraseña
                </label>
                <input
                  id="pass"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  className="light-input"
                />
              </div>
              <button
                type="submit"
                className="btn-dark"
                style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
              >
                Continuar →
              </button>
            </form>
          ) : (
            <div>
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm mb-4 transition-colors"
                style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer" }}
              >
                <ArrowLeft size={14} />
                Volver
              </button>

              <h2
                className="font-semibold mb-1"
                style={{ color: "#0a0a0a" }}
              >
                Activa tu plan Pro
              </h2>
              <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
                14 días gratis, luego $9.99/mes. Cancela cuando quieras.
              </p>

              {error && (
                <div
                  className="rounded-lg p-3 text-sm mb-4"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                    color: "#dc2626",
                  }}
                >
                  {error}
                </div>
              )}

              {/* Resumen del plan */}
              <div
                className="rounded-lg p-4 mb-5 space-y-2"
                style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}
              >
                {[
                  { label: "Plan Pro", value: "$9.99/mes" },
                  { label: "Período de prueba", value: "14 días gratis" },
                  { label: "Cobro inicial", value: "$0" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span style={{ color: "#6b7280" }}>{row.label}</span>
                    <span className="font-medium" style={{ color: "#0a0a0a" }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Features incluidas */}
              <ul className="space-y-2 mb-6">
                {[
                  "Clientes ilimitados",
                  "Inventario y ventas",
                  "Finanzas y reportes",
                  "Membresías",
                  "Gestión de barberos",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: "#374151" }}>
                    <CheckCircle size={14} style={{ color: "#22c55e", flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={handlePay}
                disabled={loading}
                className="btn-dark"
                style={{
                  width: "100%",
                  padding: "0.875rem",
                  fontSize: "1rem",
                  justifyContent: "center",
                }}
              >
                <CreditCard size={18} />
                {loading ? "Procesando..." : "Pagar $9.99/mes"}
                <span
                  style={{
                    fontSize: "0.7rem",
                    background: "#374151",
                    padding: "2px 6px",
                    borderRadius: 4,
                    marginLeft: 6,
                  }}
                >
                  MODO PRUEBA
                </span>
              </button>

              <p className="text-center text-xs mt-3" style={{ color: "#9ca3af" }}>
                Pago seguro · Sin cargos reales en modo prueba
              </p>
            </div>
          )}

          <p className="text-center text-sm mt-5" style={{ color: "#6b7280" }}>
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="font-medium hover:underline"
              style={{ color: "#0a0a0a" }}
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
