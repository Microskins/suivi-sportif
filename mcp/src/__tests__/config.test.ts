import { afterEach, describe, expect, it } from "vitest";
import { parseAllowedHosts, resolveAuthToken, resolveHost } from "../config.js";

const originalNodeEnv = process.env.NODE_ENV;
const originalAuthToken = process.env.MCP_AUTH_TOKEN;
const originalRequireAuth = process.env.MCP_REQUIRE_AUTH;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  process.env.MCP_AUTH_TOKEN = originalAuthToken;
  process.env.MCP_REQUIRE_AUTH = originalRequireAuth;
});

describe("config", () => {
  it("allows 0.0.0.0 as a listen address", () => {
    expect(resolveHost("0.0.0.0")).toBe("0.0.0.0");
  });

  it("keeps public hosts explicit in the host allowlist", () => {
    const hosts = parseAllowedHosts("suivi-sportif.fr,www.suivi-sportif.fr");

    expect(hosts.has("127.0.0.1")).toBe(true);
    expect(hosts.has("suivi-sportif.fr")).toBe(true);
    expect(hosts.has("www.suivi-sportif.fr")).toBe(true);
  });

  it("requires a token in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.MCP_AUTH_TOKEN;
    delete process.env.MCP_REQUIRE_AUTH;

    expect(() => resolveAuthToken()).toThrow("MCP_AUTH_TOKEN");
  });

  it("returns the configured token when production auth is satisfied", () => {
    process.env.NODE_ENV = "production";
    process.env.MCP_AUTH_TOKEN = "secret";

    expect(resolveAuthToken()).toBe("secret");
  });
});

