import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type PluginOption } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const plugins: PluginOption[] = [
  tsconfigPaths({ ignoreConfigErrors: true }) as PluginOption,
  tailwindcss() as PluginOption,
  tanstackRouter({}) as PluginOption,
  react() as PluginOption,
];

export default defineConfig(({ mode }) => {
  // Load env from root directory (two levels up from apps/web)
  const rootEnv = loadEnv(mode, path.resolve(__dirname, "../.."), "");
  // Load env from current directory (apps/web) - these override root
  const localEnv = loadEnv(mode, __dirname, "");

  // Merge environments, local takes precedence
  const env = { ...rootEnv, ...localEnv };

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@web": path.resolve(__dirname, "./src"),
        "@rich-text": path.resolve(
          __dirname,
          "./src/components/common/rich-text",
        ),
      },
    },
    define: {
      // Expose VITE_ prefixed vars to the client
      "import.meta.env.VITE_SERVER_URL": JSON.stringify(env.VITE_SERVER_URL),
      "import.meta.env.VITE_FRONTEND_URL": JSON.stringify(
        env.VITE_FRONTEND_URL,
      ),
    },
  };
});
