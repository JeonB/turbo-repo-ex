import { beforeEach, describe, expect, it } from "vitest";
import {
  getConsoleDegradationState,
  markMockFallbackUsed,
  resetConsoleDegradationStateForTests,
} from "./console-degradation";

describe("console-degradation", () => {
  beforeEach(() => {
    resetConsoleDegradationStateForTests();
  });

  it("marks mock fallback usage", () => {
    expect(getConsoleDegradationState().usedMockFallback).toBe(false);
    markMockFallbackUsed();
    expect(getConsoleDegradationState().usedMockFallback).toBe(true);
  });
});
