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
COPY ./dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

COPY --from=builder /workspace/gateway-service/target/gateway-service-0.0.1-SNAPSHOT.jar /app/app.jar

# scripts
COPY ./gateway-service/scripts/entrypoint.sh /scripts/entrypoint.sh
COPY ./scripts/preflight-env.sh /scripts/preflight-env.sh
RUN chmod +x /scripts/*.sh

EXPOSE 8080
ENTRYPOINT ["/scripts/entrypoint.sh"]
