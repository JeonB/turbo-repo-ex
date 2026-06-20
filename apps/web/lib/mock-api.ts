import { DEFAULT_REQUEST_TIMEOUT_MS } from "@repo/api-client";
import {
  API_DEV_SIMULATION_COOKIE,
  type ApiDevSimulation,
  DEFAULT_API_DEV_SIMULATION,
  delayMs,
  parseApiDevSimulation,
} from "./api-dev-simulation";
import { API_DEV_SIMULATION_HEADER } from "./console-api";

/**
 * CDN-friendly caching for org-common mock endpoints: edge serves stale copies
 * while revalidating, so traffic spikes are absorbed before the origin.
 */
export const MOCK_API_SWR_CACHE_CONTROL = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

/** Endpoints whose payload changes per request/often enough that caching would mislead. */
export const MOCK_API_NO_STORE = "no-store";

/** Held longer than the api-client default timeout so a real client-side timeout fires. */
const TIMEOUT_FAULT_HOLD_MS = DEFAULT_REQUEST_TIMEOUT_MS + 1_000;

/**
 * Resolves the dev simulation for a mock API request. Server-to-server calls carry it
 * via the `x-api-dev-simulation` header (cookies are not forwarded by the api-client);
 * direct browser calls fall back to the simulation cookie. Disabled in production.
 */
export function readMockApiSimulation(headers: Headers): ApiDevSimulation {
  if (process.env.NODE_ENV === "production") {
    return DEFAULT_API_DEV_SIMULATION;
  }
  const headerValue = headers.get(API_DEV_SIMULATION_HEADER);
  if (headerValue) {
    return parseApiDevSimulation(headerValue);
  }
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) {
    return DEFAULT_API_DEV_SIMULATION;
  }
  const prefix = `${API_DEV_SIMULATION_COOKIE}=`;
  const pair = cookieHeader.split(/;\s*/).find((part) => part.startsWith(prefix));
  if (!pair) {
    return DEFAULT_API_DEV_SIMULATION;
  }
  try {
    return parseApiDevSimulation(decodeURIComponent(pair.slice(prefix.length)));
  } catch {
    return DEFAULT_API_DEV_SIMULATION;
  }
}

function mockApiError(status: number, message: string): Response {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": MOCK_API_NO_STORE } },
  );
}

/**
 * Applies the dev simulation at the HTTP boundary (delay, then fault).
 * Returns a fault Response to short-circuit with, or null to continue serving data.
 */
export async function applyMockApiSimulation(headers: Headers): Promise<Response | null> {
  const simulation = readMockApiSimulation(headers);
  if (simulation.delayMs > 0) {
    await delayMs(simulation.delayMs);
  }
  switch (simulation.fault) {
    case "none":
      return null;
    case "503":
      return mockApiError(503, "simulated service unavailable");
    case "timeout":
      // Hold the response beyond the client timeout so the caller aborts first.
      await delayMs(TIMEOUT_FAULT_HOLD_MS);
      return mockApiError(504, "simulated upstream timeout");
    case "network":
      // Network faults abort client-side before the request leaves; reaching here means
      // a direct browser call, so answer with the closest HTTP equivalent.
      return mockApiError(503, "simulated network failure");
    default: {
      const _exhaustive: never = simulation.fault;
      return mockApiError(500, `unknown fault: ${String(_exhaustive)}`);
    }
  }
}

export function mockApiJson(
  data: unknown,
  options?: { cacheControl?: string; status?: number },
): Response {
  return Response.json(data, {
    status: options?.status ?? 200,
    headers: { "Cache-Control": options?.cacheControl ?? MOCK_API_SWR_CACHE_CONTROL },
  });
}
