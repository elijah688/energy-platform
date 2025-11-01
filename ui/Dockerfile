# build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG BACKEND_HOST
RUN echo "export const environment = { production: true, backendHost: '$BACKEND_HOST' };" > src/environments/environment.prod.ts

RUN npm run build -- --configuration production

# runtime stage
FROM nginx:alpine AS runtime
COPY --from=build /app/dist/ui/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

