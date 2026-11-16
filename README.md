# 📑 Persianas Beltran HMO - Sistema de Cotizaciones

Sistema profesional de presupuestos y cotizaciones a la medida para **Persianas Beltran HMO**, con cálculo automático por **metros cuadrados (m²: ancho × largo)** y **metros lineales (m)**. Diseñado con una paleta elegante en **azul, blanco y negro**.

---

## 🚀 ¿Cómo abrir y usar la aplicación?

1. Ve a la carpeta `Sistema-Cotizaciones` en tu Escritorio.
2. Haz doble clic en el archivo **`Iniciar-Cotizador.bat`** (o abre directamente el archivo [`index.html`](file:///c:/Users/marco/OneDrive/Escritorio/Sistema-Cotizaciones/index.html) en tu navegador preferido: Chrome, Edge, Brave, etc.).
3. ¡Listo! No requiere instalar Node.js, Python ni servidores externos. Funciona de inmediato y almacena tus datos de forma segura en tu equipo local.

---

## 🌟 Características Principales

### 1. Control de Catálogo de Productos y Precios por Metro
- **Metro Lineal (m)**: Ideal para perfiles de aluminio, tuberías, molduras, pasamanos, cableados, etc. Tú defines el precio por metro.
- **Metro Cuadrado (m²)**: Ideal para vidrios templados, canceles, azulejos, láminas, lonas, películas solares, pintura, pisos, etc. Tú defines el precio por m².
- **Pieza fija**: Para accesorios, herrajes o servicios complementarios con precio unitario.
- Permite agregar, editar, buscar y eliminar productos en cualquier momento.

### 2. Petición Dinámica de Medidas
Al agregar una partida a una cotización:
- Si el producto es por **m²**: La aplicación te pide obligatoriamente el **Largo**, el **Ancho / Alto** y el **Número de piezas**.
  - Calcula automáticamente: $\text{Área por pieza} = \text{Largo} \times \text{Ancho}$
  - $\text{Área total} = \text{Área por pieza} \times \text{Piezas}$
  - $\text{Importe} = \text{Área total} \times \text{Precio por m²}$
- Si el producto es por **metro lineal (m)**: Pide la **Longitud por tramo** y el **Número de tramos**.
  - Calcula automáticamente: $\text{Metros totales} = \text{Longitud} \times \text{Piezas}$
  - $\text{Importe} = \text{Metros totales} \times \text{Precio por metro}$
- Soporte para ingresar medidas tanto en **metros (m)** como en **centímetros (cm)** (conversión automática).

### 3. Gestión y Selección de Responsables
- Botón destacado **"+ Agregar responsable"**: Permite dar de alta a un responsable solicitando únicamente su **nombre**.
- **Menú desplegable en la cotización**: Al registrar el nombre del responsable, se guarda automáticamente en el sistema y queda seleccionado de inmediato en el menú desplegable.
- Pestaña **"Responsables"**: Permite consultar la lista, editarlos, eliminarlos o seleccionarlos para una nueva cotización.

### 4. Datos del Solicitante / Cliente
- Campos para el **Nombre de quien solicitó la cotización**, teléfono/WhatsApp, correo electrónico y dirección/obra de entrega.

### 5. Hoja Membretada, Vista Previa e Impresión en PDF
- Genera una cotización formal lista para entregar a tu cliente.
- Desglose con tabla clara que especifica las medidas de cada pieza cotizada.
- Resumen con Subtotal, Descuentos opcionales, IVA configurable (16%, 8% o sin IVA) y Total en número y letras.
- Espacios formales para firma del responsable y aceptación del cliente.
- Botón **"Imprimir / Guardar PDF"** que utiliza la función nativa de tu navegador con diseño optimizado para tamaño carta/A4 sin elementos innecesarios en pantalla.

### 6. Historial de Cotizaciones
- Guarda todas las cotizaciones emitidas.
- Filtro de búsqueda por cliente o folio.
- Cambio de estatus: **Pendiente**, **Aprobada**, **Facturada** o **Rechazada**.
- Opción para reimprimir o duplicar una cotización previa con un solo clic.

### 7. Configuración de Empresa y Respaldo de Datos
- Personaliza el nombre de tu empresa, datos fiscales, teléfono, dirección y condiciones comerciales estándar.
- Opción para descargar un respaldo completo en formato JSON y restaurarlo en cualquier momento.
