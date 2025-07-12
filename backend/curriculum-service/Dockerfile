# --------------------------
# Etapa 1: compilación
# --------------------------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app
COPY ../pom.xml ../
COPY ../curriculum-service /app
RUN mvn -f /app/pom.xml clean package -DskipTests

# --------------------------
# Etapa 2: runtime
# --------------------------
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copiar el binario dockerize desde el contexto local
COPY ../dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

# JAR compilado
COPY --from=builder /app/target/curriculum-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8082

ENTRYPOINT ["sh","-c", "\
  dockerize \
  -wait http://config-service:8888/actuator/health \
  -wait http://eureka-server:8761/eureka/apps \
  -wait tcp://content-db:5432 \
  -timeout 60s \
  -- java -jar app.jar\
  "]
