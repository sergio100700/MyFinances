# 📊 Aportaciones - Resumen Visual Rápido

## ¿Qué es Nuevo?

Cada inversión tiene un botón **📊** para gestionar aportaciones:

```
Antes:
┌────────────────────────────────┐
│ Apple Inc | 10 | $150 | $1,500 │
│ [✎ Editar] [🗑 Eliminar]       │
└────────────────────────────────┘

Ahora:
┌────────────────────────────────────────┐
│ Apple Inc | 10 | $150 | $1,500         │
│ [📊 Aportaciones] [✎ Editar] [🗑 Del] │
└────────────────────────────────────────┘
```

## 🎯 En 3 Pasos

### 1️⃣ Haz clic en 📊
```
Cartera → Encuentra tu inversión → Botón 📊
```

### 2️⃣ Ve el resumen
```
Total Aportado: $1,500
Valor Actual: $1,850
Ganancia: +$350 (+23.33%)
```

### 3️⃣ Agrega aportaciones
```
[➕ Agregar Nueva Aportación]
Fecha + Cantidad + Precio/Unidad
[✓ Agregar]
```

## 📋 Historial Automático

```
┌──────────┬──────────┬──────────┬──────────┐
│ Fecha    │ Cantidad │ P/Unid   │ Monto    │
├──────────┼──────────┼──────────┼──────────┤
│ 2026-01-15│ 3.00    │ $140.00  │ $420.00  │
│ 2026-01-22│ 5.00    │ $145.00  │ $725.00  │
│ 2026-01-29│ 2.00    │ $150.00  │ $300.00  │
├──────────┼──────────┼──────────┼──────────┤
│ TOTAL    │ 10.00   │ $147.25* │ $1,445.00│
└──────────┴──────────┴──────────┴──────────┘
* Precio promedio ponderado
```

## 💰 Ejemplo Real: DCA Mensual

```
ANTES (Sin aportaciones):
  - Tengo: 15 unidades
  - Invertí: $1,500
  - Valor actual: $1,650
  - Ganancia: $150 (+10%)
  ❌ No sé cuándo invertí cada peso

AHORA (Con aportaciones):
  - Enero: $500 a $100/unidad → 5 unidades
  - Febrero: $500 a $110/unidad → 4.55 unidades
  - Marzo: $500 a $95/unidad → 5.26 unidades
  
  Total: 14.81 unidades, $1,500, promedio $101.29
  Valor actual (a $110): $1,629.10
  Ganancia: $129.10 (+8.61%)
  
  ✅ Sé exactamente dónde invertí cada peso
  ✅ Sé qué mes fue mejor/peor precio
  ✅ Cálculos precisos
```

## 🧮 Cálculos Automáticos

### Precio Promedio
```
Inversión 1: 10 unidades a $100 = $1,000
Inversión 2: 5 unidades a $120 = $600

Promedio = $1,600 / 15 = $106.67/unidad
```

### Ganancia/Pérdida
```
Total Invertido: $1,600
Valor Actual (15 × $110): $1,650
Ganancia: $50 (+3.13%)
```

## 🎨 UI Simplificada

```
┌─ 📊 Aportaciones - Apple Inc ─────────────┐
│                                            │
│ Total Aportado  │  Valor Actual  │ Ganancia
│ $1,500.00       │  $1,850.00     │ +$350.00
│                 │                │ (+23.33%)
│                                            │
│ 📝 Historial (3)                          │
│ ┌──┬────────┬────────┬────────┬──────────┐
│ │  │ Fecha  │Cantidad│P/Unid │  Monto   │
│ ├──┼────────┼────────┼────────┼──────────┤
│ │  │ 26-01-15│3.00   │$140.00│ $420.00  │
│ │  │ 26-01-22│5.00   │$145.00│ $725.00  │
│ │  │ 26-01-29│2.00   │$150.00│ $300.00  │
│ └──┴────────┴────────┴────────┴──────────┘
│ [🗑] botones para eliminar cada una       │
│                                            │
│ [➕ Agregar Nueva Aportación]             │
│ [Cerrar]                                   │
└─────────────────────────────────────────────┘
```

## 🚀 Casos Principales

| Caso | Uso |
|------|-----|
| **DCA** | Aportaciones regulares iguales cada mes |
| **Fondos** | Múltiples aportaciones a diferentes precios |
| **Planes de Ahorro** | Aportes regulares + extras |
| **Seguimiento** | Ver historial completo de inversiones |

## ✨ Beneficios Instantáneos

✅ **Precio Promedio Preciso** - Basado en TODAS las aportaciones
✅ **Historial Completo** - Ve cada inversión y cuándo
✅ **Ganancia Real** - Calculada considerando todo
✅ **Flexible** - Agrega cuando quieras
✅ **Automático** - Todo se guarda y calcula solo
✅ **Sincronizable** - Se exporta con tus datos

## 🔧 Cómo Agregar

```
Modal Aportaciones
    ↓
[➕ Agregar Nueva Aportación]
    ↓
Formulario:
├─ Fecha: [2026-01-29]
├─ Cantidad: [10]
├─ Precio/Unidad: [$150]
└─ Monto: [calculado $1,500]
    ↓
[✓ Agregar]
    ↓
Se actualiza automáticamente
```

## 🎯 Ahora Puedes

✅ Agregar DCA mensual a fondos
✅ Registrar aportaciones extras (bonos, aguinaldo)
✅ Ver historial completo de inversiones
✅ Calcular precio promedio exacto
✅ Monitorear cada aportación
✅ Eliminar si cometiste error
✅ Exportar todo junto con datos

## 📊 Datos Guardados

```json
{
  "contributions": [
    {
      "id": "contrib-1234567890",
      "date": "2026-01-15",
      "amount": 420,
      "shares": 3,
      "pricePerShare": 140
    },
    {
      "id": "contrib-1234567891",
      "date": "2026-01-22",
      "amount": 725,
      "shares": 5,
      "pricePerShare": 145
    }
  ]
}
```

---

**¡Listo para usar! 🚀**
