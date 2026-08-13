FROM node:22-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
RUN mkdir -p logs uploads
COPY backend/ ./
CMD ["npm", "start"]
