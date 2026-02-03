# 📊 Sistema de Aportaciones - Guía Completa

## ¿Qué es?

El sistema de aportaciones permite registrar **contribuciones periódicas** a tus inversiones. Esto es especialmente útil para:

- **DCA (Dollar Cost Averaging)**: Aportaciones regulares a la misma inversión
- **Fondos de inversión**: Múltiples aportes mensuales/semanales
- **Planes de ahorro**: Contribuciones adicionales en diferentes fechas
- **Seguimiento detallado**: Ver exactamente cuándo y cuánto has invertido

## 🎯 Ubicación

En la página **📈 Cartera de Inversiones**, cada inversión tiene un botón **📊** que abre el gestor de aportaciones.

```
┌─────────────────────────────────────────────────┐
│ Inversión: Apple Inc (US0378331005)             │
├─────────────────────────────────────────────────┤
│ Cantidad: 10 | Precio Compra: $150 | Total: ..│
│                                                 │
│ [📊] [✎ Editar] [🗑 Eliminar]                  │
│  ↑                                              │
│  Botón de Aportaciones                          │
└─────────────────────────────────────────────────┘
```

## 📝 Cómo Usar

### Paso 1: Abre el Gestor de Aportaciones

```
Invierte en tu cartera (📈)
    ↓
Encuentra tu inversión
    ↓
Haz clic en botón [📊]
```

### Paso 2: Ve el Resumen

```
┌────────────────────────────────────────┐
│ 📊 Aportaciones - Apple Inc            │
├────────────────────────────────────────┤
│                                        │
│ Total Aportado: $1,500.00              │
│ Valor Actual: $1,850.00                │
│ Ganancia: +$350.00 (+23.33%)           │
│                                        │
└────────────────────────────────────────┘
```

### Paso 3: Ver Historial

El sistema muestra todas tus aportaciones:

```
📝 Historial de Aportaciones (3)

Fecha      | Cantidad  | P/Unidad | Monto
-----------|-----------|----------|----------
2026-01-29 | 10.000000 | $150.00  | $1,500.00
2026-01-22 | 5.000000  | $145.00  | $725.00
2026-01-15 | 3.000000  | $140.00  | $420.00
```

### Paso 4: Agregar Nueva Aportación

```
1. Haz clic en [➕ Agregar Nueva Aportación]
2. Rellena el formulario:
   - Fecha
   - Cantidad de Unidades
   - Precio/Unidad
   - Monto Total (se calcula automáticamente)
3. Haz clic en [✓ Agregar]
```

## 💡 Casos de Uso

### Caso 1: DCA Mensual en Fondo

```
Enero:
  ➕ Aportación de $500 a $20/unidad
  → 25 unidades

Febrero:
  ➕ Aportación de $500 a $22/unidad
  → 22.73 unidades

Marzo:
  ➕ Aportación de $500 a $18/unidad
  → 27.78 unidades

Total: $1,500 → 75.51 unidades → Precio promedio: $19.87/unidad
```

### Caso 2: Fondo con Aportaciones Extras

```
Aportación Base (Enero): $1,000 a $100/unidad = 10 unidades

Extras:
  - Bono (Marzo): $300 a $105/unidad = 2.86 unidades
  - Ahorro (Mayo): $200 a $110/unidad = 1.82 unidades

Total: $1,500 → 14.68 unidades → Precio promedio: $102.18/unidad
```

### Caso 3: Seguimiento Detallado

```
Quiero saber EXACTAMENTE cuándo invertí cada peso

Historial completo:
✓ Inversión inicial: 2026-01-01, $5,000
✓ Contribución mensual: 2026-02-01, $500
✓ Contribución mensual: 2026-03-01, $500
✓ Contribución extra: 2026-03-15, $200 (bono)
✓ Contribución mensual: 2026-04-01, $500

Total claro: $7,200 invertidos
```

## 🧮 Cálculos Automáticos

