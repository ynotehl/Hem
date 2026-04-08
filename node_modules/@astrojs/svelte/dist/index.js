import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { createSvelteOptimizeEsbuildPlugins } from "./optimize-esbuild-plugins.js";
function getRenderer() {
  return {
    name: "@astrojs/svelte",
    clientEntrypoint: "@astrojs/svelte/client.js",
    serverEntrypoint: "@astrojs/svelte/server.js"
  };
}
function svelteIntegration(options) {
  return {
    name: "@astrojs/svelte",
    hooks: {
      "astro:config:setup": async ({ updateConfig, addRenderer }) => {
        addRenderer(getRenderer());
        updateConfig({
          vite: {
            plugins: [svelte(options), configEnvironmentPlugin()]
          }
        });
      }
    }
  };
}
function configEnvironmentPlugin() {
  return {
    name: "@astrojs/svelte:config-environment",
    configEnvironment(environmentName, options) {
      if (environmentName === "client" || (environmentName === "ssr" || environmentName === "prerender") && options.optimizeDeps?.noDiscovery === false) {
        const isServer = environmentName !== "client";
        return {
          optimizeDeps: {
            include: isServer ? ["svelte/server", "svelte/internal/server"] : ["@astrojs/svelte/client.js"],
            exclude: isServer ? ["@astrojs/svelte/server.js"] : [],
            ...isServer ? {
              esbuildOptions: {
                plugins: createSvelteOptimizeEsbuildPlugins("server")
              }
            } : {}
          }
        };
      }
    }
  };
}
export {
  svelteIntegration as default,
  getRenderer as getContainerRenderer,
  vitePreprocess
};
