# Use official Node LTS Alpine image
FROM node:22-alpine

# Install build deps for native modules (e.g. better-sqlite3)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package.json package-lock.json ./

# Install dependencies (no dev for production image)
RUN npm ci --omit=dev

# Copy application code
COPY bootstrap ./bootstrap
COPY config ./config
COPY app ./app
COPY public ./public
COPY routes ./routes
COPY middleware ./middleware
COPY database ./database

# Ensure database directory exists (SQLite file created at runtime)
RUN mkdir -p database

EXPOSE 3000

ENV NODE_ENV=production
ENV APP_PORT=3000
ENV APP_HOST=0.0.0.0

CMD ["node", "public/index.js"]
