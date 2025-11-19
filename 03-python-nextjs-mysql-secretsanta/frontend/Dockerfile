FROM node:18-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm install

# Copia source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
