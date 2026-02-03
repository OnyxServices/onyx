# Propuesta de arquitectura con ES6 modules – FastCuba / Onyx

> **Estado:** Refactor aplicado. La app usa `js/main.js` (index.html) y `js/panelMain.js` (panel.html) como únicos entry points con `type="module"`. Los archivos `js/index.js`, `js/panel.js`, `js/supabase.js` y `data/data.js` ya no se cargan; pueden eliminarse o conservarse como respaldo.

## 1. Análisis del estado actual (monolítico)

### Problemas detectados

| Problema | Dónde | Impacto |
|----------|--------|---------|
| **Una sola responsabilidad por archivo** | `index.js` (~716 líneas) mezcla: configuración Toast, estado global, loader, init, listeners, custom select, calculadora, modales, formulario, tracking, envío a Supabase | Difícil de mantener y testear |
| **Estado global disperso** | `tasaCambio`, `cuentaZelle`, `regionesCuba`, `customSelectsInitialized` en `index.js`; `segundosParaRefresco`, `configId`, `paginaActual` en `panel.js` | Acoplamiento y efectos secundarios |
| **Sin módulos ES6** | Todo en `<script>` clásico; dependencia implícita del orden de carga (`supabase.js` → `data.js` → `index.js`) | Namespace global contaminado (`window.*`) |
| **Lógica de negocio + UI + API juntas** | En `procesarEnvioFinal()`: validar archivo, subir a Storage, leer inputs, insertar en DB, mostrar Swal, cerrar modal, resetear form | Imposible reutilizar o testear la lógica sin DOM |
| **Duplicación** | Toast (Swal.mixin) en `index.js` y `panel.js`; patrones de modal y llamadas a Supabase repetidos | Inconsistencias y más código del necesario |
| **Acoplamiento fuerte al DOM** | Decenas de `document.getElementById(...)` con IDs fijos; si cambia el HTML, se rompe el JS | Refactors costosos |
| **Datos en global** | `window.CUBA_REGIONS` en `data/data.js`; `supabaseClient` en `supabase.js` | No hay un solo punto de verdad para “datos” y “cliente” |

### Resumen por archivo

- **`js/index.js`**: Punto de entrada público + loader + init + calculadora + selects + modales + formulario + tracking + submit. Todo en un solo archivo.
- **`js/panel.js`**: Panel admin: config, transacciones, comisiones, métricas, conciliación, logs, real-time, export, paginación, dark mode. También monolítico.
- **`js/supabase.js`**: Cliente Supabase + `ejecutarOperacion` + `borrarTodoTransacciones`. Mezcla “infra” con “casos de uso” (borrado masivo).
- **`data/data.js`**: Solo datos estáticos; pero expuestos en `window` en lugar de exportarse.

---

## 2. Arquitectura propuesta: capas y responsabilidades

Objetivo: **separar claramente**:

1. **Configuración y constantes**
2. **Acceso a datos (API)**
3. **Estado de la aplicación (store)**
4. **Lógica de negocio (services)**
5. **UI y componentes (ui / components)**
6. **Puntos de entrada (entry points)**

Todo usando **módulos ES6** (`import`/`export`) y un único script de entrada por página (`type="module"`).

### Estructura de carpetas y archivos

```
fastcuba-main/
├── index.html
├── panel.html
├── css/
│   ├── styles.css
│   └── panel.css
├── data/
│   └── regions.js          # export CUBA_REGIONS (antes data.js)
├── js/
│   ├── main.js             # Entry point app pública (index.html)
│   ├── panelMain.js        # Entry point panel admin (panel.html)
│   │
│   ├── config/
│   │   └── constants.js    # SUPABASE_URL, SUPABASE_ANON_KEY, etc.
│   │
│   ├── api/
│   │   ├── client.js       # Crear y exportar cliente Supabase (sin globals)
│   │   ├── configApi.js    # getConfig()
│   │   ├── transaccionesApi.js  # getByWhatsApp, create, updateState, list, etc.
│   │   └── storageApi.js   # uploadComprobante(file), getPublicUrl(path)
│   │
│   ├── store/
│   │   └── appStore.js     # Estado global: tasaCambio, cuentaZelle, regiones
│   │
│   ├── services/
│   │   ├── configService.js    # Cargar config desde API y actualizar store (y opcionalmente DOM)
│   │   ├── transactionService.js  # submitTransaction(formData), searchTransactions(whatsapp)
│   │   └── initService.js      # Orquestar carga inicial (config + regiones)
│   │
│   ├── ui/
│   │   ├── toast.js        # Crear y exportar Toast (Swal.mixin)
│   │   ├── loader.js       # actualizarLoader, rotarTips, quitarLoader
│   │   ├── modalTransfer.js   # abrirModal, cerrarModal, nextStep
│   │   ├── modalTracking.js   # abrir, cerrar, renderResults
│   │   ├── customSelect.js    # createCustomSelect, resetCustomSelects
│   │   └── calculator.js     # actualizarCalculosHome (usa store para tasa)
│   │
│   └── components/         # Opcional: agrupar por “feature”
│       ├── transferForm.js    # resetForm, validación de pasos, bind de eventos del form
│       └── locationSelectors.js  # setupLocationSelectors(regiones, provinciaEl, municipioEl)
│
├── js/panel/               # Código específico del panel (opcional agrupar aquí)
│   ├── modals.js           # abrirModal(id), cerrarModal(id)
│   ├── metrics.js          # cargarMetricas, render
│   ├── comisiones.js       # cargarComisiones, guardar, eliminar, agregar
│   ├── conciliacion.js     # cargarConciliacion, guardarConciliacion
│   ├── logs.js             # cargarLogs
│   ├── transaccionesTable.js  # cargarTransaccionesPaginadas, cambiarEstado, filtros
│   ├── realtime.js         # suscripción + notificarNuevaTransaccion + sonido
│   └── theme.js            # toggleDarkMode, leer guardado
│
└── sound/
    └── notification.wav
```

