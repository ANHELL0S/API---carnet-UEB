# API Carnet Digital de Estudiantes

API REST para la gestión de carnets digitales de estudiantes desarrollada con Node.js, Express y PostgreSQL siguiendo la arquitectura MVC.

## 🚀 Características

- **Arquitectura MVC**: Separación clara entre modelos, vistas y controladores
- **Autenticación JWT**: Sistema de autenticación seguro con tokens
- **Validación de datos**: Validación robusta con express-validator y Zod
- **Códigos QR**: Generación automática de códigos QR para carnets
- **Documentación API**: Documentación interactiva con Swagger
- **Seguridad**: Implementación de helmet, CORS y rate limiting
- **Base de datos**: PostgreSQL con Sequelize ORM
- **ES Modules**: Uso de módulos ES6 nativos

## 📋 Requisitos

- Node.js >= 16.0.0
- PostgreSQL >= 12
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd api-carnet-digital
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env.production .env.dev
```

Editar el archivo `.env.*` con tus configuraciones

4. **Configurar base de datos**

Los modelos se inicializan cuando se leventan el server por primera vez.

## 🚦 Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación API

La documentación interactiva de la API está disponible en:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **Swagger JSON**: `http://localhost:3000/api-docs.json`

## 🏗️ Arquitectura del Proyecto

La API utiliza una **arquitectura MVC extendida** con patrones adicionales para mayor escalabilidad:

### Patrones arquitectónicos implementados:

- **MVC (Model-View-Controller)**: Separación de responsabilidades
- **Service Layer Pattern**: Lógica de negocio compleja
- **Middleware Pattern**: Procesamiento de peticiones
- **Layered Architecture**: Separación en capas

### Estructura del proyecto:

```
src/
├── controllers/          # Controladores - Lógica de aplicación
├── models/              # Modelos - Estructuras de datos (Sequelize)
├── routes/              # Rutas - Definición de endpoints
├── middleware/          # Middleware - Procesamiento de peticiones
├── services/            # Services - Lógica de negocio compleja
├── validators/          # Validadores - Esquemas de validación
├── config/              # Configuración - Settings de la aplicación
├── common/              # Common - Utilidades compartidas
├── core/                # Core - Funcionalidades fundamentales
├── seeders/             # Seeders - Datos iniciales de BD
└── server.js            # Punto de entrada de la aplicación
```

## 🔐 Autenticación y Autorización

La API implementa un sistema de autenticación dual con JWT para usuarios y administradores.

### Middleware de autenticación:

```javascript
// Middleware para usuarios generales
import { Auth } from '../../middleware/auth-middleware.js'

// Middleware para administradores
import { AuthAdmin } from '../../middleware/authAdmin-middleware.js'
```

### Estructura de rutas protegidas:

```javascript
// Ejemplo de ruta con autenticación y rate limiting
router.post('/logout', limiterRequest({ maxRequests: 3, time: '1m' }), Auth, AuthController.logout)

// Ejemplo de ruta administrativa
router.get('/', limiterRequest({ maxRequests: 45, time: '1m' }), AuthAdmin, QrController.getAllQrCodes)
```

### Tipos de autenticación:

1. **Usuario general**: Acceso a funcionalidades básicas
2. **Administrador**: Acceso completo al sistema

### Uso del token:

Los token se setean en cookies

## 📊 Endpoints Principales

### Autenticación

```javascript
// Rutas públicas (no requieren autenticación)
POST / api / auth / login // Iniciar sesión usuario
POST / api / auth / refresh - token // Renovar token usuario

// Rutas protegidas (requieren autenticación)
POST / api / auth / logout // Cerrar sesión usuario

// Rutas administrador
POST / api / auth / admin / login // Iniciar sesión admin
POST / api / auth / admin / refresh - token // Renovar token admin
POST / api / auth / admin / logout // Cerrar sesión admin
```

### Códigos QR

```javascript
// Rutas generales
POST /api/qr/                          // Generar nuevo código QR
GET /api/qr/verify/:id                 // Verificar QR y obtener datos

// Rutas administrador
GET /api/qr/                           // Obtener todos los códigos QR
GET /api/qr/:id                        // Obtener QR por ID
```

### Características de las rutas:

- **Rate Limiting**: Limitación de peticiones por minuto
- **Middleware de autenticación**: Protección de rutas sensibles
- **Separación de roles**: Rutas específicas para usuarios y administradores
- **ES Modules**: Importación moderna con `import/export`

## 🔍 Validación

La API utiliza dos sistemas de validación:

