# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace
COPY ./pom.xml ./pom.xml
COPY ./curriculum-service ./curriculum-service
RUN mvn -q -f curriculum-service/pom.xml -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

RUN apk add --no-cache wget
COPY ./dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

COPY --from=builder /workspace/curriculum-service/target/curriculum-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082

ENTRYPOINT ["sh","-c","dockerize \
  -wait http://config-service:8888/actuator/health \
  -wait http://eureka-server:8761/eureka/apps \
  -wait tcp://content-db:5432 \
  -timeout 60s -- java -jar app.jar"]
