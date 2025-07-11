# Proyecto de Tesis: Plataforma Educativa Adaptativa (Backend)

## 📚 Descripción General
Este repositorio contiene el código fuente del backend de mi proyecto de tesis, una plataforma educativa adaptativa diseñada para mejorar la experiencia de aprendizaje. Inspirada en modelos exitosos como Duolingo, esta plataforma busca ofrecer un entorno dinámico y personalizado para los usuarios.

El backend ha sido construido siguiendo una arquitectura de microservicios utilizando **Spring Boot**, lo que permite una alta escalabilidad, resiliencia y mantenibilidad.

## 🎯 Objetivos del Proyecto
Los objetivos principales de este proyecto de tesis incluyen:

- Diseñar e implementar una arquitectura de microservicios robusta y escalable.
- Desarrollar un sistema de autenticación y gestión de usuarios seguro y eficiente.
- Crear servicios especializados para la gestión de currículos educativos y perfiles de usuario.
- Explorar la integración de modelos de **Machine Learning** y capacidades de **IA** (como **RAG**) para ofrecer experiencias de aprendizaje personalizadas.
- Garantizar la comunicación fluida y segura entre los diferentes componentes del sistema.

## 💡 Arquitectura de Microservicios: El Porqué
La elección de una arquitectura de microservicios se fundamenta en la necesidad de construir un sistema flexible y capaz de evolucionar con los requisitos del proyecto de tesis y futuras expansiones.

### Ventajas clave de esta arquitectura para el proyecto:
- **Escalabilidad Independiente**: Cada servicio puede escalarse de forma individual según su demanda, optimizando el uso de recursos y costes. Por ejemplo, el servicio de autenticación o el de IA pueden requerir más recursos que otros.
- **Resiliencia**: Un fallo en un microservicio no afecta directamente a todo el sistema, lo que mejora la disponibilidad general de la plataforma.
- **Desarrollo y Despliegue Independiente**: Los equipos (o en este caso, yo mismo) pueden trabajar en servicios específicos y desplegarlos de forma autónoma, acelerando el ciclo de desarrollo.
- **Flexibilidad Tecnológica**: Permite la elección de la tecnología más adecuada para cada servicio (aunque en este proyecto se prioriza Spring Boot para la coherencia).
- **Mantenibilidad**: La base de código se divide en unidades más pequeñas y manejables, facilitando la comprensión, depuración y actualización.
- **Optimización de Costos (en Producción)**: Aunque el número de servicios puede parecer elevado, la capacidad de escalar individualmente y consolidar recursos (como bases de datos) en entornos de despliegue como Railway, permite una gestión de costes más eficiente a largo plazo.

## 🛠️ Tecnologías Utilizadas
### Backend (Spring Boot)
- **Framework**: Spring Boot 3.x
- **Lenguaje**: Java 21
- **Gestión de Dependencias**: Maven

### Servicios Clave:
- **Auth-Service**: Gestión de usuarios, roles, autenticación (JWT) y refresco de tokens.
- **Curriculum-Service**: Gestión de la currícula educativa, objetivos de aprendizaje, competencias y estándares.
- **Gateway-Service**: Spring Cloud Gateway para enrutamiento de peticiones, balanceo de carga, seguridad (JWT filter) y configuración CORS.
- **Eureka-Server**: Servidor de descubrimiento de servicios para que los microservicios se registren y se encuentren entre sí.
- **Config-Service**: Spring Cloud Config Server para centralizar la configuración de todos los microservicios desde un repositorio Git.
- **Admin-Monitoring-Service**: Spring Boot Admin Server para monitorizar el estado y la salud de los microservicios.
- **(Otros servicios futuros como los de ML/IA con Python/RAG)**

### Bases de Datos
- **Bases de Datos Relacionales**: PostgreSQL (para servicios como Autenticación, Currículum, Perfil de Usuario).
- **Estrategia de Optimización**: Consolidación de múltiples bases de datos por servicio en menos instancias físicas (con esquemas separados) para reducir costes y complejidad operacional en entornos de despliegue.

### Herramientas y Despliegue
- **Contenedorización**: Docker, Docker Compose
- **Control de Versiones**: Git
- **Plataforma de Despliegue**: Railway, todavia en discusion

## 📂 Estructura del Repositorio
Este repositorio sigue un enfoque de **monorepo** para el backend, donde todos los microservicios residen en un solo repositorio Git. Esto facilita la colaboración, la gestión de dependencias compartidas y la coherencia en el desarrollo.
```bash
.
├── admin-monitoring-service/
├── auth-service/
├── config-service/
├── curriculum-service/
├── dockerize/                  # Contiene scripts o configuraciones de Docker adicionales
├── eureka-server/
├── gateway-service/
├── .env                        # Variables de entorno (IGNORADO por Git)
├── .gitignore                  # Reglas de ignorado para Git
├── docker-compose.yml          # Configuración para levantar todos los servicios con Docker Compose
├── Makefile                    # Scripts de automatización (ej. para construir, levantar)
└── pom.xml                     # POM padre de Maven para el proyecto multimodular
```
Cada carpeta de servicio (auth-service/, curriculum-service/, etc.) contiene su propia aplicación Spring Boot con su **pom.xml** específico.