---

## 3. Responsabilidades por capa

### 3.1 `config/constants.js`

- **Responsabilidad**: Constantes de la app (URL y clave de Supabase, nombres de tablas/buckets si quieres).
- **Exporta**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.
- **No hace**: Llamadas a red ni DOM.

### 3.2 `api/` (capa de datos)

- **client.js**: Crea el cliente Supabase a partir de las constantes y lo exporta. Nada en `window`.
- **configApi.js**: `getConfig()` → llama a `config` y devuelve `{ exchange_rate, zelle_cuenta, ... }`.
- **transaccionesApi.js**:  
  - `getByWhatsApp(whatsapp)`  
  - `create(transaccion)`  
  - `updateState(id, state)`  
  - `list({ search, state, from, to, page, pageSize })` (para panel).
- **storageApi.js**: `uploadComprobante(file)` → sube al bucket y devuelve la URL pública (o lanza).

Solo importan el cliente y constantes; no conocen el DOM ni Swal.

### 3.3 `store/appStore.js`

- **Responsabilidad**: Estado global de la app pública: `tasaCambio`, `cuentaZelle`, `regionesCuba`.
- Puede ser un objeto con getters/setters o un objeto plano que los módulos importan y modifican.
- La calculadora y el init leen/escriben aquí; la API no.

### 3.4 `services/` (lógica de negocio)

- **configService.js**: Llama a `configApi.getConfig()`, actualiza `appStore` y, si se desea, actualiza elementos del DOM (zelle-account, home-value-rate). Orquesta “cargar config y reflejarla”.
- **transactionService.js**:  
  - `submitTransaction(formData, comprobanteFile)`: validar monto mínimo, subir comprobante (`storageApi`), construir objeto transacción, `transaccionesApi.create()`. Devuelve éxito/error (no muestra Swal; eso lo hace la UI).  
  - `searchTransactions(whatsapp)`: llama a la API y devuelve datos.
- **initService.js**: Secuencia de arranque: actualizarLoader, configService, actualizar calculadora inicial, quitarLoader. Solo orquestación.

Servicios usan `api/` y `store/`; no conocen IDs del DOM ni modales concretos (solo datos).

### 3.5 `ui/` (componentes y efectos en DOM)

- **toast.js**: Crea el mixin de Swal y lo exporta para que cualquier módulo muestre notificaciones consistentes.
- **loader.js**: actualizarLoader(progreso, mensaje), rotarTips(), quitarLoader(). Conocen los IDs del loader.
- **modalTransfer.js**: abrirModal(), cerrarModal(), nextStep(step). Gestionan visibilidad y pasos; la validación de campos puede delegarse a un “component” o quedarse aquí.
- **modalTracking.js**: abrir/cerrar y pintar resultados en el contenedor (recibe datos ya resueltos; no llama a la API directamente).
- **customSelect.js**: createCustomSelect(rootEl, options), resetCustomSelects(). Reutilizable.
- **calculator.js**: actualizarCalculosHome(montoUsd). Lee `tasaCambio` del store y escribe en los inputs de la calculadora.

La UI importa `store` y, si hace falta, `toast` o `services` (por ejemplo, el botón “Finalizar” en la UI llama a `transactionService.submitTransaction` y luego, según resultado, muestra Toast y cierra el modal).

### 3.6 `components/` (opcional)

- **transferForm.js**: Reset del form, volver al paso 0, limpiar file input; puede enlazar eventos (input monto, etc.) y llamar a calculator y modal.
- **locationSelectors.js**: setupLocationSelectors(): recibe regiones (del store) y los nodos de provincia/municipio; crea los custom selects y sincroniza con los hidden inputs.

Así el “flujo del formulario de envío” queda en un solo lugar.

### 3.7 Entry points

- **main.js** (para `index.html`):  
  - Importa initService, loader, modalTransfer, modalTracking, calculator, transferForm, locationSelectors, appStore, regions.  
  - En `DOMContentLoaded`: initService.iniciar(), setupListeners (calculator + locationSelectors), y asigna a `window` solo las funciones que el HTML llama con `onclick` (abrirModal, cerrarModal, nextStep, copiarZelle, procesarEnvioFinal, abrirModalTracking, cerrarModalTracking, buscarTransaccion), para no romper el HTML actual.  
  - Ideal a medio plazo: sustituir `onclick="..."` por `addEventListener` en main.js y no exponer nada en `window`.

