import { cache } from "react";

export type ConsoleDegradationState = {
  usedMockFallback: boolean;
};

const getRequestScopedState = cache(
  (): ConsoleDegradationState => ({
    usedMockFallback: false,
  }),
);

let vitestDegradationState: ConsoleDegradationState | null = null;

function resolveDegradationState(): ConsoleDegradationState {
  if (process.env.VITEST === "true") {
    vitestDegradationState ??= { usedMockFallback: false };
    return vitestDegradationState;
  }
  return getRequestScopedState();
}

/** Per-request flag set when `withMockFallback` serves in-memory mock data. */
export function getConsoleDegradationState(): ConsoleDegradationState {
  return resolveDegradationState();
}

export function markMockFallbackUsed(): void {
  resolveDegradationState().usedMockFallback = true;
}

export function resetConsoleDegradationStateForTests(): void {
  if (process.env.VITEST === "true") {
    vitestDegradationState = { usedMockFallback: false };
  }
}