## 🚀 Configuración y Ejecución
### Requisitos Previos
- Java 21 JDK
- Maven 3.x
- Node.js 18 o superior (para el frontend)
- Docker y Docker Compose
- Git

### 1. Clonar el Repositorio
Para obtener una copia local del proyecto, ejecuta el siguiente comando en tu terminal:

```bash
git clone https://github.com/Jair25x/tesis-app-backend.git
cd tesis-app-backend
```
2. Configuración de Variables de Entorno
Copia el archivo `.env.example` y renómbralo como `.env` en la raíz de este directorio. Luego completa los valores necesarios. Este archivo está en el .gitignore y no debe subirse al repositorio.

```bash
cp .env.example .env
```

Este archivo de ejemplo contiene todas las variables necesarias para Docker Compose y los microservicios. Personalízalas según tu entorno.


# Ejemplo de .env
```bash
JWT_SECRET=tu_clave_secreta_jwt_muy_larga_y_segura
OPENAI_API_KEY=sk-tu_clave_de_openai
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=auth_db
# ... otras variables
```

### Selección de perfiles de Spring
Por defecto los microservicios usan el perfil `dev`. Al desplegar en
producción puedes activar el perfil `prod` estableciendo la variable de
entorno `SPRING_PROFILES_ACTIVE=prod` antes de iniciar cada servicio, por
ejemplo:

```bash
SPRING_PROFILES_ACTIVE=prod java -jar auth-service.jar
```

3. Descargar Dockerize
Los Dockerfiles requieren la herramienta [`dockerize`](https://github.com/jwilder/dockerize) para esperar a que los servicios dependientes estén disponibles. Puedes descargarla y colocarla en `backend/dockerize/` ejecutando:
```bash
mkdir -p backend/dockerize
curl -L https://github.com/jwilder/dockerize/releases/download/v0.6.1/dockerize-linux-amd64-v0.9.3.tar.gz \
  | tar -xz -C backend/dockerize
chmod +x backend/dockerize/dockerize
```

4. Construir los Microservicios
Desde la raíz del monorepo (tesis-app-backend), construye todos los servicios con Maven. Este comando compilará el código, ejecutará las pruebas y generará los archivos .jar en las carpetas target/ de cada microservicio.
```bash
mvn clean install
```
5. Ejecutar con Docker Compose
Una vez construidos los JARs, puedes levantar todos los microservicios y sus dependencias (bases de datos, Eureka, etc.) usando Docker Compose. Este comando construirá las imágenes Docker de tus servicios (si es necesario) y las levantará.
```bash
docker-compose up --build
```
6. Acceder a los Servicios
Una vez que todos los servicios estén en ejecución, puedes acceder a ellos a través de las siguientes URLs:
```bash
Spring Boot Admin: http://localhost:9090

Eureka Server: http://localhost:8761

Gateway Service: http://localhost:8080 (o el puerto que hayas configurado en application.yml)

Auth Service: http://localhost:8081

(Otros servicios se accederán a través del Gateway, usando las rutas definidas en este)
```
📈 Consideraciones de Escalabilidad y Costos

- Este proyecto ha sido diseñado con la escalabilidad y la optimización de costes en mente, especialmente para un posible despliegue en plataformas como Railway.

- Consolidación de Bases de Datos: Para reducir el número de instancias de bases de datos y, por ende, los costes, se ha optado por consolidar múltiples esquemas de bases de datos en una o pocas instancias de PostgreSQL, manteniendo la separación lógica entre servicios.

- Servicios de IA/ML: Los servicios de Python con Random Forest y RAG con OpenAI son identificados como potenciales consumidores de altos recursos. Se buscarán optimizaciones específicas para estos módulos, como la gestión eficiente de la memoria y el procesamiento, y la monitorización de los costes de la API externa de OpenAI.

- Monitoreo: El admin-monitoring-service es clave para observar el consumo de recursos y el estado de salud de cada microservicio, permitiendo identificar cuellos de botella y optimizar el rendimiento.

🤝 Contribución
Dado que es un proyecto de tesis, las contribuciones externas no están activamente solicitadas. Sin embargo, si tienes sugerencias o encuentras problemas, puedes abrir un "Issue" en este repositorio.

📧 Contacto
Para cualquier consulta o comentario sobre este proyecto, puedes contactar a:

Jair Almanza
almanzajair5@gmail.com
www.linkedin.com/in/jair-almanza-cuno-61038b208