# 📥 Guía de Importación y Exportación de Datos

## Descripción General

La funcionalidad de importación y exportación permite hacer respaldo de todos tus datos financieros (inversiones, propiedades, presupuestos, transacciones y configuración) en un archivo JSON que puedes descargar y guardar de forma segura.

## Características

✅ **Exportar todos los datos** a un archivo JSON
✅ **Importar datos** desde un archivo JSON previamente exportado
✅ **Preservar configuración** (divisa seleccionada)
✅ **Backup automático** con fecha en el nombre del archivo
✅ **Validación** de archivos importados

## Cómo Usar

### Exportar Datos

1. Haz clic en el botón de **⚙️ Ajustes** (esquina superior derecha)
2. Desplázate hasta la sección **💾 Respalda tus Datos**
3. Haz clic en el botón **📥 Exportar**
4. Se descargará un archivo JSON con el nombre: `cartera-financiera-YYYY-MM-DD.json`
5. Guarda este archivo en un lugar seguro

### Importar Datos

1. Haz clic en el botón de **⚙️ Ajustes** (esquina superior derecha)
2. Desplázate hasta la sección **💾 Respalda tus Datos**
3. Haz clic en el botón **📤 Importar**
4. Selecciona un archivo JSON previamente exportado
5. El sistema validará el archivo y lo importará automáticamente
6. La página se recargará con todos los datos restaurados

## Estructura del Archivo Exportado

El archivo JSON exportado tiene la siguiente estructura:

```json
{
  "version": "1.0",
  "exportDate": "2026-01-29T15:30:45.123Z",
  "data": {
    "transactions": [...],
    "investments": [...],
    "properties": [...],
    "budgets": [...]
  },
  "settings": {
    "currency": "USD",
    "currencySymbol": "$"
  }
}
```

### Contenido de Cada Sección

- **transactions**: Todas tus transacciones de ingresos y gastos
- **investments**: Todas tus inversiones (acciones, ETFs, fondos, criptomonedas, bonos)
- **properties**: Todas tus propiedades inmobiliarias
- **budgets**: Todos tus presupuestos por categoría y mes
- **settings**: Tu configuración de divisa

## Casos de Uso

### Scenario 1: Cambio de Dispositivo
1. En tu dispositivo antiguo, exporta todos los datos
2. Abre la app en tu nuevo dispositivo
3. Importa el archivo exportado
4. ¡Todos tus datos estarán disponibles!

### Scenario 2: Respaldo de Seguridad
1. Exporta tus datos regularmente (ej: mensualmente)
2. Guarda los archivos JSON en una carpeta segura
3. Si algo saliera mal, siempre tendrás un backup

### Scenario 3: Compartir Cartera (Parcial)
1. Exporta tus datos
2. Comparte el archivo con alguien de confianza
3. Ellos pueden importarlo en su propia instancia de la app

## Advertencias Importantes

⚠️ **Al importar datos**, se REEMPLAZARÁN todos los datos actuales
⚠️ No hay deshacer después de importar (asegúrate de tener un backup primero)
⚠️ Solo se aceptan archivos JSON válidos exportados por esta app
⚠️ Guarda tus archivos de exportación en un lugar seguro (los datos son sensibles)

## Solución de Problemas

### "Error: Formato de archivo inválido"
- Asegúrate de haber seleccionado un archivo `.json` válido
- El archivo debe haber sido exportado desde esta app
- Intenta exportar nuevamente

### "Error al leer el archivo"
- Verifica que el archivo no esté corrupto
- Intenta con otro navegador
- Asegúrate de tener permisos de lectura del archivo

### Los datos no se actualizaron después de importar
- La página debería recargarse automáticamente
- Si no lo hace, recarga manualmente la página (F5 o Ctrl+R)

## Seguridad

- Los datos se exportan en texto plano (JSON)
- Guarda tus archivos de exportación en un lugar seguro
- No compartas tus archivos de exportación con personas no confiables
- Considera usar cifrado adicional para archivos sensibles

## Tips y Trucos

💡 Exporta regularmente para tener backups actualizados
💡 Usa un nombre descriptivo si renombras los archivos (ej: `cartera-2026-01-backup.json`)
💡 Puedes abrir los archivos JSON con cualquier editor de texto para revisar datos
💡 Mantén varios backups en diferentes ubicaciones
