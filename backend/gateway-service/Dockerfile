# Etapa 1: Compilación
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app
COPY ../pom.xml ../
COPY ../gateway-service /app
RUN mvn -f /app/pom.xml clean package -DskipTests

# Etapa 2: Ejecución
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copiar el binario dockerize desde el contexto local
COPY ../dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

# Copiar el JAR compilado
COPY --from=builder /app/target/gateway-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# Esperar a que config-service y eureka estén listos
ENTRYPOINT ["sh", "-c", "dockerize -wait http://config-service:8888/actuator/health -wait http://eureka-server:8761/eureka/apps -timeout 60s -- java -jar app.jar"]
