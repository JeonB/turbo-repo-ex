import type { ConsoleApiClient } from "@repo/api-client";
import { applyApiDevSimulation, isApiDevSimulationActive } from "./api-dev-simulation";
import { readApiDevSimulation } from "./api-dev-simulation-server";
import { getConsoleApiBaseUrl, requireConsoleApiClient, withMockFallback } from "./console-api";

/** Revalidation window for org-common console data cached with `unstable_cache`. */
export const CONSOLE_DATA_REVALIDATE_SECONDS = 30;

/** Cache tag shared by all cached console data (revalidate via `revalidateTag`). */
export const CONSOLE_DATA_CACHE_TAG = "console-data";

type ConsoleDataOptions<T> = {
  /**
   * Fetch on the normal API path. Wrap with `unstable_cache` at module scope so
   * traffic spikes hit the cache instead of the origin once per revalidation window.
   */
  fetchCached: () => Promise<T>;
  /** Direct fetch while dev simulation is active (bypasses cache, carries the simulation header). */
  fetchLive: (client: ConsoleApiClient) => Promise<T>;
  /** In-memory mock used when no API URL is set, and as graceful-degradation fallback. */
  mockFallback: () => T;
};

/**
 * Unified data access for console domains:
 * - No `NEXT_PUBLIC_API_URL` → mock data (dev simulation faults still throw to demo error boundaries).
 * - API URL set → cached fetch with graceful degradation to mock on transient failures.
 * - Dev simulation active → uncached fetch carrying the simulation header, so the
 *   real HTTP path (timeout, retry, Zod parse) is exercised end-to-end.
 */
export async function getConsoleData<T>(options: ConsoleDataOptions<T>): Promise<T> {
  const simulation = await readApiDevSimulation();

  if (!getConsoleApiBaseUrl()) {
    return applyApiDevSimulation(simulation, async () => options.mockFallback());
  }

  if (isApiDevSimulationActive(simulation)) {
    const client = requireConsoleApiClient(simulation);
    return withMockFallback(() => options.fetchLive(client), options.mockFallback);
  }

  return withMockFallback(options.fetchCached, options.mockFallback);
}
