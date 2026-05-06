FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY mcp/package*.json ./mcp/

RUN npm ci || npm install

COPY server ./server

RUN DATABASE_URL=postgresql://user:password@localhost:5432/suivi_sportif npm run db:generate -w server
RUN npm run build -w server
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV API_PORT=3001
ENV API_HOST=0.0.0.0

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/client/package*.json ./client/
COPY --from=build /app/mcp/package*.json ./mcp/

EXPOSE 3001

CMD ["npm", "run", "start", "-w", "server"]
