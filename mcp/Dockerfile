FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY mcp/package*.json ./mcp/
COPY server/package*.json ./server/
COPY client/package*.json ./client/
COPY server/prisma ./server/prisma

RUN --mount=type=cache,id=npm-cache,target=/root/.npm,sharing=locked npm ci --no-audit --fund=false
RUN npm run db:generate -w server

COPY mcp ./mcp

RUN npm run build -w mcp
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV MCP_HOST=0.0.0.0
ENV MCP_PORT=3033
ENV MCP_API_BASE_URL=http://api:3001
ENV MCP_ENABLE_MUTATIONS=false

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/mcp ./mcp
COPY --from=build /app/server/package*.json ./server/
COPY --from=build /app/client/package*.json ./client/

EXPOSE 3033

CMD ["npm", "run", "start", "-w", "mcp"]
