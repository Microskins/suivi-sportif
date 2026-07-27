import { useEffect } from "react";
import { Dashboard } from "./components/dashboard";
import {
  SuiviSportifAuthScreen,
  SuiviSportifLoadingScreen,
} from "./components/auth/auth-screen";
import { CookieConsentLayer } from "./components/privacy/cookie-consent-layer";
import { CookiePolicyPage } from "./components/privacy/cookie-policy-page";
import { useAuthStore } from "./stores/auth-store";

const isAuthBypassEnabled = import.meta.env.VITE_BYPASS_AUTH === "true";
const SPORT_APP_PATH = "/suivi-sportif";
const COOKIE_POLICY_PATH = `${SPORT_APP_PATH}/politique-cookies`;

export function SuiviSportifSite() {
  const isPolicyPage = window.location.pathname === COOKIE_POLICY_PATH;
  const {
    user,
    isAuthenticated,
    isInitializing,
    isLoading,
    error,
    initializeAuth,
    updateProfile,
    logout,
  } = useAuthStore();

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  if (isPolicyPage) {
    return (
      <>
        <CookiePolicyPage />
        <CookieConsentLayer />
      </>
    );
  }

  if (isInitializing) {
    return (
      <>
        <SuiviSportifLoadingScreen />
        <CookieConsentLayer />
      </>
    );
  }

  if (isAuthenticated && user) {
    return (
      <>
        <Dashboard
          userName={user.name}
          userEmail={user.email}
          userDateOfBirth={user.dateOfBirth}
          onUpdateProfile={updateProfile}
          onLogout={logout}
          isProfileSaving={isLoading}
          profileError={error}
          isAuthBypassEnabled={isAuthBypassEnabled}
        />
        <CookieConsentLayer />
      </>
    );
  }

  return (
    <>
      <SuiviSportifAuthScreen />
      <CookieConsentLayer />
    </>
  );
}
