import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(__dirname, "../../..");
const read = (path: string) => readFileSync(resolve(repoRoot, path), "utf8");

// Google (ecran de consentement OAuth de l'import Google Photos) lit le HTML
// brut de la page: elle doit exister en statique, sans JavaScript.
describe("regles de confidentialite", () => {
  const html = read("client/public/voyage/confidentialite.html");

  it("sont du HTML statique complet, en francais et en anglais", () => {
    expect(html).not.toContain("<script");
    expect(html).toContain("Règles de confidentialité");
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("photospicker.mediaitems.readonly");
    expect(html).toContain("Limited Use requirements");
  });

  it("sont servies a l'adresse donnee a Google", () => {
    expect(read("client/nginx/default.conf")).toMatch(
      /location = \/voyage\/confidentialite \{\s*try_files \/voyage\/confidentialite\.html =404;/,
    );
  });
});
