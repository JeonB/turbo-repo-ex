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

function isTestRuntime(): boolean {
  return process.env.NODE_ENV === "test";
}

function resolveDegradationState(): ConsoleDegradationState {
  if (isTestRuntime()) {
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
  if (isTestRuntime()) {
    vitestDegradationState = { usedMockFallback: false };
  }
}
