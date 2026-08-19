import { PortfolioSite } from "../sites/portfolio/portfolio-site";
import { PriceComparisonSite } from "../sites/prix-aliments/price-comparison-site";
import { SuiviSportifSite } from "../sites/suivi-sportif/suivi-sportif-site";
import { TrekkingHomeSite } from "../sites/trekking/trekking-home-site";
import { VosgesWildSite } from "../sites/trekking/vosges-wild-site";
import { IslandeTripSite } from "../sites/voyage/islande-trip-site";
import { VoyageHomeSite } from "../sites/voyage/voyage-home-site";
import { normalizePathname, siteIdFromPath } from "./site-identities";
import { SkipLink } from "./skip-link";

const TREKKING_PATH = "/trekking";
const VOSGES_WILD_PATH = `${TREKKING_PATH}/vosges-wild`;
const VOYAGE_PATH = "/voyage";
const ISLANDE_PATH = `${VOYAGE_PATH}/islande-2026`;

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
    return currentPath === ISLANDE_PATH ? (
      <IslandeTripSite />
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
