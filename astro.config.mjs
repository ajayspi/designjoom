import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// configFile:false — the Figma Make vite.config.ts (React plugin + dev-only Figma plugins)
// must not leak into Astro's Vite instance. Tailwind is wired here explicitly instead.
export default defineConfig({
  site: "https://www.designjoom.com",
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()], configFile: false },
});
