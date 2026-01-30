# 🎬 Demostración de Importación/Exportación

## Pantalla de Ajustes Actualizada

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚙️ Ajustes                                                   ✕  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  💱 Selecciona tu Divisa                                       │
│  ├─ ◉ Dólar Estadounidense (USD)                              │
│  ├─ ○ Euro (EUR)                                              │
│  ├─ ○ Libra Esterlina (GBP)                                   │
│  ├─ ○ Peso Argentino (ARS)                                    │
│  ├─ ○ Peso Mexicano (MXN)                                     │
│  └─ ○ Peso Colombiano (COP)                                   │
│                                                                 │
│  ────────────────────────────────────────────────────────────── │
│                                                                 │
│  💾 Respalda tus Datos                                        │
│                                                                 │
│  ┌─────────────────────┬─────────────────────┐               │
│  │ 📥 EXPORTAR         │ 📤 IMPORTAR         │               │
│  └─────────────────────┴─────────────────────┘               │
│                                                                 │
│  ────────────────────────────────────────────────────────────── │
│                                                                 │
│  ┌────────────┐               ┌────────────┐                 │
│  │  Cancelar  │               │  Guardar   │                 │
│  └────────────┘               └────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Exportación

```
USUARIO
  │
  └─→ Hace clic en "📥 EXPORTAR"
        │
        └─→ Sistema recopila datos:
            ├─ Inversiones
            ├─ Propiedades
            ├─ Presupuestos
            ├─ Transacciones
            └─ Configuración
              │
              └─→ Crea JSON con estructura:
                  {
                    "version": "1.0",
                    "exportDate": "2026-01-29T15:30:45Z",
                    "data": {...},
                    "settings": {...}
                  }
                    │
                    └─→ Descarga archivo:
                        "cartera-financiera-2026-01-29.json"
                          │
                          └─→ ✓ Confirmación: "Datos exportados correctamente"
```

## Flujo de Importación

```
USUARIO
  │
  └─→ Hace clic en "📤 IMPORTAR"
        │
        └─→ Selecciona archivo "cartera-financiera-2026-01-29.json"
              │
              └─→ Sistema valida:
                  ├─ ¿Es JSON válido? ✓
                  ├─ ¿Tiene estructura correcta? ✓
                  └─ ¿Contiene "data" y "settings"? ✓
                      │
                      └─→ Restaura en localStorage:
                          ├─ Todos los datos
                          └─ Configuración
                            │
                            └─→ Muestra: "✓ Datos importados correctamente. Recargando..."
                                  │
                                  └─→ Recarga página automáticamente (1.5s)
                                        │
                                        └─→ USUARIO VE TODOS SUS DATOS RESTAURADOS
```

## Ejemplo de Archivo Exportado

```json
{
  "version": "1.0",
  "exportDate": "2026-01-29T15:30:45.123Z",
  "data": {
    "transactions": [
      {
        "id": "1",
        "type": "income",
        "amount": 5000,
        "category": "Salario",
        "date": "2026-01-15",
        "description": "Salario mensual"
      },
      {
        "id": "2",
        "type": "expense",
        "amount": 1200,
        "category": "Vivienda",
        "date": "2026-01-20",
        "description": "Alquiler"
      }
    ],
    "investments": [
      {
        "id": "inv-1",
        "type": "stocks",
        "name": "Apple Inc",
        "isin": "US0378331005",
        "shares": 10,
        "purchasePrice": 150,
        "amount": 1500,
        "currentPrice": 185,
        "currentValue": 1850,
        "currency": "USD",
        "valuationMode": "auto"
      },
      {
        "id": "inv-2",
        "type": "funds",
        "name": "Fondo de Inversión XYZ",
        "manualAmount": 5000,
        "manualCurrentValue": 5500,
        "valuationMode": "manual"
      }
    ],
    "properties": [
      {
        "id": "prop-1",
        "name": "Apartamento Centro",
        "value": 250000,
        "mortgage": 150000,
        "monthlyRent": 1500,
        "occupancy": 100,
        "purchaseDate": "2020-06-15",
        "currency": "USD"
      }
    ],
    "budgets": [
      {
        "id": "budget-1",
        "category": "Comida",
        "month": "2026-01",
        "budgeted": 500,
        "spent": 450
      },
      {
        "id": "budget-2",
        "category": "Transporte",
        "month": "2026-01",
        "budgeted": 200,
        "spent": 180
      }
    ]
  },
  "settings": {
    "currency": "USD",
    "currencySymbol": "$"
  }
}
```

