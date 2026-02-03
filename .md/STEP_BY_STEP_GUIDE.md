# 📖 Guía Paso a Paso: Importación/Exportación

## 📥 EXPORTAR TUS DATOS

### Paso 1: Abre los Ajustes
```
Pantalla principal
        ↓
Busca el botón ⚙️ en la esquina superior derecha
        ↓
Haz clic en ⚙️
```

**Visual:**
```
┌─────────────────────────────────┐
│ 💰 Mi Cartera Financiera  ⚙️ ← |
└─────────────────────────────────┘
```

### Paso 2: Desplázate a la Sección de Respaldo
```
Se abrirá un modal con:
  ├─ Selección de Divisa (arriba)
  └─ Respalda tus Datos (abajo) ← Desplázate aquí
```

**Visual:**
```
┌──────────────────────────────────────┐
│ ⚙️ Ajustes                        ✕  │
├──────────────────────────────────────┤
│ 💱 Selecciona tu Divisa              │
│ [opciones...]                        │
│                                      │
│ ─────────────────────────────────    │
│ 💾 Respalda tus Datos ← AQUÍ         │
│                                      │
│ ┌──────────────┬──────────────┐     │
│ │ 📥 EXPORTAR  │ 📤 IMPORTAR  │     │
│ └──────────────┴──────────────┘     │
└──────────────────────────────────────┘
```

### Paso 3: Haz Clic en "📥 EXPORTAR"
```
Botón "📥 EXPORTAR" (botón verde a la izquierda)
        ↓
Haz clic
        ↓
Se descargará un archivo automáticamente
```

### Paso 4: Guarda el Archivo
```
Archivo descargado: cartera-financiera-2026-01-29.json
        ↓
Se guardaré en tu carpeta de Descargas
        ↓
RECOMENDADO: 
  ├─ Copia a carpeta "Backups" en tu PC
  ├─ O copia a Google Drive / OneDrive
  └─ O copia a un USB/disco externo
```

### Confirmación ✓
```
Verás un alert que dice:
✓ Datos exportados correctamente
```

---

## 📤 IMPORTAR TUS DATOS

### Paso 1: Abre los Ajustes
```
Pantalla principal
        ↓
Busca el botón ⚙️ en la esquina superior derecha
        ↓
Haz clic en ⚙️
```

### Paso 2: Desplázate a la Sección de Respaldo
```
Modal de Ajustes
        ↓
Busca "💾 Respalda tus Datos"
        ↓
Desplázate ahí
```

### Paso 3: Haz Clic en "📤 IMPORTAR"
```
Botón "📤 IMPORTAR" (botón azul a la derecha)
        ↓
Haz clic
        ↓
Se abrirá el Explorador de Archivos / File Picker
```

### Paso 4: Selecciona tu Archivo
```
Explorador de Archivos
        ↓
Navega a donde guardaste tu archivo JSON
        ↓
Busca: cartera-financiera-YYYY-MM-DD.json
        ↓
Haz clic para seleccionar
        ↓
Haz clic en "Abrir" o "Seleccionar"
```

**Archivos válidos:**
```
✅ cartera-financiera-2026-01-29.json
✅ cartera-financiera-2026-01-15.json
✅ Mi-Backup-2026.json
✅ (cualquier archivo .json de exportación)
```

### Paso 5: Espera a la Importación
```
Sistema procesando...
        ↓
Validando estructura del archivo...
        ↓
Restaurando datos...
        ↓
Actualizando configuración...
```

**Visual en pantalla:**
```
┌──────────────────────────────────────┐
│ ⚙️ Ajustes                        ✕  │
├──────────────────────────────────────┤
│                                      │
│ 💾 Respalda tus Datos                │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ ✓ Datos importados             │  │
│ │   correctamente.               │  │
│ │   Recargando...                │  │
│ └────────────────────────────────┘  │
│                                      │
│ ┌──────────────┬──────────────┐     │
│ │ 📥 EXPORTAR  │ 📤 IMPORTAR  │     │
│ └──────────────┴──────────────┘     │
│                                      │
└──────────────────────────────────────┘
```

### Paso 6: Automático - Recarga de Página
```
Después de 1.5 segundos...
        ↓
La página se recargará automáticamente
        ↓
LISTO: Todos tus datos están restaurados
```

