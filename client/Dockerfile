FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY mcp/package*.json ./mcp/

RUN --mount=type=cache,id=npm-cache,target=/root/.npm,sharing=locked npm ci --no-audit --fund=false

COPY client/index.html ./client/index.html
COPY client/postcss.config.js ./client/postcss.config.js
COPY client/tailwind.config.js ./client/tailwind.config.js
COPY client/tsconfig.json ./client/tsconfig.json
COPY client/tsconfig.node.json ./client/tsconfig.node.json
COPY client/vite.config.ts ./client/vite.config.ts
COPY client/src ./client/src

ARG VITE_API_URL=https://suivi-sportif.fr
ARG VITE_DISABLE_PUBLIC_COPY=true
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_DISABLE_PUBLIC_COPY=${VITE_DISABLE_PUBLIC_COPY}

RUN npm run build -w client

FROM nginx:1.27-alpine AS runtime

COPY client/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY client/public/ /usr/share/nginx/html/
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
