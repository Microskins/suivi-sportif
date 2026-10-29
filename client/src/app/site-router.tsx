import { Suspense, lazy } from "react";
import { PortfolioSite } from "../sites/portfolio/portfolio-site";
import { PriceComparisonSite } from "../sites/prix-aliments/price-comparison-site";
import { SuiviSportifSite } from "../sites/suivi-sportif/suivi-sportif-site";
import { TrekkingHomeSite } from "../sites/trekking/trekking-home-site";
import { VosgesWildSite } from "../sites/trekking/vosges-wild-site";
import { TripSite } from "../sites/voyage/trip-site";
import { VoyageHomeSite } from "../sites/voyage/voyage-home-site";
import { normalizePathname, siteIdFromPath } from "./site-identities";
import { SkipLink } from "./skip-link";

// L'admin Voyage n'est chargee qu'a la demande: elle ne pese pas sur le
// bundle des pages publiques.
const VoyageAdminSite = lazy(() => import("../sites/voyage/admin-site"));

const TREKKING_PATH = "/trekking";
const VOSGES_WILD_PATH = `${TREKKING_PATH}/vosges-wild`;
const VOYAGE_PATH = "/voyage";
const VOYAGE_ADMIN_PATH = `${VOYAGE_PATH}/admin`;

function siteForPath(currentPath: string) {
  const siteId = siteIdFromPath(currentPath);

  if (siteId === "prix-aliments") {
    return <PriceComparisonSite />;
  }

  if (siteId === "trekking") {
    return currentPath === VOSGES_WILD_PATH ? (
      <VosgesWildSite />
    ) : (
      <TrekkingHomeSite />
    );
  }

  if (siteId === "suivi-sportif") {
    return <SuiviSportifSite />;
  }

  if (siteId === "voyage") {
    // /voyage/admin passe avant /voyage/<slug>: "admin" n'est pas un carnet.
    if (currentPath === VOYAGE_ADMIN_PATH) {
      return (
        <Suspense
          fallback={
            <p role="status" className="p-8 text-center">
              Chargement de l’administration…
            </p>
          }
        >
          <VoyageAdminSite />
        </Suspense>
      );
    }
    // /voyage/<slug>: un carnet charge depuis l'API.
    const slug = currentPath.slice(VOYAGE_PATH.length + 1);
    return slug ? (
      <TripSite slug={decodeURIComponent(slug)} />
    ) : (
      <VoyageHomeSite />
    );
  }

  return <PortfolioSite />;
}

export default function SiteRouter() {
  const currentPath = normalizePathname(window.location.pathname);

  // Le lien d'evitement precede le site pour etre le premier element
  // atteignable au clavier, quelle que soit l'identite affichee.
  return (
    <>
      <SkipLink />
      {siteForPath(currentPath)}
    </>
  );
}
