# ===== Build stage =====
FROM node:20-alpine AS build
WORKDIR /app

# Evita reinstalar deps innecesariamente
COPY package*.json ./
RUN npm ci

# Copia el resto y construye
COPY . .
RUN npm run build

# ===== Serve stage =====
FROM nginx:1.27-alpine

# Instala curl para healthcheck
RUN apk add --no-cache curl

# Copia el HTML estático
COPY --from=build /app/dist /usr/share/nginx/html

# Copia el vhost de Nginx (no usar nginx.conf global)
COPY default.conf /etc/nginx/conf.d/default.conf

# Healthcheck dentro de la imagen (chequea puerto local)
HEALTHCHECK --interval=10s --timeout=5s --retries=10 --start-period=30s \
  CMD curl -fsS http://127.0.0.1:80/ >/dev/null || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
