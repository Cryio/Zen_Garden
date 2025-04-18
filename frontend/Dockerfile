FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with specific esbuild version
RUN npm install esbuild@0.25.2
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev", "--", "--host"] 