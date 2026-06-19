import type { WorkflowDefinition } from "./types";

/**
 * Serializes a trigger node into the compact label used by workflow registry / mock API
 * (e.g. `webhook.lead.created`, `schedule.daily.09`).
 */
export function deriveTriggerLabel(definition: WorkflowDefinition): string {
  const triggerNode = definition.nodes.find((n) => n.type === "trigger");
  const trigger = triggerNode?.data.trigger;
  if (!trigger) return "manual";

  switch (trigger.kind) {
    case "webhook": {
      const normalized = (trigger.path ?? "/hooks/inbound")
        .replace(/^\/+/, "")
        .replace(/^hooks\/?/, "");
      const slug = normalized.replace(/\//g, ".") || "inbound";
      return `webhook.${slug}`;
    }
    case "schedule": {
      if (trigger.schedule === "0 9 * * *") return "schedule.daily.09";
      const safe = (trigger.schedule ?? "daily").trim().replace(/\s+/g, "_");
      return `schedule.${safe}`;
    }
    case "event":
      return `event.${trigger.eventName ?? "unknown"}`;
    default:
      return "manual";
  }
}
