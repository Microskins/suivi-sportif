import { create } from "zustand";
import {
  type CookieConsent,
  getConsent,
  notifyConsentFromStorage,
  saveConsentFromChoices,
  subscribeConsent,
} from "../consent/consentManager";

type CookieConsentState = {
  consent: CookieConsent | null;
  isBannerVisible: boolean;
  isPreferencesOpen: boolean;
  initializeConsent: () => () => void;
  openConsentPreferences: () => void;
  closeConsentPreferences: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (input: { analytics: boolean; marketing: boolean }) => void;
};

function shouldShowBanner(consent: CookieConsent | null): boolean {
  return !consent;
}

export const useCookieConsentStore = create<CookieConsentState>((set) => ({
  consent: null,
  isBannerVisible: false,
  isPreferencesOpen: false,
  initializeConsent() {
    const consent = getConsent();
    set({
      consent,
      isBannerVisible: shouldShowBanner(consent),
    });

    const unsubscribe = subscribeConsent((nextConsent) => {
      set({
        consent: nextConsent,
        isBannerVisible: shouldShowBanner(nextConsent),
      });
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key === "cookie_consent_v1") {
        notifyConsentFromStorage();
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  },
  openConsentPreferences() {
    set({ isPreferencesOpen: true });
  },
  closeConsentPreferences() {
    set({ isPreferencesOpen: false });
  },
  acceptAll() {
    const consent = saveConsentFromChoices({ analytics: true, marketing: true });
    set({
      consent,
      isBannerVisible: false,
      isPreferencesOpen: false,
    });
  },
  rejectAll() {
    const consent = saveConsentFromChoices({ analytics: false, marketing: false });
    set({
      consent,
      isBannerVisible: false,
      isPreferencesOpen: false,
    });
  },
  savePreferences(input) {
    const consent = saveConsentFromChoices({
      analytics: input.analytics,
      marketing: input.marketing,
    });
    set({
      consent,
      isBannerVisible: false,
      isPreferencesOpen: false,
    });
  },
}));

export function openConsentPreferences(): void {
  useCookieConsentStore.getState().openConsentPreferences();
}
