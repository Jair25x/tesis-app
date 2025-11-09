# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

# Copia el POM raíz y el módulo a compilar (mejora caché)
COPY ./pom.xml ./pom.xml
COPY ./avatar-service/pom.xml ./avatar-service/pom.xml

# Copia el resto solo después para no invalidar caché de dependencias
COPY . ./

# Compila solo avatar-service (y sus dependencias del reactor)
RUN mvn -q -DskipTests -pl avatar-service -am clean package

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

# Utilidades mínimas
RUN apk add --no-cache curl ca-certificates

# dockerize (si ya lo tienes en repo /dockerize/dockerize)
COPY ./dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

# JAR del servicio
COPY --from=builder /workspace/avatar-service/target/avatar-service-0.0.1-SNAPSHOT.jar /app/app.jar

# Scripts de arranque (si sigues el mismo patrón que curriculum-service)
COPY ./avatar-service/scripts/entrypoint.sh /scripts/entrypoint.sh
COPY ./scripts/preflight-env.sh /scripts/preflight-env.sh
RUN chmod +x /scripts/*.sh

EXPOSE 8088
ENTRYPOINT ["/scripts/entrypoint.sh"]