1. **Express-validator**: Para validación de parámetros de entrada
2. **Zod**: Para validación de esquemas complejos

## 📱 Sistema de Códigos QR

### Funcionalidades principales:

- **Generación**: Creación automática de códigos QR únicos
- **Verificación**: Validación de códigos QR escaneados
- **Gestión**: Administración completa de códigos generados

### Endpoints QR:

```javascript
// Para usuarios autenticados
POST /api/qr/                    // Generar nuevo código QR
GET /api/qr/verify/:id          // Verificar QR (público)

// Para administradores
GET /api/qr/                    // Listar todos los códigos QR
GET /api/qr/:id                 // Obtener QR específico por ID
```

### Estructura de controladores:

```javascript
import { QrController } from '../controllers/qr-controller.js'

// Métodos disponibles
QrController.createQrCode // Crear código QR
QrController.verifyQR // Verificar código QR
QrController.getAllQrCodes // Obtener todos los QR (admin)
QrController.getQrById // Obtener QR por ID (admin)
```

### Datos del QR:

Los códigos QR contienen información encriptada del carnet:

- ID único del código
- Datos del estudiante
- Fecha de generación
- Información de validación

### Implementación:

```javascript
// Generar QR
import qr from 'qr-image'
const qrCode = qr.image(qrData, { type: 'png' })

// Verificación con rate limiting
router.get('/verify/:id', limiterRequest({ maxRequests: 45, time: '1m' }), QrController.verifyQR)
```

## 🛡️ Seguridad y Rate Limiting

### Rate Limiting personalizado:

La API implementa limitación de peticiones diferenciada según el endpoint:

```javascript
// Importación del middleware
import { limiterRequest } from '../../middleware/rateLimit-middleware.js'

// Configuraciones por endpoint
router.post('/login', limiterRequest({ maxRequests: 7, time: '1m' })) // Login: 7 req/min
router.post('/refresh-token', limiterRequest({ maxRequests: 3, time: '1m' })) // Refresh: 3 req/min
router.post('/logout', limiterRequest({ maxRequests: 3, time: '1m' })) // Logout: 3 req/min
router.post('/', limiterRequest({ maxRequests: 45, time: '1m' })) // QR: 45 req/min
```

### Medidas de seguridad implementadas:

- **Helmet**: Configuración de headers de seguridad
- **CORS**: Control de acceso entre orígenes
- **Rate Limiting**: Limitación inteligente de peticiones
- **Bcrypt**: Hashing de contraseñas
- **JWT**: Tokens seguros con expiración
- **Middleware de autenticación**: Protección por roles

### Configuración de seguridad:

```javascript
// Rate limiting diferenciado
const authLimiter = { maxRequests: 7, time: '1m' } // Autenticación
const refreshLimiter = { maxRequests: 3, time: '1m' } // Tokens
const qrLimiter = { maxRequests: 45, time: '1m' } // Códigos QR

// CORS
const corsOptions = {
	origin: process.env.CORS_ORIGIN,
	credentials: true,
}
```

## 🗄️ Base de Datos

### Configuración de Sequelize:

```javascript
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
	host: DB_HOST,
	port: DB_PORT,
	dialect: 'postgres',
	timezone: 'America/Guayaquil',
})
```

### Modelos principales:

- **User**: Usuarios del sistema
- **Admin**: Usuarios administradores del sistema
- **QR**: Codigos qr
- **Service**: Servicios
- **Token**: Tokens generados
- **Correo_ueb**: Emails institucionales
- **Doccente**: docentes de la institucion

- **sme_estu_clave-model**: Claves de mails institucionales
- **sme_nuevos_estu-model y sme_nuevos_estu25-model**: Estudiantes
- **sme_nuevos_estu-model**: Personal administrativo
- **usuarios_sistemas-model**: Usuarios del sistema (no estudiantes)
- **usuarios-model**: Usuarios

## 📈 Monitoreo

### Logging:

- **Morgan**: Log de peticiones HTTP
- **Console**: Logs de aplicación con diferentes niveles

### Métricas:

- Tiempo de respuesta
- Códigos de estado
- Errores de aplicación

# Verificar documentación Swagger

npx swagger-cli validate src/docs/swagger.json

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para reportar bugs o solicitar features:

- Crear un issue en GitHub
- Contactar al equipo de desarrollo

## 📊 Versionado

Usamos [SemVer](http://semver.org/) para el versionado. Para ver versiones disponibles, consulta los [tags del repositorio](https://github.com/your-username/api-carnet-digital/tags).

**Versión**: 1.0.0
