// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canRun,
  getConsent,
  getConsentPolicyVersion,
  getConsentStorageKey,
  saveConsentFromChoices,
  subscribeConsent,
} from "./consentManager";

describe("consentManager", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns null when no consent is stored", () => {
    expect(getConsent()).toBeNull();
    expect(canRun("analytics")).toBe(false);
    expect(canRun("marketing")).toBe(false);
    expect(canRun("necessary")).toBe(true);
  });

  it("stores and reads consent with policy version", () => {
    const consent = saveConsentFromChoices({ analytics: true, marketing: false });

    expect(consent.version).toBe(getConsentPolicyVersion());
    expect(consent.categories.necessary).toBe(true);
    expect(getConsent()).toEqual(consent);
    expect(canRun("analytics")).toBe(true);
    expect(canRun("marketing")).toBe(false);
  });

  it("ignores consent when stored version is outdated", () => {
    window.localStorage.setItem(
      getConsentStorageKey(),
      JSON.stringify({
        version: "2000-01-01",
        decidedAt: new Date().toISOString(),
        categories: { necessary: true, analytics: true, marketing: true },
      }),
    );

    expect(getConsent()).toBeNull();
    expect(canRun("analytics")).toBe(false);
  });

  it("emits updates to listeners", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeConsent(listener);

    const consent = saveConsentFromChoices({ analytics: false, marketing: true });
    expect(listener).toHaveBeenCalledWith(consent);

    unsubscribe();
  });
});
