# Onyx Transfer

**Plataforma moderna de remesas a Cuba**

Onyx Transfer es una aplicación web que facilita y agiliza el envío de dinero hacia Cuba mediante diferentes métodos de transferencia. Proporciona una interfaz intuitiva para usuarios finales y un panel administrativo completo para gestionar transacciones, configuración y métricas.

## 📋 Características Principales

### Para Usuarios

- 💰 **Cálculo en tiempo real** de conversión de moneda (USD a CUP)
- 📍 **Selector de ubicación** visual con mapa interactivo (Leaflet)
- 🚀 **Transferencia rápida y segura** mediante Zelle y otros métodos
- 📱 **Responsivo** y optimizado para dispositivos móviles
- 🔍 **Seguimiento de transacciones** en tiempo real
- 🌍 **Soporte para múltiples provincias** de Cuba

### Panel Administrativo

- 📊 **Gráficos y estadísticas** de transacciones
- 📈 **Métricas en tiempo real** de uso de la plataforma
- ⚙️ **Configuración centralizada** del sistema
- 💾 **Gestión de transacciones** completa
- 👥 **Auditoría y logs** de operaciones
- 🔐 **Control de acceso** seguro

## 🛠️ Tecnologías Utilizadas

### Frontend

- **HTML5** - Estructura semántica
- **CSS3** - Estilos profesionales y responsivos
- **JavaScript (ES6+)** - Módulos y programación moderna
- **Leaflet** - Mapas interactivos
- **SweetAlert2** - Modales y notificaciones elegantes

### Backend

- **Supabase** - BDD PostgreSQL y autenticación
- **API REST** - Endpoints documentados

### Herramientas

- **Google Analytics** - Seguimiento de eventos
- **Git** - Control de versiones

## 📁 Estructura del Proyecto

```
onyx-main/
├── index.html              # Página principal de usuarios
├── panel.html              # Panel administrativo
├── css/
│   ├── styles.css         # Estilos principales
│   └── panel.css          # Estilos del panel
├── data/
│   ├── constants.js       # Constantes (URLs, claves API)
│   ├── regions.js         # Datos de provincias de Cuba
│   └── sound/             # Efectos de sonido
├── js/
│   ├── main.js            # Punto de entrada principal
│   ├── panelMain.js       # Punto de entrada panel admin
│   ├── api/               # Clientes y servicios API
│   │   ├── supabaseClient.js
│   │   ├── configApi.js
│   │   ├── realtimeApi.js
│   │   ├── storageApi.js
│   │   └── transactionApi.js
│   ├── controllers/       # Lógica de aplicación
│   │   ├── initController.js
│   │   ├── locationController.js
│   │   ├── submitTransactionController.js
│   │   ├── trackingController.js
│   │   └── panelControllers/
│   ├── services/          # Servicios de negocio
│   │   ├── transactionService.js
│   │   ├── realtimeService.js
│   │   ├── locationService.js
│   │   └── panelServices/
│   ├── store/
│   │   └── appStore.js    # Estado global de la aplicación
│   ├── ui/                # Componentes visuales
│   │   ├── components/    # Componentes reutilizables
│   │   └── utils/         # Utilidades de UI
│   └── validators/
│       └── formValidators.js
└── README.md              # Este archivo
```

## ⚙️ Configuración e Instalación

### Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Acceso a internet
- Cuenta en Supabase configurada

### Pasos de Instalación

1. **Clonar el repositorio**

   ```bash
   git clone https://github.com/tu-usuario/onyx-main.git
   cd onyx-main
   ```

2. **Configurar variables de entorno**

   Edita `data/constants.js` e ingresa tus credenciales:

   ```javascript
   export const SUPABASE_URL = "tu_url_supabase";
   export const SUPABASE_ANON_KEY = "tu_clave_anonima";
   export const GOOGLE_ANALYTICS_ID = "G-07SFW672VY";
   ```

3. **Servir la aplicación**

   Opción A - Con Python:

   ```bash
   python -m http.server 8000
   ```

   Opción B - Con Node.js:

   ```bash
   npx http-server
   ```

   Opción C - Con Live Server en VS Code

4. **Acceder a la aplicación**
   - Usuarios: `http://localhost:8000`
   - Panel Admin: `http://localhost:8000/panel.html`

## 🚀 Cómo Usar

