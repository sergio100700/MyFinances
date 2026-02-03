# Sistema de Plantillas Anuales y Registros Mensuales - Implementación Completada

## 📋 Lo que se ha implementado

### 1. **Plantillas Anuales (PropertyYearlyTemplate)**
Permite crear una plantilla una sola vez al año con todos los gastos e ingresos recurrentes.

**Características:**
- Define ingresos recurrentes (alquiler, extras, etc.)
- Define gastos recurrentes (hipoteca, comunidad, IBI, basura, derrama, etc.)
- Para cada concepto, especifica en qué meses se repite
- Los montos pueden variar por mes

**Ventajas:**
- Una sola configuración al año
- No tienes que estar creando registros manualmente cada mes
- Puedes cambiar montos según el mes (ej: IBI no cada mes, sino una vez al año)

### 2. **Registros Mensuales Personalizables**
Sistema flexible para registrar mes a mes lo que pagues/cobres.

**Características:**
- Vista mensual intuitiva con selector mes/año
- Agregar ingresos y gastos manualmente o desde plantilla
- Marcar como pagado/pendiente cada concepto
- Ver resumen de totales y diferencia neta
- Eliminar o editar registros

## 🚀 Flujo de Uso Recomendado

### Opción A: Usar Plantilla (Recomendado)

1. **Ir a "📋 Plantilla Anual"** en cada propiedad
2. **Agregar Ingresos Recurrentes:**
   - "Alquiler" → €800 → Todos los meses (ene-dic)
   - "Extra" → €50 → Solo mayo y septiembre

3. **Agregar Gastos Recurrentes:**
   - "Hipoteca" → €400 → Todos los meses
   - "Comunidad" → €100 → Todos los meses
   - "IBI" → €75 → Solo en diciembre
   - "Basura" → €20 → Todos los meses

4. **Aplicar Plantilla a Período:**
   - Selecciona "Desde Enero hasta Diciembre"
   - Selecciona el año (2026)
   - Haz clic en "✨ Aplicar Plantilla"
   - Se crean automáticamente todos los registros

5. **Marcar como Pagado:**
   - Ve a "📅 Registros Mensuales"
   - Para cada mes, marca los items que ya has pagado/cobrado

### Opción B: Registros Manuales (Sin Plantilla)

1. Directamente en "📅 Registros Mensuales"
2. Agregar ingresos y gastos mes a mes
3. Marcar según se vayan pagando

## 📊 Estructura de Datos

### PropertyYearlyTemplate
```typescript
{
  id: string;
  propertyId: string;
  year: number;
  incomes: [
    {
      id: string;
      concept: "Alquiler"; // Tu concepto personalizado
      amount: 800;
      repeatingMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // 1=enero, 12=diciembre
    }
  ];
  expenses: [
    {
      id: string;
      concept: "Hipoteca";
      amount: 400;
      repeatingMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    },
    {
      id: string;
      concept: "IBI";
      amount: 75;
      repeatingMonths: [12]; // Solo diciembre
    }
  ];
  lastApplied?: "2026-12"; // YYYY-MM
}
```

### PropertyMonthlyIncome / PropertyMonthlyExpense
```typescript
{
  id: string;
  propertyId: string;
  yearMonth: "2026-01"; // YYYY-MM
  concept: "Alquiler";
  amount: 800;
  paid: true; // Marcado como pagado
}
```

## 🔧 Tablas Supabase a Crear

Ver archivo `SETUP_MONTHLY_RECORDS.md` para el SQL exacto. Resumidamente:

1. `property_monthly_incomes` - Registros mensuales de ingresos
2. `property_monthly_expenses` - Registros mensuales de gastos
3. `property_yearly_templates` - Plantillas anuales (almacena JSON de ingresos/gastos)

## 🎨 Interfaz Visual

### Plantilla Anual
- Desplegable que muestra ingresos y gastos recurrentes
- Botones para agregar/eliminar conceptos
- Selector de meses con checkboxes
- Selector de período para aplicar a múltiples meses de una vez

### Registros Mensuales
- Selector mes/año en la parte superior
- Tarjetas con resumen: Ingresos Totales, Gastos Totales, Diferencia Neta
- Listas de ingresos y gastos con checkboxes para marcar pagado
- Botones para agregar/eliminar registros

## 💾 Almacenamiento

Todo se guarda en Supabase automáticamente:
- Las plantillas se guardan y cargan cuando cambias de año
- Los registros mensuales se sincronizan en tiempo real
- Acceso desde cualquier dispositivo
- Datos seguros con Row Level Security

## 🔗 Funciones de Storage Agregadas

```typescript
// Plantillas
savePropertyYearlyTemplate(template)
loadPropertyYearlyTemplate(propertyId, year)
applyYearlyTemplateToPeriod(propertyId, template, startMonth, endMonth, year)

// Registros mensuales (ya existían)
addPropertyMonthlyIncome(income)
addPropertyMonthlyExpense(expense)
loadPropertyMonthlyRecords(propertyId)
updatePropertyMonthlyIncome(incomeId, updates)
updatePropertyMonthlyExpense(expenseId, updates)
deletePropertyMonthlyIncome(incomeId)
deletePropertyMonthlyExpense(expenseId)
```

## 📱 Componentes Creados/Actualizados

1. **PropertyYearlyTemplate.tsx** (NUEVO)
   - Gestión completa de plantillas anuales
   - Agregar/eliminar ingresos y gastos
   - Aplicar plantilla a rango de meses

2. **PropertyMonthlyRecords.tsx** (YA EXISTÍA)
   - Registros mensuales con vista flexible
   - Agregar/eliminar/editar registros

3. **real-estate.tsx** (ACTUALIZADO)
   - Incluye ambos componentes
   - Usa el año actual automáticamente

## ✨ Casos de Uso Prácticos

### Escenario: Tienes 2 propiedades

**Propiedad 1 (Casa Principal):**
- Alquiler: €800 (todos los meses)
- Hipoteca: €400 (todos los meses)
- Comunidad: €100 (todos los meses)
- IBI: €75 (solo diciembre)

**Propiedad 2 (Apartamento):**
- Alquiler: €600 (todos los meses)
- Hipoteca: €250 (todos los meses)
- Basura: €15 (todos los meses)

**Con este sistema:**
1. Creas la plantilla una sola vez para cada propiedad
2. Aplicas a "Enero-Diciembre 2026"
3. En cada mes, solo marca qué se pagó/cobró
4. Tienes visibilidad total de tu flujo de caja real

## 🚨 IMPORTANTE: Pasos para Activar

1. Ve a Supabase
2. Copia el SQL de `SETUP_MONTHLY_RECORDS.md`
3. Pega en SQL Editor y ejecuta
4. Las nuevas tablas se crearán
5. El sistema estará listo para usar

## 📈 Mejoras Futuras (Roadmap)

- [ ] Editar ingresos/gastos existentes
- [ ] Resumen anual con gráficos
- [ ] Comparar años
- [ ] Exportar a PDF
- [ ] Alertas para pagos pendientes
- [ ] Histórico de plantillas por año
