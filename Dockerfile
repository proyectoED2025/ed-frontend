# ===== Build Angular =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# ===== Nginx runtime =====
FROM nginx:alpine AS runtime
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 👇 Copia el CONTENIDO de dist/proyecto-web/browser a /usr/share/nginx/html
COPY --from=build /app/dist/proyecto-web/browser/ /usr/share/nginx/html/
