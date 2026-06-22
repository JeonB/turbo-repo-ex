import { describe, expect, it } from "vitest";
import { defaultNodeData } from "../workflow/types";
import {
  extractTriggerWebhookPath,
  findActiveWorkflowByWebhookPath,
  findWebhookPathConflict,
  normalizeWebhookPath,
} from "./webhook-registry";

describe("webhook-registry", () => {
  it("normalizes webhook paths consistently", () => {
    expect(normalizeWebhookPath("leads")).toBe("/hooks/leads");
    expect(normalizeWebhookPath("/hooks/leads")).toBe("/hooks/leads");
    expect(normalizeWebhookPath(["hooks", "leads"])).toBe("/hooks/leads");
    expect(normalizeWebhookPath(["leads"])).toBe("/hooks/leads");
  });

  it("resolves active workflows by webhook path", () => {
    const definition = {
      version: 1 as const,
      nodes: [
        {
          id: "n1",
          type: "trigger" as const,
          position: { x: 0, y: 0 },
          data: {
            ...defaultNodeData("trigger"),
            trigger: { kind: "webhook" as const, path: "/hooks/leads" },
          },
        },
      ],
      edges: [],
    };

    const active = findActiveWorkflowByWebhookPath(
      [{ id: "wf_a", status: "active", definition }],
      "leads",
    );
    expect(active?.id).toBe("wf_a");
    expect(extractTriggerWebhookPath(definition)).toBe("/hooks/leads");
  });

  it("detects webhook path conflicts among active workflows", () => {
    const definition = {
      version: 1 as const,
      nodes: [
        {
          id: "n1",
          type: "trigger" as const,
          position: { x: 0, y: 0 },
          data: {
            ...defaultNodeData("trigger"),
            trigger: { kind: "webhook" as const, path: "/hooks/leads" },
          },
        },
      ],
      edges: [],
    };

    const conflict = findWebhookPathConflict(
      [{ id: "wf_existing", status: "active", definition }],
      "wf_new",
      definition,
    );
    expect(conflict?.id).toBe("wf_existing");
  });
});
