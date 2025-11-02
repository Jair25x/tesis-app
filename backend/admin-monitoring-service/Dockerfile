# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace
COPY ./pom.xml ./pom.xml
COPY ./admin-monitoring-service ./admin-monitoring-service
RUN mvn -q -f admin-monitoring-service/pom.xml -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

RUN apk add --no-cache curl ca-certificates

COPY --from=builder /workspace/admin-monitoring-service/target/admin-monitoring-service-0.0.1-SNAPSHOT.jar /app/app.jar

COPY ./admin-monitoring-service/scripts/entrypoint.sh /scripts/entrypoint.sh
COPY ./scripts/preflight-env.sh /scripts/preflight-env.sh
RUN chmod +x /scripts/*.sh

EXPOSE 9090
ENTRYPOINT ["/scripts/entrypoint.sh"]

