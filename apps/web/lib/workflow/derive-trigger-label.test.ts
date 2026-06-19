import { describe, expect, it } from "vitest";
import { defaultNodeData } from "./types";
import { deriveTriggerLabel } from "./derive-trigger-label";
import type { WorkflowDefinition } from "./types";

function definitionWithTrigger(
  trigger: NonNullable<ReturnType<typeof defaultNodeData>["trigger"]>,
): WorkflowDefinition {
  return {
    version: 1,
    nodes: [
      {
        id: "n_trigger",
        type: "trigger",
        position: { x: 0, y: 0 },
        data: { ...defaultNodeData("trigger"), trigger },
      },
    ],
    edges: [],
  };
}

describe("deriveTriggerLabel", () => {
  it("maps webhook paths to dotted slug without hooks prefix", () => {
    expect(
      deriveTriggerLabel(
        definitionWithTrigger({ kind: "webhook", path: "/hooks/lead.created" }),
      ),
    ).toBe("webhook.lead.created");
  });

  it("maps daily cron to schedule.daily.09", () => {
    expect(
      deriveTriggerLabel(definitionWithTrigger({ kind: "schedule", schedule: "0 9 * * *" })),
    ).toBe("schedule.daily.09");
  });

  it("maps event names to event.*", () => {
    expect(
      deriveTriggerLabel(definitionWithTrigger({ kind: "event", eventName: "trial.started" })),
    ).toBe("event.trial.started");
  });
});
