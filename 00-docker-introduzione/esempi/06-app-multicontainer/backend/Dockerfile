FROM node:18-alpine

WORKDIR /app

# Installa dipendenze
RUN npm install express mongodb cors

# Copia il server
COPY server.js .

EXPOSE 3000

CMD ["node", "server.js"]
