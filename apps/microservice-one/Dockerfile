# base stage
FROM node:20-alpine AS base

# development stage
FROM base AS development
ARG APP
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .

# production stage
FROM base AS production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build microservice-one
CMD ["node", "dist/apps/microservice-one/main"]
