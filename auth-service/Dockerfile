FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY prisma ./prisma
COPY src ./src

RUN npm run build

CMD ["node", "dist/src/main.js"]
