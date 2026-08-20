# Bitácora de trabajo con IA

Durante el desarrollo del proyecto utilicé ChatGpt como herramienta de apoyo para analizar la arquitectura, proponer implementaciones y revisar errores del backend y frontend. La IA se utilizó como asistente de desarrollo, pero las decisiones finales, validaciones y correcciones fueron realizadas manualmente.

## 1. Uso inicial de ChatGpt

Inicialmente utilicé ChatGpt para analizar la estructura del proyecto y proponer una arquitectura para la integración del formulario de solicitud de crédito.

Le pedí que ayudara principalmente con:

- Estructuración del backend utilizando AWS Lambda.
- Definición de rutas y controladores.
- Integración con API Gateway.
- Autenticación mediante AWS Cognito.
- Persistencia de las solicitudes en PostgreSQL/RDS.
- Integración con Amazon S3 para el almacenamiento de archivos.
- Organización de responsabilidades entre rutas, controladores y servicios.
- Integración del formulario de solicitud de crédito del frontend con el backend.

La propuesta inicial permitió avanzar rápidamente en la implementación y sirvió como punto de partida para separar las diferentes responsabilidades del sistema.

## 2. Propuesta que no funcionó

Uno de los problemas principales apareció en AWS Lambda con el error:

```
Runtime.MalformedHandlerName: Bad handler
```

Posteriormente también apareció:

```
Runtime.ImportModuleError:
Cannot find module 'creditApplicationHandler'
```

El problema estaba relacionado con la configuración del Handler de Lambda y con los nombres/rutas de los archivos generados durante el build con esbuild.

Por ejemplo, en diferentes momentos la configuración apuntaba a:

```
src/handlers/credit-application.handler
```

mientras que el archivo existente tenía otra estructura/nombre.

La IA propuso diferentes ajustes sobre el handler, pero no todos coincidían con la estructura real del proyecto.

Esto evidenció una limitación importante de depender únicamente de una propuesta generada automáticamente: la configuración de Lambda debe coincidir exactamente con el archivo que termina dentro del artefacto de despliegue.

Por esta razón revisé manualmente:

- La estructura real de `src/`.
- El nombre de los archivos.
- El `template.yaml`.
- El resultado generado por `sam build`.
- Los logs de CloudWatch.
- La configuración del handler de Lambda.

## 3. Problema con ESM, esbuild y dotenv

Otro problema apareció después del cambio de arquitectura:

```
Dynamic require of "fs" is not supported
```

El error se originaba en `dotenv`, utilizado desde el módulo de conexión a la base de datos.

El stack trace mostraba que el problema ocurría dentro del bundle generado por esbuild:

```
creditApplicationHandler.mjs
    ↓
dotenv
    ↓
fs
```

La propuesta automática no solucionó inmediatamente el problema porque el proyecto estaba utilizando módulos ESM y el bundle de Lambda estaba intentando resolver una dependencia que internamente utilizaba `require`.

En lugar de aplicar cambios indiscriminadamente, revisé el stack trace para determinar qué módulo estaba provocando el problema.

Esto llevó a considerar que en Lambda no era necesario depender de `.env` para las variables de producción, ya que AWS Lambda permite utilizar variables de entorno directamente.

La configuración quedó orientada a utilizar variables como:

- `RDS_HOST`
- `RDS_DATABASE`
- `RDS_USER`
- `RDS_PASSWORD`

definidas desde SAM/CloudFormation.

## 4. Uso de IA para debugging

ChatGpt fue especialmente útil para interpretar errores y proponer hipótesis.

Sin embargo, no tomé las soluciones propuestas como definitivas. Para cada problema utilicé los logs reales como fuente principal de información.

Por ejemplo, ante:

```
Internal Server Error
```

desde el frontend, revisé el flujo completo:

```
Next.js
   ↓
HTTP request
   ↓
API Gateway
   ↓
Lambda
   ↓
Service
   ↓
RDS
```

El error del frontend:

```json
{ "message": "Internal Server Error" }
```

no era suficiente para determinar la causa. Los logs de Lambda permitieron identificar que el problema ocurría antes de ejecutar correctamente la función, por errores de configuración del handler y posteriormente por problemas de empaquetado.

Esto fue importante porque evitó intentar solucionar un problema de frontend cuando realmente el fallo estaba en el despliegue de Lambda.

## 5. Decisiones que descarté

Descarté algunas propuestas de la IA cuando aumentaban innecesariamente la complejidad del proyecto.

Entre ellas estuvo introducir más capas o abstracciones de las necesarias para una aplicación de este tamaño.

