# Etapa 1: Compilar con Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app
COPY ../pom.xml ../
COPY ../admin-monitoring-service /app
RUN mvn -f /app/pom.xml clean package -DskipTests

# Etapa 2: Imagen ligera de ejecución
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app
COPY --from=builder /app/target/admin-monitoring-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 9090
ENTRYPOINT ["java", "-jar", "app.jar"]
