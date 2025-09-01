# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app

# Copy dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the project
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build output to the folder for reverse-proxy
COPY --from=build /app/dist /usr/share/nginx/moneytracker-frontend

# Optional entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
