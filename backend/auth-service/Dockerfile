# ---------- build ----------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY ../pom.xml ../
COPY ../auth-service /app
RUN mvn -f /app/pom.xml clean package -DskipTests

# ---------- runtime ----------
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app

COPY ../dockerize/dockerize /usr/local/bin/dockerize
RUN chmod +x /usr/local/bin/dockerize

COPY --from=builder /app/target/auth-service-0.0.1-SNAPSHOT.jar /app/app.jar

# scripts
COPY ../auth-service/scripts/entrypoint.sh /scripts/entrypoint.sh
COPY ../scripts/preflight-env.sh /scripts/preflight-env.sh
RUN chmod +x /scripts/*.sh

EXPOSE 8081
ENTRYPOINT ["/scripts/entrypoint.sh"]
