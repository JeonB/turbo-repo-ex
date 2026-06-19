import { describe, expect, it } from "vitest";
import { mergeWorkflowLists } from "./merge-workflows";
import type { Workflow } from "@repo/api-client";

const base = (id: string, updatedAt: string, name: string): Workflow => ({
  id,
  name,
  trigger: "webhook.test",
  status: "draft",
  updatedAt,
});

describe("mergeWorkflowLists", () => {
  it("includes local-only workflows", () => {
    const api = [base("wf_a", "2026-01-01T00:00:00.000Z", "API")];
    const local = [base("wf_b", "2026-01-02T00:00:00.000Z", "Local only")];
    const merged = mergeWorkflowLists(api, local);
    expect(merged.map((w) => w.id).sort()).toEqual(["wf_a", "wf_b"]);
  });

  it("prefers newer local entry for the same id", () => {
    const api = [base("wf_a", "2026-01-01T00:00:00.000Z", "API name")];
    const local = [base("wf_a", "2026-01-03T00:00:00.000Z", "Edited locally")];
    const merged = mergeWorkflowLists(api, local);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.name).toBe("Edited locally");
  });
});
