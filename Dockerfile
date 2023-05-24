# Define OS for dependencies
FROM node:lts-alpine AS deps

# Create app directory
WORKDIR /app

# Bundle package.json and package-lock.json
COPY ./package.json ./package-lock.json ./

# Install dependencies
RUN npm ci

# Define OS for build
FROM node:lts-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# Define OS for production
FROM node:lts-alpine AS production

WORKDIR /app

# Set node env
ENV NODE_ENV=production
ENV CONFIG_DIR=/

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist ./dist

# Expose the webhook's port
EXPOSE 3000

ENV PORT 3000

# Start the webhook
CMD ["npm", "start"]
