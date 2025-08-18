# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace

COPY ./pom.xml ./pom.xml
COPY ./gateway-service/pom.xml ./gateway-service/pom.xml
RUN mvn -q -f gateway-service/pom.xml -DskipTests dependency:go-offline

COPY ./gateway-service ./gateway-service
RUN mvn -q -f gateway-service/pom.xml -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
RUN apk add --no-cache wget

# dockerize (asegúrate de tener ./dockerize/dockerize en el repo raíz)
COPY ./dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

COPY --from=builder /workspace/gateway-service/target/gateway-service-0.0.1-SNAPSHOT.jar /app/app.jar
EXPOSE 8080

ENTRYPOINT ["sh","-c","dockerize \
  -wait http://config-service:8888/actuator/health \
  -wait http://eureka-server:8761/eureka/apps \
  -timeout 60s -- java -jar /app/app.jar"]
