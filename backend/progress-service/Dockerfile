# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace
COPY ./pom.xml ./pom.xml
COPY ./progress-service ./progress-service
RUN mvn -q -f progress-service/pom.xml -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

RUN apk add --no-cache wget
# Copia dockerize desde tu repo (asegúrate de tener dockerize/ en el root)
COPY ./dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

COPY --from=builder /workspace/progress-service/target/progress-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8083

ENTRYPOINT ["sh","-c","dockerize \
  -wait http://config-service:8888/actuator/health \
  -wait http://eureka-server:8761/eureka/apps \
  -wait tcp://progress-db:5432 \
  -timeout 60s -- java -jar app.jar"]