- **panelMain.js** (para `panel.html`):  
  - Importa client, configApi, transaccionesApi, toast, modals, metrics, comisiones, conciliacion, logs, transaccionesTable, realtime, theme.  
  - En `DOMContentLoaded`: cargarTasa(), refreshAll(), realtime.subscribe(), theme.applySaved().  
  - Las funciones que el HTML llama con `onclick` se pueden seguir exponiendo en `window` desde panelMain hasta que migres a event listeners.

### 3.8 Panel admin (js/panel/)

Cada módulo tiene una responsabilidad clara:

- **modals.js**: abrir/cerrar por id.
- **metrics.js**: cargar datos (usando api o servicios) y rellenar los elementos del resumen.
- **comisiones.js**, **conciliacion.js**, **logs.js**: cargar y guardar; render de tablas.
- **transaccionesTable.js**: filtros, paginación, llamada a `transaccionesApi.list`, render de la tabla y botones (ver recibo, aprobar, rechazar).
- **realtime.js**: canal Supabase + notificarNuevaTransaccion (sonido + Toast) + callback para refrescar (refreshAll).
- **theme.js**: toggle y persistencia en localStorage.

El “refreshAll” del panel puede vivir en panelMain y llamar a cargarTransacciones, cargarMetricas, etc., que a su vez usan la API.

---

## 4. Uso de ES6 modules en el HTML

- Un solo script por página, con `type="module"`.
- El módulo puede seguir asignando a `window` las funciones que todavía uses en `onclick` para una migración gradual.

**index.html:**

```html
<script type="module" src="./js/main.js"></script>
```

**panel.html:**

```html
<script type="module" src="./js/panelMain.js"></script>
```

- Eliminaría los `<script>` de `supabase.js` y `data.js`; en su lugar, `main.js` (o los módulos que correspondan) importan desde `api/client.js` y `data/regions.js`.
- Las librerías (Supabase, SweetAlert2) pueden seguir cargándose con `<script>` normal antes del módulo; el módulo usa `window.supabase` y `window.Swal` hasta que quieras empaquetar con un bundler.

---

## 5. Ejemplo de flujo refactorizado (envío de transacción)

1. Usuario pulsa “Finalizar envío”.
2. **modalTransfer.js** (o **transferForm.js**) recoge los datos del form y el archivo.
3. Llama a **transactionService.submitTransaction(formData, file)**.
4. **transactionService**:  
   - Valida monto mínimo.  
   - Llama a **storageApi.uploadComprobante(file)**.  
   - Construye el objeto y llama a **transaccionesApi.create(...)**.  
   - Devuelve `{ success }` o `{ error: message }`.
5. La UI (modalTransfer/transferForm):  
   - Si success: Toast éxito, cerrarModal(), resetForm(), actualizarCalculosHome(0).  
   - Si error: Toast error, desbloquear botón.

Así la “regla de negocio” (mínimo 50 USD, subir comprobante, guardar transacción) está en el service y en la API; la UI solo orquesta y muestra mensajes.

---

## 6. Ventajas de esta arquitectura

- **Responsabilidades claras**: API solo datos; store solo estado; services solo lógica; ui solo DOM y usuario.
- **Testeable**: Puedes testear `transaccionesApi.create`, `transactionService.submitTransaction` o `actualizarCalculosHome` con mocks, sin abrir el navegador.
- **Reutilización**: El mismo `configApi` o `transaccionesApi` sirve para la app pública y para el panel.
- **Menos globals**: Solo el entry point puede exponer en `window` lo imprescindible durante la migración.
- **Escalable**: Añadir una nueva pantalla o flujo es añadir un service + ui y enlazarlos en el entry point.

---

## 7. Orden sugerido de refactor

1. Crear `config/constants.js` y `api/client.js`; dejar de usar el script global de supabase en el HTML y usar solo el cliente vía import.
2. Crear `data/regions.js` que exporte `CUBA_REGIONS`; dejar de cargar `data/data.js` en el HTML.
3. Crear `store/appStore.js` y migrar tasaCambio, cuentaZelle, regionesCuba ahí.
4. Extraer **api**: configApi, transaccionesApi, storageApi.
5. Extraer **ui**: toast, loader, modalTransfer, modalTracking, customSelect, calculator.
6. Extraer **services**: configService, transactionService, initService.
7. Crear **main.js** como único entry de index.html, con `type="module"`, y que importe todo y asigne a `window` las funciones que sigan en los onclick.
8. Refactorizar **panel.js** en módulos (api compartida, panel/modals, metrics, comisiones, etc.) y **panelMain.js** como entry del panel.
9. Opcional: sustituir `onclick` por listeners en JS y eliminar asignaciones a `window`.

Si quieres, el siguiente paso puede ser implementar juntos uno de los módulos (por ejemplo `api/transaccionesApi.js` + `services/transactionService.js` y su uso desde `main.js`) para que el resto del refactor siga el mismo patrón.
