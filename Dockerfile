FROM node:22-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY bootstrap ./bootstrap
COPY config ./config
COPY app ./app
COPY public ./public
COPY routes ./routes
COPY middleware ./middleware
COPY database ./database
COPY resources ./resources

RUN mkdir -p database

EXPOSE 8005

ENV NODE_ENV=production
ENV APP_PORT=8005
ENV APP_HOST=0.0.0.0

CMD ["node", "public/index.js"]
