FROM node:18-alpine

WORKDIR /app

# Installa redis client per Node.js
RUN npm install redis

COPY app.js .

EXPOSE 3000

CMD ["node", "app.js"]
