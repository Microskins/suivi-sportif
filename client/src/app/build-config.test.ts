import { describe, expect, it } from "vitest";
import viteConfig from "../../vite.config";

type AssetNamer = (asset: { names: string[] }) => string;

describe("configuration du build", () => {
  // Regression: le worker MapLibre en `.mjs` etait servi en
  // application/octet-stream par le Nginx de production (extension absente
  // de mime.types) et aucune carte ne s'affichait.
  it("publie les modules .mjs (worker MapLibre) avec l'extension .js", () => {
    const config = viteConfig({ command: "build", mode: "production" });
    const output = config.build?.rolldownOptions?.output;
    const namer = (Array.isArray(output) ? output[0] : output)
      ?.assetFileNames as AssetNamer;

    expect(namer({ names: ["maplibre-gl-worker.mjs"] })).toBe(
      "assets/[name]-[hash].js",
    );
    expect(namer({ names: ["styles.css"] })).toBe(
      "assets/[name]-[hash][extname]",
    );
  });
});