Preferí mantener una arquitectura relativamente sencilla:

```
API Gateway
     ↓
AWS Lambda
     ↓
Services
     ↓
Amazon RDS PostgreSQL
```

La separación permite mantener responsabilidades claras sin introducir frameworks adicionales que no aportaban un beneficio proporcional al alcance de la prueba.

También mantuve TypeScript para tener tipado estático y facilitar el mantenimiento del código.

## 6. Autenticación

ChatGpt también fue utilizado para apoyar la integración con AWS Cognito.

La estrategia seleccionada fue:

```
Frontend
   ↓
Cognito
   ↓
JWT
   ↓
Authorization Header
   ↓
API Gateway
   ↓
Lambda
```

La autenticación se delega en Cognito y API Gateway valida el JWT mediante un authorizer.

Consideré esta alternativa más apropiada que implementar manualmente la validación de tokens dentro de cada Lambda, porque permite centralizar la seguridad y evita duplicar lógica de autenticación.

## 7. Subida de archivos

La IA también ayudó a plantear una estrategia utilizando Amazon S3 para los archivos de video.

La idea era evitar enviar directamente el archivo completo a Lambda, utilizando S3 como almacenamiento independiente.

La arquitectura implementada fue:

```
Frontend
   ↓  1. Solicita URL prefirmada
API Gateway → Lambda (genera la URL)
   ↓  2. Devuelve uploadUrl + key
Frontend
   ↓  3. PUT directo del video a S3
Amazon S3 (bucket privado, sin acceso público)
```

Durante la implementación aparecieron varios problemas que requirieron depuración manual además de las propuestas iniciales de la IA:

- El bucket quedaba inaccesible desde el navegador por falta de configuración de CORS; hubo que agregar explícitamente `CorsConfiguration` en el bucket de S3, restringida al origen del frontend (`FrontendOrigin`), ya que sin ella el `PUT` prefirmado fallaba desde el cliente aunque la URL fuera válida.
- La Lambda que genera la URL prefirmada validaba `fileSize` como parte del body de la petición, pero el servicio del frontend inicialmente no lo enviaba, lo que producía un error `"El tamaño del archivo no es válido"` sin relación con el tamaño real del archivo. Se identificó revisando la validación en el propio handler y comparándola con el payload que efectivamente mandaba el frontend.
- Se verificó explícitamente que el bucket quedara privado (`PublicAccessBlockConfiguration` con los cuatro flags en `true` y sin `BucketPolicy` pública), de forma que el único acceso posible al video sea mediante URLs prefirmadas de corta duración (5 minutos) generadas por una Lambda autenticada con Cognito.

La funcionalidad de subida de video a S3 quedó terminada y probada de extremo a extremo: selección del archivo en el formulario, solicitud de la URL prefirmada, subida directa con barra de progreso, y persistencia de la referencia (`videoKey`) junto con la solicitud en RDS.

## 8. Criterio utilizado al trabajar con IA

La principal conclusión del uso de ChatGpt fue que la IA resulta especialmente útil para:

- Explorar alternativas de arquitectura.
- Generar código inicial.
- Identificar posibles causas de errores.
- Proponer refactorizaciones.
- Explicar errores de AWS.
- Reducir el tiempo de implementación.

Pero las propuestas deben contrastarse con el proyecto real.

En particular, los errores de Lambda demostraron que una solución que parece correcta en código puede fallar debido a detalles externos como:

- Nombre real del archivo.
- Ruta del handler.
- Formato del módulo.
- Configuración de esbuild.
- Artefactos generados por SAM.
- Variables de entorno.
- Configuración de AWS.

Por eso, utilicé la IA como herramienta de apoyo y no como fuente única de decisión técnica.

## 9. Resultado y aprendizaje

El uso de ChatGpt permitió acelerar varias partes del desarrollo, especialmente la estructuración del backend y la implementación inicial de las funcionalidades.

Sin embargo, también fue necesario revertir algunos cambios y volver a una versión anterior del código cuando la separación de responsabilidades introdujo problemas de despliegue que no estaban presentes anteriormente.

La experiencia mostró que una buena arquitectura no consiste únicamente en dividir archivos, sino en mantener consistencia entre:

- Código
- Build
- Configuración SAM
- AWS Lambda
- API Gateway
- Dependencias

El principal aprendizaje fue validar cada cambio incrementalmente y utilizar los logs de AWS como fuente de verdad antes de aplicar nuevas modificaciones.

La IA fue útil para acelerar el proceso, pero el criterio técnico y la validación manual fueron necesarios para determinar qué propuestas conservar, modificar o descartar.
