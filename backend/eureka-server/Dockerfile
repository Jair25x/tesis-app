# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /workspace
COPY ./pom.xml ./pom.xml
COPY ./eureka-server ./eureka-server
RUN mvn -q -f eureka-server/pom.xml -DskipTests package

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

RUN apk add --no-cache curl ca-certificates

COPY --from=builder /workspace/eureka-server/target/eureka-server-0.0.1-SNAPSHOT.jar /app/app.jar

COPY ./eureka-server/scripts/entrypoint.sh /scripts/entrypoint.sh
COPY ./scripts/preflight-env.sh /scripts/preflight-env.sh
RUN chmod +x /scripts/*.sh

EXPOSE 8761
ENTRYPOINT ["/scripts/entrypoint.sh"]

