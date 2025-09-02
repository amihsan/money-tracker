# -------------------------
# Stage 1: Build Quiz App
# -------------------------
FROM node:22-alpine AS quiz-build
WORKDIR /app
COPY quiz-app/frontend/package*.json ./
RUN npm install
COPY quiz-app/frontend/ .
RUN npm run build

# -------------------------
# Stage 2: Build Money Tracker App
# -------------------------
FROM node:22-alpine AS money-build
WORKDIR /app
COPY money-tracker/frontend/package*.json ./
RUN npm install
COPY money-tracker/frontend/ .
RUN npm run build

# -------------------------
# Stage 3: Serve both apps with Nginx
# -------------------------
FROM nginx:alpine

# Copy React builds
COPY --from=quiz-build /app/dist /usr/share/nginx/html/quiz
COPY --from=money-build /app/dist /usr/share/nginx/html/money

# Copy nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]