**Verás:**
```
✓ Dashboard con tus datos originales
✓ Todas tus inversiones
✓ Todas tus propiedades
✓ Todos tus presupuestos
✓ Todas tus transacciones
```

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### Problema 1: "Error: Formato de archivo inválido"

**Causa:** El archivo no es válido

**Soluciones:**
```
1. Verifica que sea un archivo .json
   ├─ Debe terminar en .json
   └─ No .txt, .pdf, etc.

2. Verifica que sea un archivo exportado de esta app
   ├─ Abre con editor de texto
   ├─ Debe contener: "version", "exportDate", "data", "settings"
   └─ Si no tiene esto, no es válido

3. Intenta exportar nuevamente
   ├─ Quizás el archivo anterior está corrupto
   └─ Haz una nueva exportación y guárdala bien

4. Usa otro navegador
   ├─ A veces hay conflictos
   └─ Intenta con Chrome, Firefox, etc.
```

### Problema 2: "Error al leer el archivo"

**Causa:** El sistema no puede leer el archivo

**Soluciones:**
```
1. Verifica permisos del archivo
   ├─ Click derecho → Propiedades
   ├─ Asegúrate que NO esté marcado "Solo lectura"
   └─ Si está bloqueado, desbloquea

2. Copia el archivo nuevamente
   ├─ El archivo podría estar corrupto
   ├─ Descárgalo nuevamente de tu backup
   └─ Intenta importar la copia

3. Libera espacio en disco
   ├─ A veces por espacio limitado falla
   └─ Borra archivos innecesarios y reintenta

4. Reinicia el navegador
   ├─ Cierra la app
   ├─ Cierra el navegador completamente
   ├─ Reabre el navegador
   └─ Vuelve a intentar
```

### Problema 3: Los datos no cambiaron después de importar

**Causa:** La página no se recargó

**Solución:**
```
1. Espera 2-3 segundos
   └─ La recarga es automática

2. Si no recarga, recarga manualmente
   ├─ Presiona F5
   ├─ O Ctrl+R (Windows)
   ├─ O Cmd+R (Mac)
   └─ O Shift+F5 (recarga completa)

3. Verifica que los datos se importaron
   ├─ Busca tus inversiones
   ├─ Busca tus propiedades
   ├─ Si existen, ¡funcionó!
   └─ Si no, intenta nuevamente
```

### Problema 4: El archivo fue descargado pero no lo encuentro

**Ubicación típica:**
```
Windows:
  C:\Users\[TuUsuario]\Downloads\cartera-financiera-YYYY-MM-DD.json

Mac:
  ~/Downloads/cartera-financiera-YYYY-MM-DD.json

Linux:
  ~/Downloads/cartera-financiera-YYYY-MM-DD.json
```

**Qué hacer:**
```
1. Abre tu carpeta de Descargas
   ├─ Windows: Ctrl+Mayús+D
   ├─ Mac: Cmd+Mayús+D
   └─ Linux: Abre archivos → Descargas

2. Busca el archivo
   ├─ Nombre: "cartera-financiera-..."
   ├─ Tipo: JSON
   └─ Tamaño: 50-150 KB típicamente

3. Guárdalo donde quieras
   ├─ Copia a carpeta de Backups
   ├─ O a Google Drive
   └─ O a USB
```

---

## 🎓 CONSEJOS DE EXPERTO

### Convención de Nombres para Backups

```
✅ BUENO:
├─ cartera-financiera-2026-01-01.json (por mes)
├─ cartera-backup-semanal-2026-W04.json (semanal)
├─ cartera-financiera-2026-completo.json
└─ cartera-finanzas-2026-antes-viaje.json

❌ MALO:
├─ datos.json (muy genérico)
├─ backup.json (sin fecha)
├─ asda.json (sin sentido)
└─ copia de (1).json (nombreauto)
```

### Estructura de Carpetas para Backups

