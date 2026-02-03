# Guía de ISINs y Tickers para Yahoo Finance

## ¿Qué es un ISIN?

El ISIN (International Securities Identification Number) es un código único de 12 caracteres que identifica valores específicos. Tiene el formato: **[Código de país (2 letras)][Identificador nacional (9 caracteres)][Dígito de control (1)]**

Ejemplo: `US0378331005` (Apple Inc.)

## Uso en la Aplicación

La aplicación acepta dos formatos:

1. **ISIN completo**: Ej. `US0378331005`
2. **Ticker de Yahoo Finance**: Ej. `AAPL`

El sistema consultará automáticamente el precio actual a Yahoo Finance cuando agregues una inversión o hagas clic en "Actualizar Precios".

## ISINs y Tickers Comunes

### 🇺🇸 Acciones de EE.UU.

| Empresa | ISIN | Ticker Yahoo |
|---------|------|--------------|
| Apple Inc. | US0378331005 | AAPL |
| Microsoft Corp. | US5949181045 | MSFT |
| Alphabet (Google) | US02079K3059 | GOOGL |
| Amazon.com Inc. | US0231351067 | AMZN |
| Tesla Inc. | US88160R1014 | TSLA |
| Meta Platforms | US30303M1027 | META |
| NVIDIA Corp. | US67066G1040 | NVDA |
| Berkshire Hathaway | US0846707026 | BRK-B |
| JPMorgan Chase | US46625H1005 | JPM |
| Visa Inc. | US92826C8394 | V |

### 📊 ETFs Populares

| Nombre | ISIN | Ticker Yahoo |
|--------|------|--------------|
| SPDR S&P 500 ETF | US78462F1030 | SPY |
| iShares Core S&P 500 | US4642872349 | IVV |
| Vanguard S&P 500 | US9229083632 | VOO |
| iShares Core MSCI World | IE00B4L5Y983 | IWDA.AS |
| Vanguard FTSE All-World | IE00B3RBWM25 | VWCE.DE |
| iShares MSCI Emerging Markets | US4642874576 | EEM |
| Invesco QQQ Trust | US46090E1038 | QQQ |

### 🌍 Acciones Internacionales

**Europa:**
- SAP SE: `DE0007164600` → `SAP.DE`
- ASML Holding: `NL0010273215` → `ASML.AS`
- LVMH: `FR0000121014` → `MC.PA`
- Nestlé: `CH0038863350` → `NESN.SW`

**Asia:**
- Toyota Motor: `JP3633400001` → `7203.T`
- Samsung Electronics: `KR7005930003` → `005930.KS`
- Taiwan Semiconductor: `US8740391003` → `TSM` (ADR)

### 💰 Criptomonedas (a través de trusts/fondos)

| Nombre | Ticker Yahoo |
|--------|--------------|
| Grayscale Bitcoin Trust | GBTC |
| Grayscale Ethereum Trust | ETHE |
| ProShares Bitcoin Strategy ETF | BITO |

## Sufijos de Mercado en Yahoo Finance

Cuando uses tickers (no ISINs), añade el sufijo del mercado:

- **Sin sufijo**: NYSE/NASDAQ (EE.UU.)
- **.L**: London Stock Exchange
- **.PA**: Euronext Paris
- **.DE**: XETRA (Alemania)
- **.AS**: Euronext Amsterdam
- **.MI**: Borsa Italiana (Milán)
- **.SW**: Swiss Exchange
- **.T**: Tokyo Stock Exchange
- **.HK**: Hong Kong Stock Exchange

Ejemplos:
- `AAPL` → Apple en NASDAQ
- `IWDA.AS` → iShares Core MSCI World en Amsterdam
- `VWCE.DE` → Vanguard All-World en Frankfurt

## Consejos

1. **Usa tickers cuando sea posible**: Son más cortos y Yahoo Finance los reconoce directamente.
2. **ISINs para fondos europeos**: Los ETFs europeos funcionan mejor con tickers que incluyen el sufijo de mercado.
3. **Verifica el ticker**: Si no funciona, busca el activo en [finance.yahoo.com](https://finance.yahoo.com) y copia el ticker exacto.
4. **Actualización automática**: Los precios se actualizan automáticamente al cargar la página o al hacer clic en "Actualizar Precios".

## Solución de Problemas

**Error: "No se pudo obtener el precio actual"**
- Verifica que el ISIN/ticker sea correcto
- Intenta usar el ticker en lugar del ISIN
- Agrega el sufijo de mercado correcto (ej. `.L`, `.DE`)
- Busca el símbolo en yahoo.com/finance

**Precio no actualiza:**
- Yahoo Finance puede tener límites de tasa
- Espera unos segundos e intenta de nuevo
- Los mercados pueden estar cerrados (precio del último cierre)

## API de Yahoo Finance

La aplicación usa la API pública de Yahoo Finance v8:
```
https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}
```

No requiere autenticación pero tiene límites de tasa para uso intensivo.
