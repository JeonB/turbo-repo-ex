import type { StorybookConfig } from '@storybook/react-vite';
import tailwindcss from '@tailwindcss/vite';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
  ],
  framework: getAbsolutePath('@storybook/react-vite'),
  async viteFinal(config) {
    return {
      ...config,
      plugins: [...(config.plugins ?? []), tailwindcss()],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@repo/ui/card': path.resolve(__dirname, '../../../packages/ui/src/card.tsx'),
          '@repo/ui/gradient': path.resolve(__dirname, '../../../packages/ui/src/gradient.tsx'),
          '@repo/ui/turborepo-logo': path.resolve(
            __dirname,
            '../../../packages/ui/src/turborepo-logo.tsx'
          ),
        },
      },
    };
  },
};

export default config;