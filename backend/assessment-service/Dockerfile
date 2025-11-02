# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace
COPY ./pom.xml ./pom.xml
COPY ./assessment-service ./assessment-service
RUN mvn -q -f assessment-service/pom.xml -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

RUN apk add --no-cache curl ca-certificates
COPY ./dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

COPY --from=builder /workspace/assessment-service/target/assessment-service-0.0.1-SNAPSHOT.jar /app/app.jar

COPY ./assessment-service/scripts/entrypoint.sh /scripts/entrypoint.sh
COPY ./scripts/preflight-env.sh /scripts/preflight-env.sh
RUN chmod +x /scripts/*.sh

EXPOSE 8085
ENTRYPOINT ["/scripts/entrypoint.sh"]