### Precio Promedio de Compra

El sistema calcula automáticamente tu precio promedio:

```
Formula: Total Invertido / Total Unidades

Ejemplo:
  - Aportación 1: 100 unidades a $10 = $1,000
  - Aportación 2: 50 unidades a $12 = $600
  - Total: 150 unidades, $1,600 invertidos
  - Precio promedio: $1,600 / 150 = $10.67/unidad
```

### Ganancia/Pérdida

Se calcula basado en todas tus aportaciones:

```
Formula: Valor Actual - Total Invertido

Ejemplo:
  - Total Invertido: $1,600
  - Valor Actual (150 unidades a $11): $1,650
  - Ganancia: $50 (+3.13%)
```

## 📊 Características

✅ **Registro Automático**: Se guarda todo automáticamente
✅ **Cálculos Automáticos**: Precio promedio actualizado automáticamente
✅ **Historial Completo**: Ver todas las aportaciones en orden
✅ **Edición Flexible**: Puedes eliminar aportaciones si es necesario
✅ **Resumen Visual**: Ganancia/pérdida clara en tiempo real
✅ **Múltiples Divisas**: Soporta todas las divisas disponibles

## ⚙️ Funcionalidades Avanzadas

### Editar Aportaciones

```
Si cometiste un error:

1. Ve al Historial
2. Busca la aportación incorrecta
3. Haz clic en [🗑️ Eliminar]
4. Agrega una nueva aportación correcta

El precio promedio se recalcula automáticamente
```

### Ver Ganancias Realistas

```
Con aportaciones registradas, ves:

Total Aportado: Suma de TODAS las aportaciones
Valor Actual: Precio actual × Total unidades
Ganancia: Diferencia real considerando TODO

Esto es mucho más preciso que solo tener
un "precio de compra promedio" aproximado
```

### Comparar Períodos

```
Por ejemplo, ¿cuánto gané en Marzo?

Mira aportaciones de Marzo
Compara con precio actual
Calcula rendimiento del mes
```

## 🎨 Interfaz

### Modal de Aportaciones

```
┌──────────────────────────────────────────────┐
│ 📊 Aportaciones - Fondo XYZ          [✕]    │
├──────────────────────────────────────────────┤
│                                              │
│ Total Aportado  │ Valor Actual  │ Ganancia  │
│ $5,000.00       │ $5,500.00     │ +$500.00  │
│                 │               │ (+10.00%) │
│                                              │
├─ 📝 Historial de Aportaciones (4)           │
│                                              │
│ [Tabla con todas las aportaciones]           │
│                                              │
│                                              │
├─ [➕ Agregar Nueva Aportación]              │
│                                              │
│ [Cerrar]                                     │
│                                              │
└──────────────────────────────────────────────┘
```

### Formulario de Nueva Aportación

```
┌──────────────────────────────────────────────┐
│ ➕ Nueva Aportación                          │
├──────────────────────────────────────────────┤
│                                              │
│ Fecha: [2026-01-29]                         │
│ Cantidad de Unidades: [10.000000]           │
│ Precio/Unidad: [$150.00]                    │
│ Monto Total: [$1,500.00]                    │
│                                              │
│ Monto calculado: $1,500.00                  │
│                                              │
│ [✓ Agregar]  [✕ Cancelar]                  │
│                                              │
└──────────────────────────────────────────────┘
```

## 🔄 Flujo de Datos

### Al Agregar una Aportación

```
Usuario ingresa:
├─ Fecha
├─ Cantidad de unidades
├─ Precio por unidad
└─ Monto (opcional, se calcula)
    ↓
Sistema guarda aportación
    ↓
Recalcula totales:
├─ Total de unidades
├─ Total invertido
└─ Precio promedio
    ↓
Actualiza la inversión
    ↓
Recarga cartera
```

### Al Eliminar una Aportación

