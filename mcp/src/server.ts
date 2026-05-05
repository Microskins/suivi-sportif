import { randomUUID } from "node:crypto";
import http, { type IncomingMessage, type ServerResponse } from "node:http";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { config, isAllowedHostHeader } from "./config.js";
import { createMcpServer } from "./mcp-server.js";

type McpSession = {
  server: McpServer;
  transport: StreamableHTTPServerTransport;
};

const sessions = new Map<string, McpSession>();

function writeStderr(message: string) {
  process.stderr.write(`${message}\n`);
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, unknown>,
) {
  response.writeHead(statusCode, {
    "content-type": "application/json",
  });
  response.end(JSON.stringify(body));
}

function sendJsonRpcError(
  response: ServerResponse,
  statusCode: number,
  message: string,
) {
  sendJson(response, statusCode, {
    error: {
      code: -32000,
      message,
    },
    id: null,
    jsonrpc: "2.0",
  });
}

function getHeaderValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function isAuthorized(request: IncomingMessage): boolean {
  if (!config.authToken) {
    return true;
  }

  const authorization = request.headers.authorization;
  const tokenHeader = getHeaderValue(request.headers["x-mcp-auth-token"]);

  return (
    authorization === `Bearer ${config.authToken}` ||
    tokenHeader === config.authToken
  );
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalLength = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalLength += buffer.length;

    if (totalLength > 1024 * 1024) {
      throw new Error("Requete MCP trop volumineuse");
    }

    chunks.push(buffer);
  }

  const body = Buffer.concat(chunks).toString("utf8");

  if (!body) {
    return undefined;
  }

  return JSON.parse(body) as unknown;
}

function cleanupSession(sessionId: string) {
  const session = sessions.get(sessionId);
  sessions.delete(sessionId);
  void session?.server.close().catch(() => undefined);
}

async function handleMcpPostRequest(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const sessionId = getHeaderValue(request.headers["mcp-session-id"]);
  const parsedBody = await readJsonBody(request);

  if (sessionId) {
    const existingSession = sessions.get(sessionId);

    if (!existingSession) {
      sendJsonRpcError(response, 400, "Bad Request: session MCP invalide");
      return;
    }

    await existingSession.transport.handleRequest(request, response, parsedBody);
    return;
  }

  if (!isInitializeRequest(parsedBody)) {
    sendJsonRpcError(
      response,
      400,
      "Bad Request: initialize requis pour creer une session MCP",
    );
    return;
  }

  const mcpServer = createMcpServer();
  let transport: StreamableHTTPServerTransport;

  transport = new StreamableHTTPServerTransport({
    onsessionclosed: (closedSessionId) => cleanupSession(closedSessionId),
    onsessioninitialized: (initializedSessionId) => {
      sessions.set(initializedSessionId, {
        server: mcpServer,
        transport,
      });
    },
    sessionIdGenerator: () => randomUUID(),
  });

  transport.onclose = () => {
    const activeSessionId = transport.sessionId;

    if (activeSessionId) {
      cleanupSession(activeSessionId);
    }
  };

  await mcpServer.connect(transport);
  await transport.handleRequest(request, response, parsedBody);
}

async function handleMcpSessionRequest(
  request: IncomingMessage,
  response: ServerResponse,
) {
  const sessionId = getHeaderValue(request.headers["mcp-session-id"]);

  if (!sessionId) {
    sendJsonRpcError(response, 400, "Bad Request: session MCP manquante");
    return;
  }

  const session = sessions.get(sessionId);

  if (!session) {
    sendJsonRpcError(response, 400, "Bad Request: session MCP invalide");
    return;
  }

  await session.transport.handleRequest(request, response);
}

const httpServer = http.createServer(async (request, response) => {
  if (!isAllowedHostHeader(request.headers.host)) {
    sendJson(response, 403, { error: "Host header refuse" });
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, {
      data: {
        mcp: "ok",
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  if (!isAuthorized(request)) {
    sendJson(response, 401, { error: "Unauthorized" });
    return;
  }

  if (url.pathname !== "/mcp") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    if (request.method === "POST") {
      await handleMcpPostRequest(request, response);
      return;
    }

    if (request.method === "GET" || request.method === "DELETE") {
      await handleMcpSessionRequest(request, response);
      return;
    }
  } catch (error: unknown) {
    writeStderr(
      `Erreur MCP: ${error instanceof Error ? error.message : String(error)}`,
    );

    if (!response.headersSent) {
      sendJson(response, 500, {
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
        jsonrpc: "2.0",
      });
    }

    return;
  }

  if (!response.headersSent) {
    sendJsonRpcError(response, 405, "Method not allowed.");
  }
});

httpServer.on("error", (error: NodeJS.ErrnoException) => {
  writeStderr(
    `Impossible de demarrer le serveur MCP: ${error.code ?? "UNKNOWN"} ${error.message}`,
  );
  process.exit(1);
});

httpServer.listen(config.port, config.host, () => {
  writeStderr(
    `Suivi Sportif MCP listening on http://${config.host}:${config.port}/mcp`,
  );
});

function closeSessions() {
  for (const sessionId of sessions.keys()) {
    cleanupSession(sessionId);
  }
}

process.on("SIGINT", () => {
  closeSessions();
  httpServer.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  closeSessions();
  httpServer.close(() => process.exit(0));
});
