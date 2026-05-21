# Use official Node.js long term support image
FROM node:20

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install dependencies (both dev and prod, to allow tsc build)
RUN npm ci --include=dev

# Copy source code and config files
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript
RUN npm run build

# Remove development dependencies to keep image lean
RUN npm prune --production

# Expose backend service port
EXPOSE 3001

# Command to launch the server
CMD ["node", "dist/index.js"]
