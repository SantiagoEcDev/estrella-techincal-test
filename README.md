# Sistema de Solicitud de Crédito Educativo

Aplicación web para la gestión de solicitudes de crédito educativo. Permite a los usuarios crear, consultar, editar y eliminar sus solicitudes, autenticándose mediante AWS Cognito.

## Stack tecnológico

**Frontend**
- Next.js (App Router) + TypeScript
- React Hook Form + Zod para validación de formularios
- shadcn/ui + Tailwind CSS
- AWS Amplify (Auth) para integración con Cognito

**Backend**
- AWS Lambda (Node.js / TypeScript)
- API Gateway (HTTP API)
- AWS SAM para infraestructura como código
- esbuild para el bundling de las funciones Lambda

**Base de datos**
- Amazon RDS (PostgreSQL)

**Autenticación**
- AWS Cognito (User Pool + JWT)

**Almacenamiento de archivos**
- Amazon S3 (planeado para los videos de presentación — ver [Limitaciones conocidas](#limitaciones-conocidas))

---

## Cómo levantar el proyecto localmente

### Requisitos previos

- Node.js 18+
- AWS CLI configurado con credenciales válidas
- AWS SAM CLI
- Docker (requerido por `sam build` / `sam local` para emular el runtime de Lambda)
- Una instancia de PostgreSQL accesible (local, RDS, o vía túnel/bastion si la base es privada)
- Un User Pool de Cognito ya creado (o desplegado junto con el stack de SAM, según la configuración del `template.yaml`)

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd <nombre-del-repositorio>
```

### 2. Backend (AWS Lambda + SAM)

```bash
cd backend

npm install

# Construye las funciones (bundling con esbuild)
sam build

# Despliega en AWS (primera vez con guía interactiva)
sam deploy --guided
```

Variables de entorno necesarias para el backend, definidas como variables de Lambda en `template.yaml` (no en un archivo `.env`, ver [Decisiones técnicas](#decisiones-técnicas)):

```
RDS_HOST=
RDS_PORT=5432
RDS_DATABASE=
RDS_USER=
RDS_PASSWORD=
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
```

Esto expone la API, apuntando a las funciones Lambda locales.

### 3. Frontend (Next.js)

```bash
cd frontend

npm install
```

Crea un archivo `.env.local` con las variables necesarias:

```
NEXT_PUBLIC_API_URL=aws.url
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_CLIENT_ID=
NEXT_PUBLIC_COGNITO_REGION=
```

Levanta el servidor de desarrollo:

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:3000` (o el puerto que Next.js asigne si el 3000 ya está tomado por el backend local).



---

## Arquitectura desplegada

### Flujo general de una solicitud

```
Frontend (Next.js)
     ↓  HTTP request + JWT
API Gateway
     ↓
AWS Lambda (Handler)
     ↓
Services
     ↓
Repositories
     ↓
Amazon RDS (PostgreSQL)
```

### Autenticación

```
Frontend
   ↓
Cognito (login)
   ↓
JWT (idToken)
   ↓
Authorization Header
   ↓
API Gateway (authorizer valida el JWT)
   ↓
Lambda
```

La autenticación se delega completamente en Cognito. API Gateway valida el JWT mediante un *authorizer* antes de invocar la Lambda correspondiente, centralizando la seguridad y evitando duplicar lógica de validación de tokens en cada función.

### Subida de archivos (diseño previsto, no finalizado)

```
Frontend
   ↓
API (generación de URL prefirmada)
   ↓
S3
   ↓
Video
```

La idea de diseño era que el frontend solicitara una URL prefirmada al backend y subiera el video directamente a S3, sin pasar el archivo completo por Lambda. Este flujo **no quedó implementado** al cierre de la prueba (ver [Limitaciones conocidas](#limitaciones-conocidas)).

### Separación de responsabilidades en el backend

```
Handler
   ↓
Routes
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
PostgreSQL
```

Cada Lambda handler delega en routes/controllers/services/repositories, evitando que el handler concentre lógica de HTTP, validación, acceso a datos y reglas de negocio.

---

## Decisiones técnicas

### Lambda vs. contenedor

Se optó por **AWS Lambda** (en lugar de un contenedor en ECS/Fargate) por:

- **Costo**: el tráfico esperado para esta prueba/proyecto es bajo e intermitente; Lambda solo cobra por invocación, mientras que un contenedor implica costo fijo de tener el servicio corriendo.
- **Operación**: no requiere gestionar clúster, escalado manual, ni definir tareas de infraestructura adicionales (balanceadores, autoscaling groups, etc.).
- **Integración nativa con API Gateway y Cognito**, simplificando la validación de JWT mediante un *authorizer* administrado sin código adicional.
- **Escalado automático** ante picos de solicitudes, sin aprovisionamiento previo.

El costo de esta decisión fue una curva de aprendizaje/depuración más alta relacionada con el empaquetado (esbuild), el nombre/ruta del handler y la resolución de módulos ESM vs CommonJS dentro del bundle — problemas documentados en detalle en `AI-LOG.md`.

### Estrategia de autenticación: AWS Cognito

Se eligió **Cognito + JWT validado en API Gateway** en lugar de implementar autenticación propia o validar tokens manualmente dentro de cada Lambda, porque:

- Centraliza la seguridad en un único punto (el *authorizer* de API Gateway), evitando duplicar lógica de validación en cada función.
- Evita almacenar y gestionar contraseñas o credenciales sensibles dentro de la aplicación.
- Se integra directamente con AWS Amplify en el frontend, reduciendo el código necesario para login, manejo de sesión y refresco de tokens.

### Estrategia de subida de archivos: Amazon S3

Se eligió S3 (en lugar de enviar el archivo completo a través de Lambda/API Gateway) por:

- **Límites de tamaño**: API Gateway y Lambda tienen límites de payload (6 MB síncrono en Lambda, ~10 MB en API Gateway) que un video de hasta 200 MB supera ampliamente.
- **Costo y eficiencia**: subir directamente a S3 desde el navegador (vía URL prefirmada) evita que el archivo transite por Lambda, reduciendo tiempo de ejecución facturable y complejidad del backend.
- **Separación de responsabilidades**: el backend solo gestiona metadatos y la generación de la URL; S3 se encarga del almacenamiento binario.

**Esta funcionalidad no se completó** (ver limitaciones).

### Elección de base de datos: PostgreSQL (Amazon RDS)

Se eligió PostgreSQL sobre alternativas NoSQL (DynamoDB, por ejemplo) por:

- La naturaleza **relacional** de los datos (solicitudes de crédito, usuarios, posibles relaciones futuras con instituciones educativas o estados de aprobación) se adapta mejor a un modelo relacional con integridad referencial.
- Permite **consultas y filtros flexibles** (por estado, usuario, fechas, montos) sin necesidad de diseñar acceso por patrones de consulta predefinidos, como exigiría DynamoDB.

Las credenciales de conexión se manejan como **variables de entorno de Lambda** (definidas en SAM/CloudFormation) en lugar de un archivo `.env`, ya que Lambda no requiere `dotenv` para variables de producción, y su uso generaba conflictos con el bundle ESM de esbuild (`Dynamic require of "fs" is not supported`), como se documenta en `AI-LOG.md`.

---

## Qué haría distinto con más tiempo

- **Completar la subida de video a S3**: implementar el endpoint que genera la URL prefirmada, la subida directa desde el frontend con indicador de progreso, y la actualización del registro en base de datos una vez finalizada la subida (idealmente confirmada vía evento de S3 en lugar de confiar únicamente en la respuesta del cliente).
- Agregar pruebas automatizadas, al menos para las funciones Lambda (services/repositories) y los flujos críticos del frontend (creación y eliminación de solicitudes).
- Implementar paginación y filtros en el listado de solicitudes.
- Conectar completamente el flujo de edición de solicitudes, reutilizando el mismo formulario de creación en modo edición.
- Configurar un pipeline de CI/CD (build, test, `sam deploy`) en lugar de despliegues manuales.