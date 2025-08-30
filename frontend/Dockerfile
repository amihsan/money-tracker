FROM node:22-alpine AS build
WORKDIR /app
# copy only frontend dependencies
COPY package*.json ./
RUN npm install

# copy rest of frontend
COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
