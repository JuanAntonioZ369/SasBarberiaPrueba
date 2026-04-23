"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scissors, LogIn } from "lucide-react";
import { DEMO_MODE } from "@/lib/demo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) {
        setError(authError.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  function enterDemo(role: "admin" | "barbero") {
    if (typeof window !== "undefined") {
      localStorage.setItem("demo_role", role);
    }
    router.push("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
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
            <span
              className="text-xl font-bold"
              style={{ color: "#0a0a0a" }}
            >
              SasBarbería
            </span>
          </Link>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Inicia sesión en tu cuenta
          </p>
        </div>

        <div
          className="light-card"
          style={{
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {DEMO_MODE ? (
            <>
              <div
                className="rounded-lg p-3 mb-6 text-sm text-center"
                style={{
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  color: "#374151",
                }}
              >
                Modo Demo — no se requiere cuenta real
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => enterDemo("admin")}
                  className="btn-dark"
                  style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                >
                  <LogIn size={16} />
                  Entrar como Admin
                </button>
                <button
                  onClick={() => enterDemo("barbero")}
                  className="btn-outline-dark"
                  style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                >
                  <LogIn size={16} />
                  Entrar como Barbero
                </button>
              </div>
            </>
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
                <div className="flex items-center justify-between mb-1">
                  <label
                    className="block text-sm font-medium"
                    htmlFor="password"
                    style={{ color: "#374151" }}
                  >
                    Contraseña
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs hover:underline"
                    style={{ color: "#6b7280" }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                <LogIn size={16} />
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>
          )}

          <p
            className="text-center text-sm mt-5"
            style={{ color: "#6b7280" }}
          >
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-medium hover:underline"
              style={{ color: "#0a0a0a" }}
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
