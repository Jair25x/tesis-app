# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace
COPY ./pom.xml ./pom.xml
COPY ./config-service ./config-service
RUN mvn -q -f config-service/pom.xml -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

RUN apk add --no-cache curl ca-certificates

COPY --from=builder /workspace/config-service/target/config-service-0.0.1-SNAPSHOT.jar /app/app.jar

COPY ./config-service/scripts/entrypoint.sh /scripts/entrypoint.sh
COPY ./scripts/preflight-env.sh /scripts/preflight-env.sh
RUN chmod +x /scripts/*.sh

EXPOSE 8888
ENTRYPOINT ["/scripts/entrypoint.sh"]

