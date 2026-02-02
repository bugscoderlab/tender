FROM node:20-alpine

WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=1024"

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]