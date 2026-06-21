import type { RunStatus } from "@repo/api-client";
import type { RunStep } from "@repo/ui/step-log-panel";
import type { ResourceStore } from "../resource-store";
import type { WorkflowDefinition, NodeRunStatus } from "../workflow/types";
import { defaultLabel } from "../workflow/types";
import { createExecutionContext, type ExecutionContext } from "./context";
import { runNodeHandler } from "./node-handlers";
import { topologicalOrder } from "./topological";

export type ExecuteWorkflowServerResult = {
  steps: RunStep[];
  nodeStatuses: Record<string, NodeRunStatus>;
  warnings: string[];
  status: RunStatus;
  httpResponse?: { statusCode: number; body: unknown };
};

export async function executeWorkflowOnServer(
  definition: WorkflowDefinition,
  options?: {
    payload?: Record<string, unknown>;
    resources?: ResourceStore;
  },
): Promise<ExecuteWorkflowServerResult> {
  const { getResourceStore } = await import("../resource-store");
  const resources = options?.resources ?? getResourceStore();
  const { ordered, warnings } = topologicalOrder(definition);
  const steps: RunStep[] = [];
  const nodeStatuses: Record<string, NodeRunStatus> = {};
  const ctx: ExecutionContext = createExecutionContext(options?.payload);
  const startedMs = Date.now();
  let httpResponse: { statusCode: number; body: unknown } | undefined;
  let failed = false;

  for (const node of definition.nodes) {
    nodeStatuses[node.id] = "idle";
  }

  for (let i = 0; i < ordered.length; i++) {
    const node = ordered[i];
    if (!node || failed) continue;

    nodeStatuses[node.id] = "running";
    const startedAt = new Date(startedMs + i * 50).toISOString();

    try {
      const result = await runNodeHandler(node, ctx, resources);
      if (result.patch) {
        Object.assign(ctx, result.patch);
      }
      if (result.httpResponse) {
        httpResponse = result.httpResponse;
      }

      steps.push({
        id: `step_${node.id}`,
        title: node.data.label || defaultLabel(node.type),
        message: result.message,
        level: result.level,
        startedAt,
      });

      if (result.level === "error") {
        nodeStatuses[node.id] = "error";
        failed = true;
        break;
      }
      nodeStatuses[node.id] = "done";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      steps.push({
        id: `step_${node.id}`,
        title: node.data.label || defaultLabel(node.type),
        message,
        level: "error",
        startedAt,
      });
      nodeStatuses[node.id] = "error";
      failed = true;
      break;
    }
  }

  const status: RunStatus = failed ? "failed" : "succeeded";

  return {
    steps,
    nodeStatuses,
    warnings,
    status,
    httpResponse:
      httpResponse ??
      (status === "succeeded" ? { statusCode: 200, body: { ok: true } } : undefined),
  };
}
