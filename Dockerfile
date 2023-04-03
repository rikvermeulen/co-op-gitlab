#
# Define OS for dependencies
#
FROM alpine:3.15 AS deps

# Install packages
RUN apk add --no-cache nodejs npm

# Create app directory
WORKDIR /app

# Bundle package.json and package-lock.json
COPY ./package.json ./package-lock.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

#
# Define OS for build
#

FROM alpine:3.15 AS build

# Install packages
RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

#
# Define OS for production
#

FROM alpine:3.15 AS production

RUN apk add --no-cache nodejs npm

WORKDIR /app

# Set node env
ENV NODE_ENV=production
ENV CONFIG_DIR=/

# Expose the webhook's port
EXPOSE 3000

ENV PORT 3000


# Start the webhook
CMD ["npm", "start"]
