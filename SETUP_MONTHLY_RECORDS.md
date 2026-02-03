# Configuración de Tablas Supabase para Registros Mensuales de Propiedades

## Tablas a Crear

Para que el sistema de registros mensuales y plantillas anuales funcione correctamente, necesitas crear las siguientes tablas en Supabase:

### 1. Tabla `property_monthly_incomes`

```sql
CREATE TABLE IF NOT EXISTS property_monthly_incomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,  -- Formato: YYYY-MM
  concept TEXT NOT NULL,      -- Ej: "Alquiler", "Extra", etc.
  amount DECIMAL NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_pmi_user_id ON property_monthly_incomes(user_id);
CREATE INDEX idx_pmi_property_id ON property_monthly_incomes(property_id);
CREATE INDEX idx_pmi_year_month ON property_monthly_incomes(year_month);
```

### 2. Tabla `property_monthly_expenses`

```sql
CREATE TABLE IF NOT EXISTS property_monthly_expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,  -- Formato: YYYY-MM
  concept TEXT NOT NULL,      -- Ej: "Comunidad", "IBI", "Basura", "Hipoteca", "Derrama", etc.
  amount DECIMAL NOT NULL,
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_pme_user_id ON property_monthly_expenses(user_id);
CREATE INDEX idx_pme_property_id ON property_monthly_expenses(property_id);
CREATE INDEX idx_pme_year_month ON property_monthly_expenses(year_month);
```

### 3. Tabla `property_yearly_templates`

```sql
CREATE TABLE IF NOT EXISTS property_yearly_templates (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  incomes JSONB DEFAULT '[]'::jsonb,  -- Array de ingresos con estructura {id, concept, amount, repeatingMonths}
  expenses JSONB DEFAULT '[]'::jsonb, -- Array de gastos con estructura {id, concept, amount, repeatingMonths}
  last_applied TEXT,  -- YYYY-MM
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, property_id, year)
);

-- Índices para mejorar performance
CREATE INDEX idx_pyt_user_id ON property_yearly_templates(user_id);
CREATE INDEX idx_pyt_property_id ON property_yearly_templates(property_id);
CREATE INDEX idx_pyt_year ON property_yearly_templates(year);
```

## Pasos para Crear las Tablas

1. Ve a tu proyecto en Supabase (https://app.supabase.com)
2. Selecciona tu base de datos
3. Ve a la sección "SQL Editor"
4. Copia y pega el SQL anterior en el editor
5. Ejecuta las consultas
6. Verifica que las tablas se hayan creado correctamente en la sección "Tables"

## Pasos para Configurar Políticas de Row Level Security (RLS)

Para mayor seguridad, configura RLS:

### Para `property_monthly_incomes`:

```sql
-- Habilitar RLS
ALTER TABLE property_monthly_incomes ENABLE ROW LEVEL SECURITY;

-- Política para SELECT
CREATE POLICY "Users can view their own monthly incomes"
  ON property_monthly_incomes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para INSERT
CREATE POLICY "Users can insert their own monthly incomes"
  ON property_monthly_incomes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE
CREATE POLICY "Users can update their own monthly incomes"
  ON property_monthly_incomes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE
CREATE POLICY "Users can delete their own monthly incomes"
  ON property_monthly_incomes
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Para `property_monthly_expenses`:

```sql
-- Habilitar RLS
ALTER TABLE property_monthly_expenses ENABLE ROW LEVEL SECURITY;

-- Política para SELECT
CREATE POLICY "Users can view their own monthly expenses"
  ON property_monthly_expenses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para INSERT
CREATE POLICY "Users can insert their own monthly expenses"
  ON property_monthly_expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE
CREATE POLICY "Users can update their own monthly expenses"
  ON property_monthly_expenses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE
CREATE POLICY "Users can delete their own monthly expenses"
  ON property_monthly_expenses
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Para `property_yearly_templates`:

```sql
-- Habilitar RLS
ALTER TABLE property_yearly_templates ENABLE ROW LEVEL SECURITY;

-- Política para SELECT
CREATE POLICY "Users can view their own yearly templates"
  ON property_yearly_templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para INSERT
CREATE POLICY "Users can insert their own yearly templates"
  ON property_yearly_templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE
CREATE POLICY "Users can update their own yearly templates"
  ON property_yearly_templates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política para DELETE
CREATE POLICY "Users can delete their own yearly templates"
  ON property_yearly_templates
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Características del Sistema

✅ **Plantilla Anual**: Crea una plantilla una sola vez al año con todos los ingresos y gastos recurrentes

✅ **Gastos Recurrentes Personalizables**:
- Define cuáles meses tiene hipoteca, comunidad, IBI, basura, etc.
- Especifica montos que pueden cambiar según el mes

✅ **Ingresos Recurrentes Personalizables**:
- Registra alquileres mensuales
- Ingresos extra en meses específicos

✅ **Aplicación Automática de Plantillas**:
- Selecciona un rango de meses (ej: Enero a Diciembre)
- La plantilla se aplica automáticamente generando todos los registros
- Luego solo marca qué se ha pagado

✅ **Registros Mensuales Editables**:
- Después de aplicar la plantilla, puedes editar cada registro individualmente
- Marca qué se ha pagado/cobrado

✅ **Control de Pagos**:

- Marca cada concepto como pagado o pendiente
- Visualiza cuánto has pagado y cuánto está pendiente

✅ **Vista Mensual**:
- Selector de mes/año para navegar fácilmente
- Resumen de ingresos y gastos del mes
- Diferencia neta (ingresos - gastos)

✅ **Almacenamiento Seguro**:
- Datos almacenados en Supabase
- Sincronización automática
- Acceso solo a tus datos

## Cómo Usar

1. En la página de Inversiones Inmobiliarias, ve a cualquier propiedad
2. Desplázate hasta la sección "📅 Registros Mensuales"
3. Selecciona el mes que deseas registrar
4. Agrega ingresos y gastos
5. Marca como pagado/no pagado según sea necesario
6. Los datos se guardan automáticamente en Supabase
