FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY mcp/package*.json ./mcp/

RUN npm ci || npm install

COPY client ./client

ARG VITE_API_URL=https://suivi-sportif.fr
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build -w client

FROM nginx:1.27-alpine AS runtime

COPY client/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
