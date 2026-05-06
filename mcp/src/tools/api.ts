import { config } from "../config.js";
import { redactObject } from "../utils/redaction.js";

export type ApiHealthResult = {
  baseUrl: string;
  body: unknown;
  ok: boolean;
  status: number | null;
  validEnvelope: boolean;
};

export async function checkApiHealth(
  baseUrl = config.apiBaseUrl,
): Promise<ApiHealthResult> {
  const healthUrl = new URL("/health", baseUrl);

  try {
    const response = await fetch(healthUrl, {
      signal: AbortSignal.timeout(5000),
    });
    const body = await response.json().catch(() => null);
    const validEnvelope =
      typeof body === "object" &&
      body !== null &&
      "data" in body &&
      typeof (body as { data?: unknown }).data === "object";

    return {
      baseUrl,
      body: redactObject(body),
      ok: response.ok && validEnvelope,
      status: response.status,
      validEnvelope,
    };
  } catch (error: unknown) {
    return {
      baseUrl,
      body: {
        error: error instanceof Error ? error.message : String(error),
      },
      ok: false,
      status: null,
      validEnvelope: false,
    };
  }
}

export type ApiRequestOptions = {
  body?: Record<string, unknown>;
  jwtToken: string;
  method?: "DELETE" | "GET" | "POST" | "PUT";
  path: string;
};

export async function apiRequest(options: ApiRequestOptions) {
  const apiUrl = new URL(options.path, config.apiBaseUrl);

  const response = await fetch(apiUrl, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      authorization: `Bearer ${options.jwtToken}`,
      ...(options.body ? { "content-type": "application/json" } : {}),
    },
    method: options.method ?? "GET",
    signal: AbortSignal.timeout(10000),
  });

  if (response.status === 204) {
    return {
      body: null,
      ok: true,
      status: response.status,
      url: apiUrl.toString(),
    };
  }

  const body = await response.json().catch(() => null);

  return {
    body: redactObject(body),
    ok: response.ok,
    status: response.status,
    url: apiUrl.toString(),
  };
}
