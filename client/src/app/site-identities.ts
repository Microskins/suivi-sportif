export type SiteId =
  | "portfolio"
  | "prix-aliments"
  | "suivi-sportif"
  | "trekking"
  | "voyage";

type SiteIdentity = {
  description: string;
  faviconPath: string;
  id: SiteId;
  pwa?: {
    appleTouchIconPath: string;
    manifestPath: string;
    maskColor: string;
    maskIconPath: string;
  };
  socialImagePath?: string;
  themeColor: string;
  title: string;
};

export const SITE_IDENTITIES: Record<SiteId, SiteIdentity> = {
  portfolio: {
    description:
      "Une selection de projets web utiles, lisibles et construits avec attention.",
    faviconPath: "/sites/portfolio/favicon.svg",
    id: "portfolio",
    themeColor: "#efe7d8",
    title: "Portfolio - Projets web choisis",
  },
  "prix-aliments": {
    description:
      "Comparez le prix de vos aliments chez Carrefour, Intermarché, ALDI et Colruyt.",
    faviconPath: "/sites/prix-aliments/favicon.svg",
    id: "prix-aliments",
    themeColor: "#e9e6dc",
    title: "Prix Frais - Comparateur de prix alimentaires",
  },
  "suivi-sportif": {
    description:
      "Entrainements, nutrition et progression corporelle dans un seul espace.",
    faviconPath: "/sites/suivi-sportif/favicon.svg",
    id: "suivi-sportif",
    pwa: {
      appleTouchIconPath: "/sites/suivi-sportif/apple-touch-icon.png",
      manifestPath: "/sites/suivi-sportif/site.webmanifest",
      maskColor: "#ff7a54",
      maskIconPath: "/sites/suivi-sportif/safari-pinned-tab.svg",
    },
    socialImagePath: "/sites/suivi-sportif/og-image.png",
    themeColor: "#fff8f2",
    title: "Suivi Sportif - Entraine. Mesure. Ajuste.",
  },
  trekking: {
    description:
      "Carnets de marche, itineraires et preparation de treks en pleine nature.",
    faviconPath: "/sites/trekking/favicon.svg",
    id: "trekking",
    socialImagePath: "/sites/trekking/vosges-wild-hero.png",
    themeColor: "#f1e2c4",
    title: "Trekking - Carnets de marche",
  },
  voyage: {
    description:
      "Trajets, etapes et reservations reunis dans des carnets de voyage clairs.",
    faviconPath: "/sites/voyage/favicon.svg",
    id: "voyage",
    themeColor: "#0f1b2b",
    title: "Voyage - Carnets de depart",
  },
};

export function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function siteIdFromPath(pathname: string): SiteId {
  const currentPath = normalizePathname(pathname);

  if (
    currentPath === "/prix-aliments" ||
    currentPath.startsWith("/prix-aliments/")
  ) {
    return "prix-aliments";
  }

  if (
    currentPath === "/suivi-sportif" ||
    currentPath.startsWith("/suivi-sportif/")
  ) {
    return "suivi-sportif";
  }

  if (currentPath === "/trekking" || currentPath.startsWith("/trekking/")) {
    return "trekking";
  }

  if (currentPath === "/voyage" || currentPath.startsWith("/voyage/")) {
    return "voyage";
  }

  return "portfolio";
}

function setMetaContent(selector: string, content: string) {
  const meta = document.querySelector<HTMLMetaElement>(selector);
  if (meta) {
    meta.content = content;
  }
}

function setOptionalMetaContent(
  selector: string,
  attributeName: "name" | "property",
  attributeValue: string,
  content?: string,
) {
  const existingMeta = document.querySelector<HTMLMetaElement>(selector);

  if (!content) {
    existingMeta?.remove();
    return;
  }

  const meta = existingMeta ?? document.createElement("meta");
  meta.setAttribute(attributeName, attributeValue);
  meta.content = content;

  if (!existingMeta) {
    document.head.append(meta);
  }
}

function setOptionalLink(
  id: string,
  rel: string,
  href?: string,
  attributes: Record<string, string> = {},
) {
  const existingLink = document.querySelector<HTMLLinkElement>(`#${id}`);

  if (!href) {
    existingLink?.remove();
    return;
  }

  const link = existingLink ?? document.createElement("link");
  link.id = id;
  link.rel = rel;
  link.href = href;
  Object.entries(attributes).forEach(([name, value]) => {
    link.setAttribute(name, value);
  });

  if (!existingLink) {
    document.head.append(link);
  }
}

export function applySiteIdentity(pathname: string) {
  const identity = SITE_IDENTITIES[siteIdFromPath(pathname)];
  const favicon = document.querySelector<HTMLLinkElement>("#site-icon");

  document.documentElement.dataset.site = identity.id;
  document.title = identity.title;
  setMetaContent('meta[name="description"]', identity.description);
  setMetaContent('meta[name="theme-color"]', identity.themeColor);
  setMetaContent('meta[property="og:title"]', identity.title);
  setMetaContent('meta[property="og:description"]', identity.description);
  setMetaContent('meta[name="twitter:title"]', identity.title);
  setMetaContent('meta[name="twitter:description"]', identity.description);
  setOptionalMetaContent(
    'meta[property="og:image"]',
    "property",
    "og:image",
    identity.socialImagePath,
  );
  setOptionalMetaContent(
    'meta[name="twitter:image"]',
    "name",
    "twitter:image",
    identity.socialImagePath,
  );
  setOptionalLink(
    "site-apple-touch-icon",
    "apple-touch-icon",
    identity.pwa?.appleTouchIconPath,
    { sizes: "180x180" },
  );
  setOptionalLink("site-mask-icon", "mask-icon", identity.pwa?.maskIconPath, {
    color: identity.pwa?.maskColor ?? "",
  });
  setOptionalLink("site-manifest", "manifest", identity.pwa?.manifestPath);

  if (favicon) {
    favicon.href = identity.faviconPath;
  }
}
