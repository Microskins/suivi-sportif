import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(__dirname, "../../..");

function securityHeaders(relativePath: string) {
  const conf = readFileSync(resolve(repoRoot, relativePath), "utf8");
  // Premier bloc server de suivi-sportif.fr qui pose des en-tetes.
  return [...conf.matchAll(/^\s*add_header (\S+) "([^"]+)"/gm)]
    .slice(0, 4)
    .map(([, name, value]) => `${name}: ${value}`);
}

describe("en-tetes de securite Nginx", () => {
  // La CSP vit a deux endroits: le conteneur client (deploye sans sudo) et le
  // Nginx de l'hote (synchronise a part). Une divergence a deja bloque les
  // tuiles de toutes les cartes Voyage en production.
  it("sont identiques dans le conteneur client et sur l'hote", () => {
    const client = securityHeaders("client/nginx/default.conf");
    expect(client.some((h) => h.startsWith("Content-Security-Policy"))).toBe(
      true,
    );
    expect(securityHeaders("deploy/nginx/suivi-sportif.fr.conf")).toEqual(
      client,
    );
  });

  it("autorisent les fournisseurs de tuiles des cartes", () => {
    const csp = securityHeaders("client/nginx/default.conf").find((h) =>
      h.startsWith("Content-Security-Policy"),
    );
    for (const host of [
      "https://tiles.openfreemap.org",
      "https://s3.amazonaws.com",
      "https://server.arcgisonline.com",
    ])
      expect(csp).toContain(host);
  });
});
