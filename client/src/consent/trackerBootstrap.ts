import { canRun, subscribeConsent } from "./consentManager";

function applyConsentGating() {
  if (canRun("analytics")) {
    // Reserved for future analytics bootstrap.
  }

  if (canRun("marketing")) {
    // Reserved for future marketing bootstrap.
  }
}

export function initializeConsentGatedBootstraps(): () => void {
  applyConsentGating();
  return subscribeConsent(() => {
    applyConsentGating();
  });
}
