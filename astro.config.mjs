// @ts-check
import { defineConfig } from "astro/config";
import lanUrl from "./integrations/lan-url.mjs";

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:4321",
  integrations: [lanUrl()],
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
