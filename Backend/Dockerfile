# Dev-friendly Dockerfile for backend with hot reload
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

# Run migrations then start the dev server (nodemon)
CMD ["sh", "-c", "node src/migrate.js && npm run dev"]