## Manejo de Errores

### Error 1: Archivo inválido
```
❌ Usuario intenta importar un archivo que no es JSON

RESULTADO:
├─ Validación falla
├─ Mensaje de error: "No se pudo importar los datos. Verifica que sea un archivo válido."
└─ Estado NO cambia
```

### Error 2: Archivo corrupto
```
❌ Usuario intenta importar un archivo JSON pero sin estructura correcta

RESULTADO:
├─ JSON es válido pero no tiene "data" o "settings"
├─ Mensaje de error: "Formato de archivo inválido"
└─ Datos anteriores se preservan
```

### Error 3: Error de lectura de archivo
```
❌ El sistema no puede leer el archivo

RESULTADO:
├─ Error al leer
├─ Mensaje de error: "Error al leer el archivo"
└─ Se puede intentar nuevamente
```

## Casos de Uso Reales

### Caso 1: Migración a Nuevo Dispositivo

**Dispositivo A (Antiguo):**
```
1. Abre ajustes (⚙️)
2. Hace clic en "📥 EXPORTAR"
3. Descarga: cartera-financiera-2026-01-29.json
4. Guarda en Google Drive / Email / USB
```

**Dispositivo B (Nuevo):**
```
1. Abre la app
2. Abre ajustes (⚙️)
3. Hace clic en "📤 IMPORTAR"
4. Selecciona: cartera-financiera-2026-01-29.json
5. ✓ Todos los datos están en el nuevo dispositivo
```

### Caso 2: Respaldo Mensual

**Cada 1º de mes:**
```
1. Abre la app
2. Abre ajustes (⚙️)
3. Hace clic en "📥 EXPORTAR"
4. Descarga: cartera-financiera-2026-01-01.json
5. Guarda en carpeta "Backups" local
6. Repite cada mes
   ├─ cartera-financiera-2026-01-01.json
   ├─ cartera-financiera-2026-02-01.json
   ├─ cartera-financiera-2026-03-01.json
   └─ ...
```

### Caso 3: Recuperación de Accidente

**Escenario:**
```
Usuario borra accidentalmente todas sus inversiones
Pero tiene un backup de hace 1 semana
```

**Solución:**
```
1. Abre ajustes (⚙️)
2. Hace clic en "📤 IMPORTAR"
3. Selecciona: cartera-financiera-2026-01-22.json
4. ✓ Inversiones restauradas
5. Datos recientes se perdieron, pero está mejor que nada
```

## Estadísticas de Datos

### Ejemplo de Tamaño de Archivo

| Contenido | Tamaño Aproximado |
|-----------|------------------|
| Datos básicos | 1-5 KB |
| 50 inversiones | 10-20 KB |
| 200 transacciones | 20-50 KB |
| 100 propiedades | 50-100 KB |
| Todo completo | 50-150 KB |

*(Los archivos JSON son muy eficientes)*

## Recomendaciones de Uso

✅ **Hacer:**
- Exportar regularmente (mensual o trimestral)
- Guardar backups en múltiples ubicaciones
- Nombrar archivos descriptivamente
- Probar importación ocasionalmente
- Mantener versiones antiguas

❌ **Evitar:**
- No guardar respaldos nunca
- Eliminar archivos de backup sin revisar
- Compartir archivos con personas no confiables
- Dejar archivos en escritorio sin protección
- Confiar solo en backups sin verificar

---

## Preguntas Frecuentes

**P: ¿Mis datos están seguros en los archivos JSON?**
A: Sí, están en tu computadora. No se suben a internet. Pero son texto plano, así que guárdalos seguro.

**P: ¿Puedo editar el archivo JSON manualmente?**
A: Sí, pero debes mantener la estructura exacta. Es recomendable usar un editor JSON.

**P: ¿Qué pasa si importo datos diferentes a los que tengo?**
A: Se reemplazan todos los datos actuales. Los antiguos se pierden a menos que tengas backup.

**P: ¿Puedo importar datos en otro navegador o dispositivo?**
A: Sí, siempre y cuando sea la misma app. Funciona entre cualquier navegador/dispositivo.

**P: ¿Hay un límite de tamaño de archivo?**
A: Los navegadores modernos soportan archivos de varios MB sin problemas.

---

**Última actualización**: 29 de enero de 2026
**Versión**: 1.0
