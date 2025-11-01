# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY ../pom.xml ../
COPY ../config-service /app
RUN mvn -f /app/pom.xml clean package -DskipTests

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

COPY --from=builder /app/target/config-service-0.0.1-SNAPSHOT.jar /app/app.jar

# scripts
COPY ../config-service/scripts/entrypoint.sh /scripts/entrypoint.sh
COPY ../scripts/preflight-env.sh /scripts/preflight-env.sh
RUN chmod +x /scripts/*.sh

EXPOSE 8888
ENTRYPOINT ["/scripts/entrypoint.sh"]
