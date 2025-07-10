# Etapa 1: Compilación
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app
COPY ../pom.xml ../
COPY ../eureka-server /app
RUN mvn -f /app/pom.xml clean package -DskipTests

# Etapa 2: Ejecución
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app
COPY --from=builder /app/target/eureka-server-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8761
ENTRYPOINT ["java", "-jar", "app.jar"]