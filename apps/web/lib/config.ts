/** Base URL for the docs app. Set NEXT_PUBLIC_DOCS_URL when docs is on another origin (e.g. "" for same-host /docs). */
export const DOCS_BASE =
  typeof process.env.NEXT_PUBLIC_DOCS_URL === "string"
    ? process.env.NEXT_PUBLIC_DOCS_URL.replace(/\/$/, "")
    : "http://localhost:3000";
