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