```
📁 Mi PC
└─ 📁 Documentos
   ├─ 📁 Finanzas
   │  ├─ 📁 Backups
   │  │  ├─ cartera-financiera-2025-12-01.json
   │  │  ├─ cartera-financiera-2026-01-01.json
   │  │  ├─ cartera-financiera-2026-01-15.json (semanal)
   │  │  └─ cartera-financiera-2026-01-29.json (actual)
   │  │
   │  └─ LEER_PRIMERO.txt (recordatorio)
   │
   ├─ Notas sobre inversiones.txt
   └─ Planificación financiera.xlsx
```

### Frecuencia de Backups

```
Recomendado:

⏰ DIARIO:
   └─ Si haces cambios todos los días
   
⏰ SEMANAL (RECOMENDADO):
   └─ Cada sábado o domingo
   
⏰ MENSUAL:
   └─ 1º de cada mes
   
⏰ ESPECIAL:
   ├─ Antes de cambiar dispositivo
   ├─ Antes de actualizar navegador
   └─ Antes de hacer cambios importantes
```

### Dónde Guardar los Backups

```
1️⃣ LOCAL (rápido, accesible):
   ├─ Carpeta en tu PC
   ├─ USB/disco externo
   └─ Tarjeta de memoria

2️⃣ NUBE (seguro, remoto):
   ├─ Google Drive
   ├─ OneDrive
   ├─ Dropbox
   └─ iCloud

3️⃣ EMAIL:
   ├─ Envíate el archivo por email
   └─ Así está en múltiples servidores

4️⃣ ÓPTIMO (RECOMENDADO):
   ├─ Local + Nube
   └─ Así tienes acceso rápido y está protegido
```

---

## ✅ CHECKLIST PARA PRINCIPIANTES

### Primera Exportación
```
☐ Paso 1: Abre ajustes (⚙️)
☐ Paso 2: Desplázate a "Respalda tus Datos"
☐ Paso 3: Haz clic en "📥 EXPORTAR"
☐ Paso 4: Busca el archivo en Descargas
☐ Paso 5: Guárdalo en una carpeta "Backups"
☐ Paso 6: Anota en tu calendario: "Próximo backup"
```

### Primera Importación (Prueba)
```
☐ Paso 1: Asegúrate de tener un archivo exportado
☐ Paso 2: Nota cuántos datos tienes (ej: 5 inversiones)
☐ Paso 3: Haz un cambio pequeño (ej: agrega una transacción)
☐ Paso 4: Abre ajustes (⚙️)
☐ Paso 5: Haz clic en "📤 IMPORTAR"
☐ Paso 6: Selecciona tu archivo de backup
☐ Paso 7: Espera a que se cargue
☐ Paso 8: Verifica que VUELVAN los datos originales (sin tu cambio)
☐ Paso 9: ✅ ¡Funciona perfecto!
```

---

## 🔐 SEGURIDAD

### NO hagas esto:
```
❌ No compartas tus archivos de backup por email sin cifrar
❌ No dejes backups en la carpeta de Descargas público
❌ No borres todos tus backups (guarda varios)
❌ No guardes solo en la nube (qué si se hackea)
❌ No guardes solo local (qué si se daña tu PC)
```

### Hazlo así:
```
✅ Guarda backups en múltiples lugares
✅ Mantén versiones antiguas (últimos 3 meses)
✅ Prueba regularmente que la importación funcione
✅ Considera usar carpeta encriptada para backups
✅ Anota en tu calendario: "Verificar backup"
```

---

## 📞 AYUDA RÁPIDA

**¿Dónde está el botón de Exportar?**
→ Ajustes (⚙️) → Respalda tus Datos → 📥 EXPORTAR

**¿Dónde está el botón de Importar?**
→ Ajustes (⚙️) → Respalda tus Datos → 📤 IMPORTAR

**¿Qué datos se exportan?**
→ TODO: inversiones, propiedades, presupuestos, transacciones, configuración

**¿Es seguro?**
→ Sí, los archivos están en tu computadora, no en internet

**¿Se pueden editar los archivos?**
→ Sí, con cuidado. Son JSON, puedes usar editor de texto

**¿Puedo importar en otro dispositivo?**
→ Sí, siempre que tengas el archivo

**¿Cuánto espacio ocupan?**
→ Típicamente 50-150 KB (muy pequeño)

---

**Documento actualizado:** 29 de enero de 2026
**Versión:** 1.0
**Nivel:** Principiante a Intermedio
