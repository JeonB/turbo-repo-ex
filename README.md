# Turborepo — Monorepo with shared UI

This Turborepo includes a shared design system (`@repo/ui`), a main web app, a documentation site, and Storybook for component development.

## What's inside?

### Apps

| App           | Description                                                                                                       | Dev port |
| ------------- | ----------------------------------------------------------------------------------------------------------------- | -------- |
| **web**       | Main Next.js app. Uses `@repo/ui` for all UI (Header, Footer, hero, cards).                                       | 3001     |
| **docs**      | Documentation site. Sidebar nav: Introduction, Getting started, Monorepo, Packages/UI, Component reference, Apps. | 3000     |
| **storybook** | UI component stories (Alert, Avatar, Badge, Button, Card, Gradient, TurborepoLogo).                               | 6006     |

### Packages

- **@repo/ui** — Shared React components and styles (Tailwind with `ui:` prefix). Used by web and docs.
- **@repo/tailwind-config** — Shared Tailwind theme (e.g. `blue-1000`, `red-1000`).
- **@repo/typescript-config** — Shared `tsconfig` presets.
- **@repo/eslint-config** — Shared ESLint config.

## Quick start

```sh
pnpm install
pnpm build   # build packages then apps
pnpm dev     # run all apps in dev (or run per app, see below)
```

### Run apps individually

```sh
# Web (main app)
pnpm --filter web dev          # http://localhost:3001

# Docs
pnpm --filter docs dev         # http://localhost:3000

# Storybook
pnpm --filter storybook dev    # http://localhost:6006
```

From the **web** app, the "Docs" and "Get started" links point to the docs app. By default they use `http://localhost:3000`. To use a different docs URL (e.g. same host or production), set the environment variable in the web app:

```sh
# apps/web
NEXT_PUBLIC_DOCS_URL=https://docs.example.com   # or "" for same-origin /docs
```

See [.env.example](.env.example) for a template.

## Using @repo/ui

In any app that depends on `@repo/ui`:

```ts
import "@repo/ui/styles.css";
import { Button, Card } from "@repo/ui"; // barrel import
// or
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
```

Components support an optional `className` prop for layout/spacing. Build the UI package from the repo root or from `packages/ui`:

```sh
pnpm --filter @repo/ui build
```

## Adding a new UI component

1. Add the component in `packages/ui/src/` and export it from `packages/ui/src/index.ts`.
2. Add a story in `apps/storybook/stories/<Name>.stories.tsx`.
3. Add the Vite alias in `apps/storybook/.storybook/main.ts` (or rely on the automated alias list if configured).

## Tech stack

- [Turborepo](https://turbo.build/)
- [Next.js](https://nextjs.org/) (web, docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Storybook](https://storybook.js.org/) (React + Vite)
- [TypeScript](https://www.typescriptlang.org/)
- [ESLint](https://eslint.org/)
