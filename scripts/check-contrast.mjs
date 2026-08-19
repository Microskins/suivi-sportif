// Verifie que les tokens de couleur de chaque site respectent les seuils
// WCAG 2.1 AA.
//
// Ce controle porte sur les tokens declares dans `client/src/tokens.css`, pas
// sur le rendu: il ne remplace pas un audit dans le navigateur, mais il
// attrape la regression la plus probable, celle qui a motive le plan 075 —
// une couleur de direction artistique choisie pour son allure sans verifier
// qu'elle reste lisible.
//
// Seuils appliques (WCAG 2.1):
// - 4,5:1 pour du texte courant (1.4.3);
// - 3:1 pour un indicateur de focus ou un element d'interface (1.4.11).
import { readFile } from "node:fs/promises";
import path from "node:path";

const TOKENS = path.resolve("client", "src", "tokens.css");

function hexToRgb(hex) {
  const v = hex.replace("#", "").trim();
  const plein =
    v.length === 3
      ? v
          .split("")
          .map((c) => c + c)
          .join("")
      : v;
  return [0, 2, 4].map((i) => parseInt(plein.slice(i, i + 2), 16));
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(hexA, hexB) {
  const l1 = luminance(hexToRgb(hexA));
  const l2 = luminance(hexToRgb(hexB));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Extrait les tokens par site: le bloc `:root` porte le portfolio, chaque
// `html[data-site="..."]` porte les autres.
function parseTokens(css) {
  const sites = {};
  const blocs = [
    ...css.matchAll(/(:root|html\[data-site="([^"]+)"\])\s*\{([^}]*)\}/g),
  ];

  for (const bloc of blocs) {
    const nom = bloc[2] ?? "portfolio";
    const corps = bloc[3];
    const tokens = sites[nom] ?? (sites[nom] = {});
    for (const decl of corps.matchAll(/(--site-[\w-]+)\s*:\s*([^;]+);/g)) {
      const valeur = decl[2].trim();
      if (valeur.startsWith("#")) tokens[decl[1]] = valeur;
    }
  }

  return sites;
}

const css = await readFile(TOKENS, "utf8");
const sites = parseTokens(css);
const echecs = [];
let controles = 0;

for (const [site, t] of Object.entries(sites)) {
  // Certains sites posent leur texte sur une surface distincte du fond de
  // page (le papier du ticket pour prix-aliments). C'est cette surface qui
  // fait foi; sinon le fond de page sert de reference.
  const fond = t["--site-surface"] ?? t["--site-background"];
  if (!fond) continue;

  // Le blanc est teste en plus: cartes et panneaux sont blancs sur la
  // plupart des sites.
  const fonds = [fond, "#ffffff"];

  const regles = [
    ["--site-ink", 4.5, "encre principale"],
    ["--site-muted", 4.5, "texte secondaire"],
    ["--site-accent-text", 4.5, "accent en texte"],
    ["--site-accent-2-text", 4.5, "second accent en texte"],
    ["--site-signal", 4.5, "signal"],
    ["--site-focus", 3, "indicateur de focus"],
  ];

  for (const [token, seuil, role] of regles) {
    const couleur = t[token];
    if (!couleur) continue;
    for (const surFond of fonds) {
      controles += 1;
      const r = contrast(couleur, surFond);
      if (r < seuil) {
        echecs.push({ site, token, role, couleur, surFond, ratio: r, seuil });
      }
    }
  }

  // L'accent ne sert d'indicateur de focus que si `--site-focus` est absent.
  if (!t["--site-focus"] && t["--site-accent"]) {
    for (const surFond of fonds) {
      controles += 1;
      const r = contrast(t["--site-accent"], surFond);
      if (r < 3) {
        echecs.push({
          site,
          token: "--site-accent",
          role: "indicateur de focus (aucun --site-focus defini)",
          couleur: t["--site-accent"],
          surFond,
          ratio: r,
          seuil: 3,
        });
      }
    }
  }
}

if (echecs.length > 0) {
  console.error("Contraste insuffisant sur des tokens de direction artistique:");
  for (const e of echecs) {
    console.error(
      `- ${e.site} ${e.token} (${e.role}): ${e.couleur} sur ${e.surFond} = ${e.ratio.toFixed(2)}:1, minimum ${e.seuil}:1`,
    );
  }
  console.error(
    "Assombrir le token, ou introduire une variante dediee au texte si la teinte doit rester intacte.",
  );
  process.exitCode = 1;
} else {
  console.info(
    `Contraste respecte: ${controles} combinaisons verifiees sur ${Object.keys(sites).length} sites.`,
  );
}
