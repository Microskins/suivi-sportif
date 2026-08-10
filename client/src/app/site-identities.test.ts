// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { applySiteIdentity, siteIdFromPath } from "./site-identities";

beforeEach(() => {
  document.head.innerHTML = `
    <meta name="description" content="" />
    <meta name="theme-color" content="" />
    <meta property="og:title" content="" />
    <meta property="og:description" content="" />
    <meta name="twitter:title" content="" />
    <meta name="twitter:description" content="" />
    <link id="site-icon" rel="icon" href="/favicon.svg" />
  `;
});

describe("identite du site Voyage", () => {
  it("reconnait le catalogue et ses routes enfants", () => {
    expect(siteIdFromPath("/voyage")).toBe("voyage");
    expect(siteIdFromPath("/voyage/islande-2026/")).toBe("voyage");
  });

  it("applique les metadonnees et le favicon Voyage", () => {
    applySiteIdentity("/voyage/islande-2026");

    expect(document.documentElement.dataset.site).toBe("voyage");
    expect(document.title).toBe("Voyage - Carnets de depart");
    expect(
      document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
        ?.content,
    ).toBe("#0f1b2b");
    expect(
      document.querySelector<HTMLLinkElement>("#site-icon")?.href,
    ).toContain("/sites/voyage/favicon.svg");
  });
});
