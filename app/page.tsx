"use client";

import Link from "next/link";
import {
  Users,
  Package,
  DollarSign,
  CreditCard,
  CheckCircle,
  Scissors,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div style={{ background: "#fff", color: "#0a0a0a" }} className="min-h-screen">
      {/* Navbar */}
      <nav
        className="sticky top-0 z-40 w-full"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors size={22} style={{ color: "#0a0a0a" }} />
            <span className="text-lg font-bold" style={{ color: "#0a0a0a" }}>
              SasBarbería
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm font-medium transition-colors"
              style={{ color: "#6b7280" }}
            >
              Funciones
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium transition-colors"
              style={{ color: "#6b7280" }}
            >
              Precios
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-outline-dark text-sm">
              Iniciar sesión
            </Link>
            <Link href="/register" className="btn-dark text-sm">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
          style={{
            background: "#f3f4f6",
            color: "#374151",
            border: "1px solid #e5e7eb",
          }}
        >
          <span>✦</span>
          Sistema de gestión para barberías
        </div>
        <h1
          className="text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto"
          style={{ color: "#0a0a0a" }}
        >
          Gestiona tu barbería{" "}
          <span style={{ color: "#374151", fontStyle: "italic" }}>
            sin complicaciones
          </span>
        </h1>
        <p
          className="text-lg md:text-xl max-w-2xl mx-auto mb-10"
          style={{ color: "#6b7280" }}
        >
          Clientes, inventario, finanzas y membresías en un solo panel. Hecho
          para barberías que quieren crecer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="btn-dark"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", justifyContent: "center" }}
          >
            Empieza gratis — 14 días
          </Link>
          <Link
            href="/login"
            className="btn-outline-dark"
            style={{ padding: "0.75rem 2rem", fontSize: "1rem", justifyContent: "center" }}
          >
            Ver demo
          </Link>
        </div>
        <p className="mt-4 text-sm" style={{ color: "#9ca3af" }}>
          Sin tarjeta de crédito · Cancela cuando quieras
        </p>
      </section>

      {/* Stats bar */}
      <section
        style={{
          background: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          borderBottom: "1px solid #e5e7eb",
        }}
        className="py-10"
      >
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Barberías activas" },
            { value: "50k+", label: "Clientes gestionados" },
            { value: "$2M+", label: "Ingresos procesados" },
            { value: "4.9/5", label: "Valoración promedio" },
          ].map((s) => (
            <div key={s.label}>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: "#0a0a0a" }}
              >
                {s.value}
              </div>
              <div className="text-sm" style={{ color: "#6b7280" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-24">
        <h2
          className="text-3xl font-bold text-center mb-4"
          style={{ color: "#0a0a0a" }}
        >
          Todo lo que necesitas
        </h2>
        <p
          className="text-center mb-14 max-w-xl mx-auto"
          style={{ color: "#6b7280" }}
        >
          Diseñado especialmente para barberías. Sin funciones innecesarias, sin
          curva de aprendizaje.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Users,
              title: "Gestión de Clientes",
              desc: "Registra clientes, historial, cumpleaños y notas importantes. Marca asistencias en segundos.",
            },
            {
              icon: Package,
              title: "Control de Inventario",
              desc: "Administra productos, precios y stock. Alertas automáticas cuando el stock está bajo.",
            },
            {
              icon: DollarSign,
              title: "Finanzas Claras",
              desc: "Registra ingresos y gastos. Ve tus ganancias reales con gráficas simples y detalladas.",
            },
            {
              icon: CreditCard,
              title: "Membresías",
              desc: "Crea planes mensuales, trimestrales o anuales. Fideliza a tus mejores clientes.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="light-card transition-all"
              style={{ cursor: "default" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#0a0a0a";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "#e5e7eb";
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "#f3f4f6" }}
              >
                <Icon size={20} style={{ color: "#0a0a0a" }} />
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "#0a0a0a" }}>
                {title}
              </h3>
              <p className="text-sm" style={{ color: "#6b7280" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        style={{
          background: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          borderBottom: "1px solid #e5e7eb",
        }}
        className="py-24"
      >
        <div className="max-w-5xl mx-auto px-4">
          <h2
            className="text-3xl font-bold text-center mb-4"
            style={{ color: "#0a0a0a" }}
          >
            Precios simples y transparentes
          </h2>
          <p className="text-center mb-14" style={{ color: "#6b7280" }}>
            Elige el plan que mejor se adapte a tu barbería
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Básico",
                price: "49",
                desc: "Para barberías que empiezan",
                features: [
                  "1 local",
                  "Hasta 100 clientes",
                  "Inventario básico",
                  "Reporte mensual",
                ],
                highlight: false,
              },
              {
                name: "Pro",
                price: "99",
                desc: "El más popular",
                features: [
                  "Hasta 3 locales",
                  "Clientes ilimitados",
                  "Inventario completo",
                  "Finanzas y reportes",
                  "Membresías",
                  "Gestión de barberos",
                ],
                highlight: true,
              },
              {
                name: "Premium",
                price: "199",
                desc: "Para cadenas de barberías",
                features: [
                  "Locales ilimitados",
                  "Todo lo de Pro",
                  "API acceso",
                  "Soporte prioritario 24/7",
                  "Capacitación incluida",
                  "Marca personalizada",
                ],
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className="rounded-xl p-6 flex flex-col"
                style={
                  plan.highlight
                    ? {
                        background: "#0a0a0a",
                        color: "#ffffff",
                        border: "2px solid #0a0a0a",
                      }
                    : {
                        background: "#ffffff",
                        color: "#0a0a0a",
                        border: "1px solid #e5e7eb",
                      }
                }
              >
                {plan.highlight && (
                  <div
                    className="self-start mb-3 text-xs font-bold px-2 py-1 rounded-full"
                    style={{
                      background: "#ffffff",
                      color: "#0a0a0a",
                      fontSize: "0.7rem",
                    }}
                  >
                    MAS POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: plan.highlight ? "#9ca3af" : "#6b7280" }}
                >
                  {plan.desc}
                </p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span style={{ color: plan.highlight ? "#9ca3af" : "#6b7280" }}>
                    /mes
                  </span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle
                        size={15}
                        style={{
                          color: plan.highlight ? "#ffffff" : "#22c55e",
                          flexShrink: 0,
                        }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="justify-center text-center"
                  style={
                    plan.highlight
                      ? {
                          background: "#ffffff",
                          color: "#0a0a0a",
                          fontWeight: 600,
                          padding: "0.6rem 1.5rem",
                          borderRadius: 8,
                          fontSize: "0.875rem",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }
                      : {
                          background: "transparent",
                          color: "#0a0a0a",
                          fontWeight: 500,
                          padding: "0.6rem 1.5rem",
                          borderRadius: 8,
                          border: "1px solid #d1d5db",
                          fontSize: "0.875rem",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }
                  }
                >
                  Empezar ahora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles inteligentes */}
      <section className="max-w-5xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: "#0a0a0a" }}
            >
              Roles inteligentes para tu equipo
            </h2>
            <p className="mb-6" style={{ color: "#6b7280" }}>
              El dueño tiene control total. Los barberos solo ven lo que
              necesitan: clientes, ventas e inventario. Sin complicaciones.
            </p>
            {[
              {
                icon: Shield,
                title: "Admin",
                desc: "Control total — clientes, inventario, finanzas, membresías y settings",
              },
              {
                icon: Scissors,
                title: "Barbero",
                desc: "Registra asistencias, realiza ventas de productos, consulta membresías",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "#f3f4f6" }}
                >
                  <Icon size={16} style={{ color: "#0a0a0a" }} />
                </div>
                <div>
                  <div
                    className="font-semibold text-sm"
                    style={{ color: "#0a0a0a" }}
                  >
                    {title}
                  </div>
                  <div className="text-sm" style={{ color: "#6b7280" }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mock dashboard */}
          <div
            className="rounded-xl p-6"
            style={{ background: "#0a0a0a", border: "1px solid #1f2937" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ef4444" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#f59e0b" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#22c55e" }} />
              <span className="text-xs ml-2" style={{ color: "#6b7280" }}>
                dashboard — SasBarbería
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Ingresos del mes", value: "$4,250", up: true },
                { label: "Clientes atendidos", value: "87", up: true },
                { label: "Productos vendidos", value: "23", up: false },
                { label: "Membresías activas", value: "12", up: true },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: "#1a1a1a" }}
                >
                  <span className="text-sm" style={{ color: "#9ca3af" }}>
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: "#ffffff" }}
                    >
                      {stat.value}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: stat.up ? "#22c55e" : "#ef4444" }}
                    >
                      {stat.up ? "+12%" : "-3%"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section
        className="py-20 text-center"
        style={{ background: "#0a0a0a" }}
      >
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#ffffff" }}>
            Empieza hoy, sin riesgos
          </h2>
          <p className="mb-8" style={{ color: "#9ca3af" }}>
            14 días de prueba gratis. Sin tarjeta de crédito. Configura tu
            barbería en menos de 5 minutos.
          </p>
          <Link
            href="/register"
            style={{
              background: "#ffffff",
              color: "#0a0a0a",
              fontWeight: 700,
              padding: "0.75rem 2.5rem",
              borderRadius: 8,
              fontSize: "1rem",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{ borderTop: "1px solid #e5e7eb", background: "#ffffff" }}
        className="py-8"
      >
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Scissors size={18} style={{ color: "#0a0a0a" }} />
            <span className="font-bold" style={{ color: "#0a0a0a" }}>
              SasBarbería
            </span>
          </div>
          <p className="text-sm" style={{ color: "#9ca3af" }}>
            © 2025 SasBarbería. Hecho con orgullo en Perú.
          </p>
          <div className="flex gap-4 text-sm" style={{ color: "#6b7280" }}>
            <Link
              href="/login"
              className="transition-colors"
              style={{ color: "#6b7280" }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="transition-colors"
              style={{ color: "#6b7280" }}
            >
              Registro
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
