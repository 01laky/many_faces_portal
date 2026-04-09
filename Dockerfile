# Production Dockerfile for React Vite application

FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare yarn@4.12.0 --activate

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

COPY . .
RUN yarn build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
