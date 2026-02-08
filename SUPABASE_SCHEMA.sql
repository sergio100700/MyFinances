-- ================================================================
-- SCHEMA COMPLETO PARA MY FINANCE WEB - SUPABASE
-- ================================================================
-- Este script crea todas las tablas necesarias para la aplicación
-- Ejecutar en Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. TABLA: settings
-- ================================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  currency text NOT NULL,
  currency_symbol text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT settings_pkey PRIMARY KEY (id),
  CONSTRAINT settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índice para búsquedas por user_id
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings(user_id);

-- ================================================================
-- 2. TABLA: transactions
-- ================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- ================================================================
-- 3. TABLA: budgets
-- ================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  budgeted numeric NOT NULL,
  month text,
  period text NOT NULL DEFAULT 'monthly' CHECK (period = ANY (ARRAY['monthly'::text, 'annual'::text])),
  period_key text NOT NULL,
  is_recurring boolean NOT NULL DEFAULT false,
  start_date text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT budgets_pkey PRIMARY KEY (id),
  CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period_key ON public.budgets(period_key);

-- ================================================================
-- 4. TABLA: properties (Bienes Raíces)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  value numeric NOT NULL,
  mortgage numeric NOT NULL DEFAULT 0,
  mortgage_payment numeric NOT NULL DEFAULT 0,
  monthly_rent numeric NOT NULL DEFAULT 0,
  annual_costs numeric NOT NULL DEFAULT 0,
  purchase_date date NOT NULL,
  appreciation numeric NOT NULL DEFAULT 0,
  occupancy numeric NOT NULL DEFAULT 100,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);

-- ================================================================
-- 5. TABLA: property_monthly_incomes
-- ================================================================
CREATE TABLE IF NOT EXISTS public.property_monthly_incomes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid NOT NULL,
  year_month text NOT NULL,
  concept text NOT NULL,
  amount numeric NOT NULL,
  paid boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT property_monthly_incomes_pkey PRIMARY KEY (id),
  CONSTRAINT property_monthly_incomes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT property_monthly_incomes_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_property_monthly_incomes_user_id ON public.property_monthly_incomes(user_id);
CREATE INDEX IF NOT EXISTS idx_property_monthly_incomes_property_id ON public.property_monthly_incomes(property_id);
CREATE INDEX IF NOT EXISTS idx_property_monthly_incomes_year_month ON public.property_monthly_incomes(year_month);

-- ================================================================
-- 6. TABLA: property_monthly_expenses
-- ================================================================
CREATE TABLE IF NOT EXISTS public.property_monthly_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid NOT NULL,
  year_month text NOT NULL,
  concept text NOT NULL,
  amount numeric NOT NULL,
  paid boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT property_monthly_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT property_monthly_expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT property_monthly_expenses_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_property_monthly_expenses_user_id ON public.property_monthly_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_property_monthly_expenses_property_id ON public.property_monthly_expenses(property_id);
CREATE INDEX IF NOT EXISTS idx_property_monthly_expenses_year_month ON public.property_monthly_expenses(year_month);

