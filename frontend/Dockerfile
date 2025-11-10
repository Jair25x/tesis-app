# ===== Build stage =====
FROM node:20-alpine AS build
WORKDIR /app

# Copia solo los manifests del FRONTEND desde el monorepo
# (esto permite cachear npm ci correctamente)
COPY frontend/package.json ./package.json
COPY frontend/package-lock.json ./package-lock.json

# Instala dependencias en limpio usando el lockfile del frontend
RUN npm ci

# Copia el resto del código del frontend
COPY frontend/ .

# Construye (Vite genera /dist)
RUN npm run build

# ===== Serve stage =====
FROM nginx:1.27-alpine

# Instala curl para healthcheck
RUN apk add --no-cache curl

# Copia el HTML estático
COPY --from=build /app/dist /usr/share/nginx/html

# Copia el vhost de Nginx (ruta desde raíz del contexto)
COPY frontend/default.conf /etc/nginx/conf.d/default.conf

# Healthcheck dentro de la imagen (chequea puerto local)
HEALTHCHECK --interval=10s --timeout=5s --retries=10 --start-period=30s \
  CMD curl -fsS http://127.0.0.1:80/health >/dev/null || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
