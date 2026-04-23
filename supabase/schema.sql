-- ============================================================
-- SasBarbería — Schema SQL para Supabase
-- ============================================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto Supabase → SQL Editor
-- 2. Pega y ejecuta TODO este archivo
-- 3. En Authentication → Settings → habilita "Email confirmations" = OFF para pruebas
-- 4. Configura .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
-- ============================================================


-- ============================================================
-- SECCIÓN 1: TIPOS ENUM
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'barbero');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE membership_plan AS ENUM ('monthly', 'quarterly', 'annual');


-- ============================================================
-- SECCIÓN 2: TABLAS
-- ============================================================

-- Extiende auth.users de Supabase con datos de perfil y rol
CREATE TABLE profiles (
  id            UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT         NOT NULL,
  full_name     TEXT,
  role          user_role    NOT NULL DEFAULT 'admin',
  barbershop_id UUID,        -- NULL para admin, UUID del local para barbero
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Locales/barberías. Un admin puede tener más de uno.
CREATE TABLE barbershops (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT        NOT NULL,
  location   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK diferida: profiles.barbershop_id → barbershops.id
-- Se añade después de crear ambas tablas para evitar dependencia circular.
ALTER TABLE profiles
  ADD CONSTRAINT fk_profiles_barbershop
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE SET NULL;

-- Clientes de cada barbería
CREATE TABLE clients (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID        NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  full_name     TEXT        NOT NULL,
  phone         TEXT,
  age           INTEGER,
  birthday      DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventario de productos por local
CREATE TABLE products (
  id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id  UUID           NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  name           TEXT           NOT NULL,
  category       TEXT,
  purchase_price NUMERIC(10,2)  NOT NULL DEFAULT 0,
  sale_price     NUMERIC(10,2)  NOT NULL DEFAULT 0,
  stock          INTEGER        NOT NULL DEFAULT 0,
  min_stock      INTEGER        NOT NULL DEFAULT 3,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Movimientos financieros (ingresos y egresos) por local
CREATE TABLE transactions (
  id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID              NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  type          transaction_type  NOT NULL,
  amount        NUMERIC(10,2)     NOT NULL,
  description   TEXT              NOT NULL,
  category      TEXT,
  client_id     UUID              REFERENCES clients(id) ON DELETE SET NULL,
  date          DATE              NOT NULL DEFAULT CURRENT_DATE,
  created_by    UUID              NOT NULL REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- Membresías de clientes
CREATE TABLE memberships (
  id            UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  barbershop_id UUID              NOT NULL REFERENCES barbershops(id) ON DELETE CASCADE,
  client_id     UUID              NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  plan          membership_plan   NOT NULL,
  price         NUMERIC(10,2)     NOT NULL,
  start_date    DATE              NOT NULL,
  end_date      DATE              NOT NULL,
  status        membership_status NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECCIÓN 3: ÍNDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX idx_barbershops_owner          ON barbershops(owner_id);
CREATE INDEX idx_profiles_barbershop        ON profiles(barbershop_id);
CREATE INDEX idx_clients_barbershop         ON clients(barbershop_id);
CREATE INDEX idx_products_barbershop        ON products(barbershop_id);
CREATE INDEX idx_transactions_barbershop_date ON transactions(barbershop_id, date DESC);
CREATE INDEX idx_memberships_barbershop     ON memberships(barbershop_id);


-- ============================================================
-- SECCIÓN 4: TRIGGER — AUTO-CREACIÓN DE PROFILE Y BARBERSHOP
-- ============================================================
-- Se ejecuta automáticamente cuando un usuario completa el registro
-- en Supabase Auth. Crea su perfil con rol 'admin' y su primer local.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  meta_role TEXT;
  meta_barbershop_id UUID;
BEGIN
  meta_role := NEW.raw_user_meta_data->>'role';

  -- Barbero invitado: viene con role='barbero' y barbershop_id en metadata
  IF meta_role = 'barbero' THEN
    meta_barbershop_id := (NEW.raw_user_meta_data->>'barbershop_id')::UUID;
    INSERT INTO profiles (id, email, full_name, role, barbershop_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'barbero',
      meta_barbershop_id
    );
    -- No se crea barbershop propio para el barbero
  ELSE
    -- Registro normal de admin: crear profile + primer barbershop
    INSERT INTO profiles (id, email, full_name, role, barbershop_id)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      'admin',
      NULL
    );

    INSERT INTO barbershops (id, owner_id, name, location)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'barbershop_name', 'Mi Barbería'),
      NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- SECCIÓN 5: ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops  ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients      ENABLE ROW LEVEL SECURITY;
ALTER TABLE products     ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships  ENABLE ROW LEVEL SECURITY;

-- PROFILES: cada usuario solo puede leer y editar su propio perfil
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- BARBERSHOPS:
--   Admin → ve todos sus locales (owner_id = uid)
--   Barbero → ve únicamente el local al que está asignado
CREATE POLICY "barbershops_access" ON barbershops
  FOR ALL USING (
    owner_id = auth.uid()
    OR id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid())
  );

-- CLIENTS: acceso si el barbershop del cliente le pertenece al usuario
-- (ya sea porque es el admin dueño, o porque es el barbero asignado a ese local)
CREATE POLICY "clients_access" ON clients
  FOR ALL USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
      UNION
      SELECT barbershop_id FROM profiles
        WHERE id = auth.uid() AND barbershop_id IS NOT NULL
    )
  );

-- PRODUCTS: mismo patrón que clients
CREATE POLICY "products_access" ON products
  FOR ALL USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
      UNION
      SELECT barbershop_id FROM profiles
        WHERE id = auth.uid() AND barbershop_id IS NOT NULL
    )
  );

-- TRANSACTIONS: mismo patrón que clients
CREATE POLICY "transactions_access" ON transactions
  FOR ALL USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
      UNION
      SELECT barbershop_id FROM profiles
        WHERE id = auth.uid() AND barbershop_id IS NOT NULL
    )
  );

-- MEMBERSHIPS: mismo patrón que clients
CREATE POLICY "memberships_access" ON memberships
  FOR ALL USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE owner_id = auth.uid()
      UNION
      SELECT barbershop_id FROM profiles
        WHERE id = auth.uid() AND barbershop_id IS NOT NULL
    )
  );


-- ============================================================
-- SECCIÓN 6: FUNCIÓN assign_barbero_role
-- ============================================================
-- Llamada desde Settings del admin para asignar el rol 'barbero'
-- a un usuario ya registrado en Supabase Auth.
--
-- SEGURIDAD: La validación de que el admin solo puede asignar barberos
-- a sus propios locales debe hacerse en el caller (API / Server Action).
-- Esta función corre con SECURITY DEFINER porque necesita leer auth.users.
--
-- Uso desde el cliente:
--   const { data } = await supabase.rpc('assign_barbero_role', {
--     user_email: 'barbero@email.com',
--     target_barbershop_id: '<UUID>'
--   })

CREATE OR REPLACE FUNCTION assign_barbero_role(
  user_email          TEXT,
  target_barbershop_id UUID
)
RETURNS JSON AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Buscar el usuario por email en auth.users
  SELECT id INTO target_user_id
    FROM auth.users
   WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN json_build_object('error', 'Usuario no encontrado');
  END IF;

  -- Actualizar su profile: asignar rol barbero y el local correspondiente
  UPDATE profiles
     SET role          = 'barbero',
         barbershop_id = target_barbershop_id
   WHERE id = target_user_id;

  RETURN json_build_object('success', true, 'user_id', target_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
