import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "@styles": resolve(__dirname, "./app/styles"),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@styles/_config.scss" as *; @use "@styles/_mixins.scss" as *;`,
      },
    },
  },
  build: {
    sourcemap: false,
    cssCodeSplit: true,
  },
  // Environment variables з VITE_ префіксом автоматично доступні
});
