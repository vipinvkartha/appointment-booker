# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy TypeScript source files
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the app's port
EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]
