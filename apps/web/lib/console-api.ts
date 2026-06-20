import {
  type ConsoleApiClient,
  ConsoleApiError,
  ConsoleApiNetworkError,
  ConsoleApiTimeoutError,
  createConsoleApiClient,
} from "@repo/api-client";
import {
  type ApiDevSimulation,
  isApiDevSimulationActive,
  serializeApiDevSimulation,
} from "./api-dev-simulation";
import { markMockFallbackUsed } from "./console-degradation";

/** Header carrying the dev simulation config to the mock API route handlers. */
export const API_DEV_SIMULATION_HEADER = "x-api-dev-simulation";

/** Base URL for the B2B API when wired; optional in this frontend-only template. */
export function getConsoleApiBaseUrl(): string | undefined {
  const v = process.env.NEXT_PUBLIC_API_URL;
  return typeof v === "string" && v.trim() !== "" ? v.replace(/\/$/, "") : undefined;
}

/**
 * Forwards the dev simulation to the (mock) API via header so faults are reproduced
 * on the real HTTP path. Network faults abort client-side because a network failure
 * by definition never reaches the server.
 */
function createSimulationFetch(simulation: ApiDevSimulation): typeof fetch {
  return async (input, init) => {
    if (simulation.fault === "network") {
      throw new TypeError("simulated network failure");
    }
    const headers = new Headers(init?.headers);
    headers.set(API_DEV_SIMULATION_HEADER, serializeApiDevSimulation(simulation));
    return fetch(input, { ...init, headers });
  };
}

export function getConsoleApiClient(simulation?: ApiDevSimulation): ConsoleApiClient | null {
  const baseUrl = getConsoleApiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  if (simulation && isApiDevSimulationActive(simulation)) {
    return createConsoleApiClient({ baseUrl, fetchImpl: createSimulationFetch(simulation) });
  }
  return createConsoleApiClient({ baseUrl });
}

/** Like {@link getConsoleApiClient} but for call sites that already verified the base URL is set. */
export function requireConsoleApiClient(simulation?: ApiDevSimulation): ConsoleApiClient {
  const client = getConsoleApiClient(simulation);
  if (!client) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return client;
}

/** Transient failures (5xx / timeout / network) are eligible for graceful degradation to mock data. */
export function isTransientApiError(error: unknown): boolean {
  if (error instanceof ConsoleApiTimeoutError || error instanceof ConsoleApiNetworkError) {
    return true;
  }
  return error instanceof ConsoleApiError && error.status >= 500;
}

/**
 * Graceful degradation: serves the mock snapshot when the API fails transiently
 * (the `ApiStatusBanner` health check surfaces the outage to the user).
 * Non-transient errors (4xx, contract violations) still propagate.
 */
export async function withMockFallback<T>(fetcher: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await fetcher();
  } catch (error) {
    if (isTransientApiError(error)) {
      console.warn("[console-api] transient API failure; serving mock fallback", error);
      markMockFallbackUsed();
      return fallback();
    }
    throw error;
  }
}