### Página Principal (Usuarios)

1. **Calcular envío**: Ingresa cantidad en USD
2. **Seleccionar destino**: Elige provincia en el mapa de Cuba
3. **Confirmar transacción**: Revisa los detalles
4. **Completar pago**: Sigue instrucciones de Zelle o método seleccionado
5. **Seguimiento**: Usa el código de transacción para rastrearla

### Panel Administrativo

1. **Acceder a `/panel.html`**
2. **Autenticarse** con credenciales Supabase
3. **Navegar** entre secciones:
   - **Inicio**: Resumen de métricas
   - **Transacciones**: Listado y detalles
   - **Gráficos**: Análisis visual de datos
   - **Configuración**: Ajustes del sistema

## 🔌 Arquitectura y Flujo de Datos

### Patrón de Arquitectura

La aplicación implementa una arquitectura en capas:

```
┌─────────────────────────────────────┐
│      UI Components (main.html)      │
├─────────────────────────────────────┤
│   Controllers (Orquestación)        │
├─────────────────────────────────────┤
│   Services (Lógica de Negocio)      │
├─────────────────────────────────────┤
│   API Clients (Supabase)            │
├─────────────────────────────────────┤
│   Backend (Supabase PostgreSQL)     │
└─────────────────────────────────────┘
```

### Flujo Principal de Transferencia

```
1. Usuario ingresa monto en form
   ↓
2. Calculator actualiza conversión (USD → CUP)
   ↓
3. Usuario selecciona ubicación en mapa
   ↓
4. submitTransactionController valida datos
   ↓
5. transactionService prepara payload
   ↓
6. transactionApi envía a Supabase
   ↓
7. Base de datos registra transacción
   ↓
8. Usuario recibe código de seguimiento
```

## 📊 Base de Datos (Supabase)

### Tablas Principales

#### `transactions`

```sql
- id: UUID (PK)
- user_id: UUID (FK)
- amount_usd: DECIMAL
- amount_cup_final: DECIMAL
- origin_province: TEXT
- destination_province: TEXT
- status: ENUM ('pending', 'completed', 'failed')
- payment_method: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `users`

```sql
- id: UUID (PK)
- email: TEXT
- phone: TEXT
- kyc_verified: BOOLEAN
- created_at: TIMESTAMP
```

#### `exchange_rates`

```sql
- id: UUID (PK)
- rate: DECIMAL
- source_currency: TEXT
- target_currency: TEXT
- updated_at: TIMESTAMP
```

## 🔐 Seguridad

- **Autenticación**: Supabase Auth integrado
- **Validación**: Validación de formularios en cliente y servidor
- **Variables de entorno**: Configuración sensible en `data/constants.js`
- **HTTPS**: Se recomienda usar solo en conexiones seguras
- **Row Level Security**: Implementado en Supabase

## 📝 Notas de Desarrollo

### Módulos Clave

- **appStore**: Estado global reactivo
- **executeOperation**: Patrón consistente de manejo de errores con Supabase
- **controllers**: Orquestan la lógica de la aplicación
- **services**: Contienen la lógica de negocio

### Convenciones de Código

- Nombres en camelCase para variables y funciones
- Nombres en PascalCase para clases y componentes
- JSDoc para documentar funciones públicas
- Comentarios en español/inglés según estándar del proyecto

### Debugging

Abre la consola del navegador (F12) para ver:

- Logs de inicialización
- Errores de Supabase
- Eventos de usuario
- Métricas de rendimiento

## 🐛 Solución de Problemas

### Problema: "Supabase library not loaded"

**Solución**: Asegúrate de que el script de Supabase está antes de los módulos en HTML

### Problema: Mapa no aparece

**Solución**: Verifica que Leaflet CSS y JS estén cargados correctamente en HTML

### Problema: Transacciones no se guardan

**Solución**: Valida credenciales de Supabase y permisos RLS en base de datos

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Leaflet Documentation](https://leafletjs.com/)
- [SweetAlert2 Docs](https://sweetalert2.github.io/)
- [Google Analytics 4](https://support.google.com/analytics)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📞 Soporte y Contacto

Para reportar bugs o solicitar features, crea un issue en GitHub.

---

**Developed with ❤️ for Onyx Team**

Versión: 1.4.0 | Última actualización: Marzo 2026
