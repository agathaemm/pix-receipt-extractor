# STAGE 1: Build React Application
FROM node:20 AS builder

WORKDIR /app

# Copy specifications and lockfiles
COPY package*.json ./

# Install packages
RUN npm ci

# Copy configuration and source files
COPY tsconfig.json tsconfig.node.json vite.config.ts tailwind.config.js postcss.config.js index.html ./
COPY src/ ./src/

# Compile React static pages
RUN npm run build

# STAGE 2: Serve static pages with lightweight Nginx server
FROM nginx:alpine

# Copy built bundle from Stage 1 into Nginx HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a lightweight custom Nginx configuration to support SPA routing fallback
RUN echo 'server { \
    listen 3000; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://backend:3001; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 3000

# Execute server
CMD ["nginx", "-g", "daemon off;"]
