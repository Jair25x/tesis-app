# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace
COPY ./pom.xml ./pom.xml
COPY ./assessment-service ./assessment-service
RUN mvn -q -f assessment-service/pom.xml -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

RUN apk add --no-cache wget
COPY ./dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

COPY --from=builder /workspace/assessment-service/target/assessment-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8085

ENTRYPOINT ["sh","-c","dockerize \
  -wait http://config-service:8888/actuator/health \
  -wait http://eureka-server:8761/eureka/apps \
  -wait tcp://assessment-db:5432 \
  -timeout 60s -- java -jar app.jar"]
