# 🚀 Nueva Funcionalidad: Precios en Tiempo Real con Yahoo Finance

## ✨ ¿Qué hay de nuevo?

La cartera de inversiones ahora se sincroniza automáticamente con Yahoo Finance para obtener precios actualizados en tiempo real.

## 📋 Cómo funciona

### 1. Agregar una inversión con ISIN o Ticker

Ahora, en lugar de ingresar el nombre y valor manual, solo necesitas:

- **ISIN o Ticker**: Ej. `AAPL` o `US0378331005`
- **Cantidad de acciones**: Ej. `10`
- **Precio de compra**: Ej. `150.00`

El sistema calculará automáticamente:
- Total invertido = 10 × $150 = $1,500
- Consultará el precio actual a Yahoo Finance
- Calculará el valor actual y la ganancia/pérdida

### 2. Actualización automática

Los precios se actualizan automáticamente:
- ✅ Al cargar la página (F5)
- ✅ Al hacer clic en "🔄 Actualizar Precios"
- ✅ Después de agregar una nueva inversión

### 3. Información detallada

La tabla ahora muestra:
- Nombre e ISIN del activo
- Cantidad de acciones
- Precio de compra
- **Precio actual** (actualizado de Yahoo Finance)
- Total invertido
- Valor actual
- Retorno (% y monto)

## 🎯 Ejemplo Práctico

### Agregar Apple Inc.

1. Clic en "+ Agregar Inversión"
2. ISIN o Ticker: `AAPL`
3. Nombre (opcional): `Apple Inc.`
4. Cantidad: `5`
5. Precio de compra: `180.00`
6. Fecha de compra: `2024-01-15`
7. Tipo: `Acciones`
8. Clic en "💾 Guardar Inversión"

El sistema:
- Consultará el precio actual de AAPL a Yahoo Finance (ej. $220)
- Guardará: 5 acciones × $180 = $900 invertidos
- Calculará: 5 acciones × $220 = $1,100 valor actual
- Mostrará: +$200 ganancia (+22.2%)

### Actualizar precios

Cada vez que hagas F5 o clic en "🔄 Actualizar Precios":
- Se consultarán los precios actuales de todos tus activos
- Se recalcularán los valores y ganancias
- Verás "⏳ Actualizando..." mientras se obtienen los datos

## 📊 Tickers Comunes

```
Acciones US:    AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA
ETFs US:        SPY, VOO, QQQ, VTI
ETFs Europa:    IWDA.AS, VWCE.DE, EUNL.DE
```

Ver [YAHOO_FINANCE_GUIDE.md](./YAHOO_FINANCE_GUIDE.md) para una lista completa.

## ⚠️ Notas Importantes

- **Mercados cerrados**: Fuera del horario de mercado, verás el precio del último cierre
- **ISINs europeos**: Usa el ticker con sufijo (ej. `IWDA.AS` en lugar del ISIN)
- **Tickers incorrectos**: Si aparece error, verifica el símbolo en finance.yahoo.com
- **Actualización**: Los precios no se actualizan automáticamente en segundo plano (necesitas F5 o botón)

## 🔧 Cambios Técnicos

### Nuevo modelo de datos

```typescript
interface Investment {
  id: string;
  name: string;
  isin: string;              // ← NUEVO
  shares: number;            // ← NUEVO
  purchasePrice: number;     // ← NUEVO
  amount: number;            // Calculado: shares × purchasePrice
  currentValue: number;      // Calculado: shares × currentPrice
  currentPrice?: number;     // ← NUEVO: Precio actual de Yahoo
  purchaseDate: string;
  type: 'stocks' | 'etf' | 'crypto' | 'bonds' | 'other';
}
```

### Nuevos archivos

- `src/lib/yahooFinance.ts`: Servicio de integración con Yahoo Finance
- `YAHOO_FINANCE_GUIDE.md`: Guía de ISINs y tickers
- `QUICK_START.md`: Esta guía

## 🎉 ¡Disfruta tu cartera actualizada en tiempo real!
