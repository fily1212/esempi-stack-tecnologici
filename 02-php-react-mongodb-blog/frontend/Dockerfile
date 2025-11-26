# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copia package files e installa dipendenze
COPY package*.json ./
RUN npm ci --only=production

# Copia source code e builda
COPY . .
RUN npm run build

# Production stage con Nginx
FROM nginx:alpine

# Copia i file buildati da React
COPY --from=build /app/build /usr/share/nginx/html

# Configurazione Nginx per SPA (routing client-side)
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
