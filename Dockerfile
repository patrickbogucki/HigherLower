FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN chmod +x docker-entrypoint.sh
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000 3001

CMD ["./docker-entrypoint.sh"]
