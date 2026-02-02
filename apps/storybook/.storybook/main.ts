// This file has been automatically migrated to valid ESM format by Storybook.
import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Resolve the absolute path of a package (for addons/framework).
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

/** Build @repo/ui/* aliases from packages/ui/src/*.tsx so new components are picked up automatically. */
function getRepoUiAliases(): Record<string, string> {
  const uiSrc = path.resolve(__dirname, "../../../packages/ui/src");
  const entries: Record<string, string> = {};
  if (!fs.existsSync(uiSrc)) return entries;
  for (const name of fs.readdirSync(uiSrc)) {
    if (!name.endsWith(".tsx")) continue;
    const key = `@repo/ui/${name.replace(/\.tsx$/, "")}`;
    entries[key] = path.resolve(uiSrc, name);
  }
  return entries;
}

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.mdx",
    "../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: getAbsolutePath("@storybook/react-vite"),
  async viteFinal(config) {
    return {
      ...config,
      plugins: [...(config.plugins ?? []), tailwindcss()],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          ...getRepoUiAliases(),
        },
      },
    };
  },
};

export default config;
