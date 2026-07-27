import { PortfolioSite } from "../sites/portfolio/portfolio-site";
import { SuiviSportifSite } from "../sites/suivi-sportif/suivi-sportif-site";
import { TrekkingHomeSite } from "../sites/trekking/trekking-home-site";
import { VosgesWildSite } from "../sites/trekking/vosges-wild-site";
import { normalizePathname, siteIdFromPath } from "./site-identities";

const TREKKING_PATH = "/trekking";
const VOSGES_WILD_PATH = `${TREKKING_PATH}/vosges-wild`;

export default function SiteRouter() {
  const currentPath = normalizePathname(window.location.pathname);
  const siteId = siteIdFromPath(currentPath);

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

  return <PortfolioSite />;
}
