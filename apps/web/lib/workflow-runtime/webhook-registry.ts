import type { WorkflowDefinition } from "../workflow/types";

export type WebhookWorkflowCandidate = {
  id: string;
  status: "active" | "paused" | "draft";
  definition: WorkflowDefinition;
};

export function normalizeWebhookPath(pathOrSegments: string | string[]): string {
  const raw = Array.isArray(pathOrSegments)
    ? pathOrSegments.join("/")
    : pathOrSegments.replace(/^\/+/, "");
  const trimmed = raw.replace(/^\/+|\/+$/g, "");
  if (!trimmed || trimmed === "hooks") {
    return "/hooks";
  }
  if (trimmed.startsWith("hooks/")) {
    return `/${trimmed}`;
  }
  return `/hooks/${trimmed}`;
}

export function extractTriggerWebhookPath(definition: WorkflowDefinition): string | null {
  const triggerNode = definition.nodes.find((node) => node.type === "trigger");
  const trigger = triggerNode?.data.trigger;
  if (trigger?.kind !== "webhook") {
    return null;
  }
  return normalizeWebhookPath(trigger.path ?? "/hooks/inbound");
}

export function findActiveWorkflowByWebhookPath(
  workflows: WebhookWorkflowCandidate[],
  requestPath: string | string[],
): WebhookWorkflowCandidate | null {
  const normalized = normalizeWebhookPath(requestPath);
  const matches = workflows.filter((workflow) => {
    if (workflow.status !== "active") {
      return false;
    }
    const webhookPath = extractTriggerWebhookPath(workflow.definition);
    return webhookPath === normalized;
  });

  if (matches.length === 0) {
    return null;
  }

  return matches.sort((a, b) => a.id.localeCompare(b.id))[0] ?? null;
}

export function findWebhookPathConflict(
  workflows: WebhookWorkflowCandidate[],
  workflowId: string,
  definition: WorkflowDefinition,
): WebhookWorkflowCandidate | null {
  const path = extractTriggerWebhookPath(definition);
  if (!path) {
    return null;
  }

  const conflict = workflows.find(
    (workflow) =>
      workflow.id !== workflowId &&
      workflow.status === "active" &&
      extractTriggerWebhookPath(workflow.definition) === path,
  );

  return conflict ?? null;
}