-- ================================================================
-- 7. TABLA: property_yearly_templates
-- ================================================================
CREATE TABLE IF NOT EXISTS public.property_yearly_templates (
  id text NOT NULL,
  user_id uuid NOT NULL,
  property_id uuid NOT NULL,
  year integer NOT NULL,
  incomes jsonb DEFAULT '[]'::jsonb,
  expenses jsonb DEFAULT '[]'::jsonb,
  last_applied text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT property_yearly_templates_pkey PRIMARY KEY (id),
  CONSTRAINT property_yearly_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT property_yearly_templates_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_property_yearly_templates_user_id ON public.property_yearly_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_property_yearly_templates_property_id ON public.property_yearly_templates(property_id);
CREATE INDEX IF NOT EXISTS idx_property_yearly_templates_year ON public.property_yearly_templates(year);

-- ================================================================
-- 8. TABLA: carteras (Portafolios de inversión)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.carteras (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  fecha date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT carteras_pkey PRIMARY KEY (id),
  CONSTRAINT carteras_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_carteras_user_id ON public.carteras(user_id);

-- ================================================================
-- 9. TABLA: activos (Activos dentro de carteras)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.activos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cartera_id uuid NOT NULL,
  nombre text NOT NULL,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['fondo'::text, 'etf'::text, 'accion'::text, 'otro'::text])),
  capital_inicial numeric NOT NULL,
  fecha date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activos_pkey PRIMARY KEY (id),
  CONSTRAINT activos_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT activos_cartera_id_fkey FOREIGN KEY (cartera_id) REFERENCES public.carteras(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_activos_user_id ON public.activos(user_id);
CREATE INDEX IF NOT EXISTS idx_activos_cartera_id ON public.activos(cartera_id);

-- ================================================================
-- 10. TABLA: escenarios (Escenarios de rentabilidad)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.escenarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nombre text NOT NULL,
  rentabilidad_anual numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT escenarios_pkey PRIMARY KEY (id),
  CONSTRAINT escenarios_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_escenarios_user_id ON public.escenarios(user_id);

-- ================================================================
-- 11. TABLA: seguimientos_cartera (Seguimiento mensual de carteras)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.seguimientos_cartera (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cartera_id uuid NOT NULL,
  capital_inicial numeric NOT NULL,
  aportacion_mensual_base numeric NOT NULL DEFAULT 0,
  mes_inicio text NOT NULL,
  mes_inicio_aportaciones text NOT NULL,
  mes_fin text,
  mes_actual text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT seguimientos_cartera_pkey PRIMARY KEY (id),
  CONSTRAINT seguimientos_cartera_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT seguimientos_cartera_cartera_id_fkey FOREIGN KEY (cartera_id) REFERENCES public.carteras(id) ON DELETE CASCADE,
  CONSTRAINT seguimientos_cartera_cartera_id_unique UNIQUE (cartera_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_seguimientos_cartera_user_id ON public.seguimientos_cartera(user_id);
CREATE INDEX IF NOT EXISTS idx_seguimientos_cartera_cartera_id ON public.seguimientos_cartera(cartera_id);

-- ================================================================
-- 12. TABLA: aportaciones_adicionales
-- ================================================================
CREATE TABLE IF NOT EXISTS public.aportaciones_adicionales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  seguimiento_id uuid NOT NULL,
  mes text NOT NULL,
  monto numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT aportaciones_adicionales_pkey PRIMARY KEY (id),
  CONSTRAINT aportaciones_adicionales_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT aportaciones_adicionales_seguimiento_id_fkey FOREIGN KEY (seguimiento_id) REFERENCES public.seguimientos_cartera(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_aportaciones_adicionales_user_id ON public.aportaciones_adicionales(user_id);
CREATE INDEX IF NOT EXISTS idx_aportaciones_adicionales_seguimiento_id ON public.aportaciones_adicionales(seguimiento_id);

-- ================================================================
-- 13. TABLA: registros_reales (Valores reales mensuales)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.registros_reales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  seguimiento_id uuid NOT NULL,
  mes text NOT NULL,
  valor_real numeric NOT NULL,
  rentabilidad_real numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT registros_reales_pkey PRIMARY KEY (id),
  CONSTRAINT registros_reales_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT registros_reales_seguimiento_id_fkey FOREIGN KEY (seguimiento_id) REFERENCES public.seguimientos_cartera(id) ON DELETE CASCADE,
  CONSTRAINT registros_reales_seguimiento_mes_unique UNIQUE (seguimiento_id, mes)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_registros_reales_user_id ON public.registros_reales(user_id);
CREATE INDEX IF NOT EXISTS idx_registros_reales_seguimiento_id ON public.registros_reales(seguimiento_id);

-- ================================================================
-- 14. TABLA: activos_valores_actuales (Valores actuales de activos)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.activos_valores_actuales (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  activo_id uuid NOT NULL,
  cantidad_actual numeric NOT NULL,
  valor_actual numeric NOT NULL,
  fecha date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activos_valores_actuales_pkey PRIMARY KEY (id),
  CONSTRAINT activos_valores_actuales_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT activos_valores_actuales_activo_id_fkey FOREIGN KEY (activo_id) REFERENCES public.activos(id) ON DELETE CASCADE,
  CONSTRAINT activos_valores_actuales_activo_id_unique UNIQUE (activo_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_activos_valores_actuales_user_id ON public.activos_valores_actuales(user_id);
CREATE INDEX IF NOT EXISTS idx_activos_valores_actuales_activo_id ON public.activos_valores_actuales(activo_id);

-- ================================================================
-- 15. TABLA: investments (Portfolio simple)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.investments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  amount_invested numeric NOT NULL,
  current_value numeric NOT NULL,
  date_acquired date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT investments_pkey PRIMARY KEY (id),
  CONSTRAINT investments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);

-- ================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_monthly_incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_yearly_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carteras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seguimientos_cartera ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aportaciones_adicionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_reales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activos_valores_actuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios solo pueden ver/modificar sus propios datos
CREATE POLICY "Users can view own settings" ON public.settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON public.settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own properties" ON public.properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own property incomes" ON public.property_monthly_incomes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own property incomes" ON public.property_monthly_incomes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own property incomes" ON public.property_monthly_incomes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own property incomes" ON public.property_monthly_incomes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own property expenses" ON public.property_monthly_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own property expenses" ON public.property_monthly_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own property expenses" ON public.property_monthly_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own property expenses" ON public.property_monthly_expenses FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own property templates" ON public.property_yearly_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own property templates" ON public.property_yearly_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own property templates" ON public.property_yearly_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own property templates" ON public.property_yearly_templates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own carteras" ON public.carteras FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own carteras" ON public.carteras FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own carteras" ON public.carteras FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own carteras" ON public.carteras FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activos" ON public.activos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activos" ON public.activos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activos" ON public.activos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activos" ON public.activos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own escenarios" ON public.escenarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own escenarios" ON public.escenarios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own escenarios" ON public.escenarios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own escenarios" ON public.escenarios FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own seguimientos" ON public.seguimientos_cartera FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own seguimientos" ON public.seguimientos_cartera FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seguimientos" ON public.seguimientos_cartera FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own seguimientos" ON public.seguimientos_cartera FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own aportaciones" ON public.aportaciones_adicionales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own aportaciones" ON public.aportaciones_adicionales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own aportaciones" ON public.aportaciones_adicionales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own aportaciones" ON public.aportaciones_adicionales FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own registros reales" ON public.registros_reales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own registros reales" ON public.registros_reales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registros reales" ON public.registros_reales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own registros reales" ON public.registros_reales FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own activos valores" ON public.activos_valores_actuales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activos valores" ON public.activos_valores_actuales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own activos valores" ON public.activos_valores_actuales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own activos valores" ON public.activos_valores_actuales FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_monthly_incomes_updated_at BEFORE UPDATE ON public.property_monthly_incomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_monthly_expenses_updated_at BEFORE UPDATE ON public.property_monthly_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_yearly_templates_updated_at BEFORE UPDATE ON public.property_yearly_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carteras_updated_at BEFORE UPDATE ON public.carteras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activos_updated_at BEFORE UPDATE ON public.activos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escenarios_updated_at BEFORE UPDATE ON public.escenarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seguimientos_cartera_updated_at BEFORE UPDATE ON public.seguimientos_cartera FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registros_reales_updated_at BEFORE UPDATE ON public.registros_reales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activos_valores_actuales_updated_at BEFORE UPDATE ON public.activos_valores_actuales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- FIN DEL SCRIPT
-- ================================================================
