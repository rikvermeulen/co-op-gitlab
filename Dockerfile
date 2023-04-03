FROM node:14-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Expose the webhook's port
EXPOSE 3000

# Start the webhook
CMD ["npm", "build"]

# Start the webhook
CMD ["npm", "start"]
