# Vertiv Mexicali — Demo de Control de Activos y Devoluciones

Sistema web ligero e independiente para la gestión y seguimiento de equipos prestados a colaboradores (laptops, cargadores, radios, herramientas, multímetros y materiales) con lectura de código de barras / QR y firmas digitales.

---

## 📁 Archivos del Demo en `c:\Users\sopor\Documents\githubdesarrollo\DEMO\`

* **`index.html` (1. Entrega / Asignación):**
  - Registro del colaborador (N° de nómina, nombre, departamento).
  - Escáner de código de barras por cámara o entrada rápida con pistola lectora USB.
  - Firma digital táctil de aceptación.
  - Generación de responsiva con folio correlativo (`RESP-2026-XXX`).

* **`devolucion.html` (2. Devolución / Finiquito):**
  - Búsqueda del empleado que sale o entrega material.
  - Lista de cotejo de los activos que tiene pendientes de devolver.
  - Escáner de código de barras: conforme se "pistolea" cada equipo físico, el sistema lo identifica y lo marca en verde como **DEVUELTO**. Si se escanea algo ajeno, alerta de discrepancia.
  - Registro de observaciones/daños/faltantes.
  - Firma de finiquito e impresión del acta / pase de salida.

* **`db.js`:**
  - Persistencia en `localStorage` (sin necesidad de backend ni base de datos para pruebas inmediatas).
  - Incluye datos demo precargados (por ejemplo, el empleado `V-1042: Carlos Mendoza Ruiz` con 4 activos asignados).

* **`styles.css`:**
  - Diseño responsivo moderno con la identidad visual corporativa de Vertiv.

---

## 🚀 ¿Cómo probarlo?

1. Abre el explorador de archivos en tu computadora y entra a:
   `c:\Users\sopor\Documents\githubdesarrollo\DEMO\`
2. Haz doble clic en **`index.html`** o **`devolucion.html`** para abrirlo en cualquier navegador (Chrome, Edge, etc.).
3. **Para probar la devolución de inmediato:**
   - Abre `devolucion.html`.
   - Selecciona al colaborador precargado: `V-1042 — Carlos Mendoza Ruiz`.
   - Verás sus 4 equipos asignados (Laptop Dell, Cargador 65W, Radio Motorola, Multímetro Fluke).
   - Puedes escanear con la cámara o escribir `VERTIV-LAP-042` en el campo y pulsar Enter: ¡se marcará automáticamente como devuelto con sonido de confirmación!

