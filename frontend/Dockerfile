FROM node:22-alpine AS build
WORKDIR /app
# copy only frontend dependencies
COPY package*.json ./
RUN npm install

# copy rest of frontend
COPY . .

RUN npm run build

FROM nginx:alpine
# COPY --from=build /app/dist /usr/share/nginx/html

# Copy build output to custom folder for Compose mounting (multiapp)
COPY --from=build /app/dist /usr/share/nginx/moneytracker-frontend

# Copy the entrypoint script (if any)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

