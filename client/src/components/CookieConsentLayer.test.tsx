// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CookieConsentLayer } from "./CookieConsentLayer";
import { getConsentStorageKey } from "../consent/consentManager";
import { useCookieConsentStore } from "../stores/cookieConsentStore";

describe("CookieConsentLayer", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCookieConsentStore.setState({
      consent: null,
      isBannerVisible: false,
      isPreferencesOpen: false,
    });
  });

  it("shows the banner on first load", () => {
    render(<CookieConsentLayer />);
    expect(screen.getByText("Gestion des cookies")).toBeTruthy();
  });

  it("accepts all cookies from banner", () => {
    render(<CookieConsentLayer />);

    fireEvent.click(screen.getByRole("button", { name: "Tout accepter" }));

    const raw = window.localStorage.getItem(getConsentStorageKey());
    expect(raw).not.toBeNull();
    const consent = JSON.parse(raw as string);
    expect(consent.categories.analytics).toBe(true);
    expect(consent.categories.marketing).toBe(true);
  });

  it("rejects all cookies from banner", () => {
    render(<CookieConsentLayer />);

    fireEvent.click(screen.getByRole("button", { name: "Tout refuser" }));

    const raw = window.localStorage.getItem(getConsentStorageKey());
    const consent = JSON.parse(raw as string);
    expect(consent.categories.analytics).toBe(false);
    expect(consent.categories.marketing).toBe(false);
  });

  it("opens preferences and saves custom values", () => {
    render(<CookieConsentLayer />);

    fireEvent.click(screen.getByRole("button", { name: "Personnaliser" }));
    expect(screen.getByText("Preferences cookies")).toBeTruthy();

    const analyticsCheckbox = screen.getByRole("checkbox", { name: /analytics/i });
    fireEvent.click(analyticsCheckbox);

    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));

    const raw = window.localStorage.getItem(getConsentStorageKey());
    const consent = JSON.parse(raw as string);
    expect(consent.categories.analytics).toBe(true);
    expect(consent.categories.marketing).toBe(false);
  });

  it("reopens preferences from persistent button", () => {
    render(<CookieConsentLayer />);

    fireEvent.click(screen.getByRole("button", { name: "Gerer mes cookies" }));
    expect(screen.getByText("Preferences cookies")).toBeTruthy();
  });
});
