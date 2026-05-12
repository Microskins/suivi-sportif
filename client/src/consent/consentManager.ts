export type ConsentCategory = "necessary" | "analytics" | "marketing";

export type CookieConsent = {
  version: string;
  decidedAt: string;
  categories: {
    necessary: true;
    analytics: boolean;
    marketing: boolean;
  };
};

const CONSENT_STORAGE_KEY = "cookie_consent_v1";
const CONSENT_POLICY_VERSION = "2026-05-12";

type ConsentListener = (consent: CookieConsent | null) => void;

const listeners = new Set<ConsentListener>();

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidConsent(payload: unknown): payload is CookieConsent {
  if (!isObject(payload)) return false;
  if (payload.version !== CONSENT_POLICY_VERSION) return false;
  if (typeof payload.decidedAt !== "string") return false;
  if (!isObject(payload.categories)) return false;

  const categories = payload.categories as Record<string, unknown>;
  return (
    categories.necessary === true &&
    typeof categories.analytics === "boolean" &&
    typeof categories.marketing === "boolean"
  );
}

function emitConsent(consent: CookieConsent | null) {
  for (const listener of listeners) {
    listener(consent);
  }
}

function buildConsent(input: {
  analytics: boolean;
  marketing: boolean;
}): CookieConsent {
  return {
    version: CONSENT_POLICY_VERSION,
    decidedAt: new Date().toISOString(),
    categories: {
      necessary: true,
      analytics: input.analytics,
      marketing: input.marketing,
    },
  };
}

export function getConsentStorageKey(): string {
  return CONSENT_STORAGE_KEY;
}

export function getConsentPolicyVersion(): string {
  return CONSENT_POLICY_VERSION;
}

export function getConsent(): CookieConsent | null {
  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidConsent(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveConsent(consent: CookieConsent): void {
  const normalized = buildConsent({
    analytics: consent.categories.analytics,
    marketing: consent.categories.marketing,
  });
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(normalized));
  emitConsent(normalized);
}

export function saveConsentFromChoices(input: {
  analytics: boolean;
  marketing: boolean;
}): CookieConsent {
  const consent = buildConsent(input);
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  emitConsent(consent);
  return consent;
}

export function canRun(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  const consent = getConsent();
  if (!consent) return false;
  return consent.categories[category];
}

export function subscribeConsent(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyConsentFromStorage(): void {
  emitConsent(getConsent());
}
