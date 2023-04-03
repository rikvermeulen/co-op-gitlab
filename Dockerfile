FROM node:14-alpine

# Set the working directory
WORKDIR /app

COPY ./package.json ./package-lock.json ./
# Install dependencies
RUN npm ci && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Create a production build
RUN npm run build

# Expose the webhook's port
EXPOSE 3000


# Start the webhook
CMD ["npm", "start"]