```
Usuario confirma eliminación
    ↓
Se elimina aportación
    ↓
Sistema recalcula:
├─ Si quedan aportaciones:
│  └─ Nuevo total (unidades, monto, promedio)
└─ Si no quedan:
   └─ Se limpian contribuciones
    ↓
Actualiza inversión
    ↓
Recarga cartera
```

## 📱 Casos de Uso Real

### Usuario: Jorge (DCA en Fondo)

```
Objetivo: Invertir $500 mensuales en fondo de renta fija

Enero 2026: $500 a $100/unidad = 5 unidades
Febrero: $500 a $102/unidad = 4.90 unidades
Marzo: $500 a $98/unidad = 5.10 unidades
Abril: $500 a $101/unidad = 4.95 unidades

✓ Con aportaciones:
  - Ve exactamente cuándo invirtió
  - Ve cuándo fue mejor precio (marzo)
  - Ve promedio ponderado: $100.27/unidad
  - Ve ganancia/pérdida real

✗ Sin aportaciones:
  - Solo ve: 20 unidades, $2,000 invertido
  - No sabe el historial
  - Menos información
```

### Usuario: Maria (Fondo con Aportes Extras)

```
Fondo Mensual:
├─ Enero: $1,000
├─ Febrero: $1,000
├─ Marzo: $1,000
└─ Abril: $1,000

Aportes Extras:
├─ Bono Marzo: $500
└─ Aguinaldo: $2,000

✓ Con aportaciones:
  - Ve el impacto de cada aporte
  - Sabe cuándo subió más por bono
  - Ve ROI por período
  - Información completa

✗ Sin aportaciones:
  - Solo: 7 unidades, $6,500
  - Pierde toda la historia
```

## 🎯 Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Precisión** | Precio promedio exacto basado en todas las aportaciones |
| **Transparencia** | Ve exactamente cuándo y cuánto invertiste |
| **Seguimiento** | Monitorea DCA y planes de ahorro |
| **Análisis** | Compara retornos de diferentes períodos |
| **Documentación** | Historial completo de inversiones |
| **Impuestos** | Base clara para declaración de impuestos |

## ⚠️ Consideraciones Importantes

- **Ediciones**: Puedes eliminar aportaciones, pero no editar directamente (elimina y agrega una nueva)
- **Fechas**: Pueden estar en cualquier orden, se muestran ordenadas
- **Cálculos**: Todo se recalcula automáticamente
- **Historial**: Se guarda en localStorage junto con la inversión
- **Sincronización**: Si exportas datos, incluye todas las aportaciones

## 🚀 Tips de Uso

1. **Agrega regularmente**: No esperes el fin del mes
2. **Sé preciso**: Usa fechas reales y montos exactos
3. **Revisa periódicamente**: Ve cómo crece tu inversión
4. **Aprovecha para análisis**: Ve cuándo fue mejor momento para invertir
5. **Exporta backup**: Las aportaciones se guardan en exportaciones

## 🔗 Relación con Otros Sistemas

### Con Importación/Exportación
```
Exportar: Se guardan todas las aportaciones en el archivo JSON
Importar: Se restauran todas las aportaciones cuando importas
```

### Con Edición de Inversiones
```
Si editas la inversión (nombre, ISIN), las aportaciones persisten
Si cambias el modo de valuación, las aportaciones se mantienen
```

### Con Actualización de Precios
```
Las aportaciones históricas no cambian
El precio actual se actualiza automáticamente
La ganancia/pérdida se recalcula siempre
```

## 📚 Archivos Modificados

- `src/types/index.ts` - Agregada interfaz `Contribution`
- `src/components/forms/ContributionManager.tsx` - Nuevo componente
- `src/pages/portfolio.tsx` - Integrado gestor de aportaciones
- `src/lib/storage.ts` - Sin cambios (usa updateInvestment existente)

---

**Versión**: 1.0
**Fecha**: 29 de enero de 2026
**Estado**: ✅ Implementado y Funcional
