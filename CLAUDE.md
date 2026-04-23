# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```bash
npm run dev       # Servidor de desarrollo en localhost:3000
npm run build     # Build de producción
npm run start     # Servidor de producción (requiere build previo)
npm run lint      # ESLint
```

## Qué es este proyecto

**sasbarberPrueba** — ambiente de pruebas real del SaaS SasBarbería. Página web (Next.js en Vercel). No es una app móvil.

No hay modo demo. Todo conecta a Supabase real. Variables de entorno en `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Moneda

Toda la moneda es en **USD ($)**. `formatCurrency()` en `lib/utils.ts` usa `currency: "USD"`.

## Roles y sistema de sub-cuentas

Solo 2 roles definidos en `profiles.role`:

| Rol | Acceso |
|-----|--------|
| `admin` | Control total. Ve todos sus locales. Crea tiendas y sub-cuentas de barberos. |
| `barbero` | Solo ve su local asignado (`barbershop_id`). Registra clientes, ventas y membresías. |

### Cómo funciona el sistema de cuentas

1. **Admin se registra** → se crea su cuenta + primer barbershop automáticamente (trigger en Supabase)
2. **Admin crea más locales** → desde `/dashboard/settings`, agrega barbershops adicionales
3. **Admin crea barbero** → desde Settings invita por email. Ese usuario crea su contraseña y al entrar **solo ve el local asignado**
4. **Barbero entra** → login normal con su email/password → ve solo su tienda → puede registrar clientes, ventas rápidas, membresías

Cada barbero tiene su propia cuenta Supabase Auth (`auth.users`) con `profiles.role = 'barbero'` y `profiles.barbershop_id = UUID_del_local`.

## Arquitectura

Next.js 15 (App Router) + Supabase + Tailwind v4 + TypeScript. Sin src/ dir.

### Rutas

```
/                              → Landing page (pública, tema blanco)
/login                         → Login (tema blanco)
/register                      → Registro 2 pasos + pago de prueba (tema blanco)
/dashboard                     → Redirige al primer local del admin
/dashboard/[barbershop_id]     → Vista admin de ese local
/dashboard/clients             → Clientes
/dashboard/inventory           → Inventario
/dashboard/finances            → Solo admin
/dashboard/memberships         → Membresías
/dashboard/settings            → Solo admin: gestión de locales y barberos
```

### Base de datos (Supabase)

Tablas: `profiles`, `barbershops`, `clients`, `products`, `transactions`, `memberships`.
Schema completo en `supabase/schema.sql` — ejecutar en SQL Editor de Supabase.

### Colores

- **Páginas públicas** (landing, login, register): fondo blanco `#fff`, texto `#0a0a0a`
- **Dashboard**: fondo `#f9fafb`, cards `#ffffff`, borde `#e5e7eb` (también tema claro)
- Acento primario: negro `#0a0a0a`

### Clientes Supabase

- `lib/supabase/server.ts` — usar en Server Components y Route Handlers (usa cookies de Next.js)
- `lib/supabase/client.ts` — usar en Client Components (browser client)
- `lib/supabase/getBarbershopId.ts` — helper `getActiveBarbershopId(supabase, userId, role)`: devuelve el barbershop_id activo según rol (para `barbero` lee `profiles.barbershop_id`, para `admin` busca su primer barbershop)
- `lib/supabase/types.ts` — tipos TypeScript de todas las tablas

### Patrón Server/Client

Server Components obtienen datos de Supabase → pasan como props a Client Components. Convención de nombres:
- `XxxManager.tsx` en `components/` — componentes de gestión (CRUD) reutilizables con estado optimista
- `XxxPageClient.tsx` dentro de cada carpeta de ruta — wrappers client de páginas que reciben los datos del Server Component padre
- Los Client Components llaman directamente a Supabase (`lib/supabase/client.ts`) para mutaciones

### Finanzas — registro rápido

`FinancesManager` tiene botones de acción rápida (Corte $, Corte+Barba $, Venta, Membresía, Gasto). Un click → mini-modal → confirmar monto → guardar. Pensado para uso desde el celular en la tienda.

### Vista de tienda (ViewModeProvider)

Los admins pueden "entrar" a la vista de un local específico desde Settings. `ViewModeProvider` (context + localStorage `sas_view_mode`) guarda el modo activo. Cuando `viewMode.mode === "store"`, el `Sidebar` filtra nav como si fuera `barbero` y muestra un banner amarillo con botón "Salir". Salir requiere re-autenticación con contraseña. Los componentes que necesiten saber el local activo deben leer `viewMode.storeId` del contexto.

### Dependencias clave

- `recharts` — gráficos en dashboard (`components/charts/RevenueChart.tsx`)
- `date-fns` (locale `es`) — formateo de fechas; semana empieza el lunes
- `xlsx` — exportación a Excel
- `lucide-react` — iconos
- `clsx` + `tailwind-merge` → helper `cn()` en `lib/utils.ts`

## Restricciones

- Solo editar archivos dentro de `sasbarberiaprueba/`
- No tocar `../SasBarberia/`
- No hay modo demo — toda la lógica es Supabase real
- Este proyecto usa Next.js 16 — algunas APIs pueden diferir de versiones anteriores. Consultar `node_modules/next/dist/docs/` ante dudas.
