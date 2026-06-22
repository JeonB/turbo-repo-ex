import type { RunStep } from "@repo/ui/step-log-panel";
import { topologicalOrder } from "../workflow-runtime/topological";
import type { WorkflowDefinition, WorkflowNode, NodeRunStatus } from "./types";
import { defaultLabel, summarizeNodeData } from "./types";

export { topologicalOrder };

export type ExecuteWorkflowResult = {
  steps: RunStep[];
  nodeStatuses: Record<string, NodeRunStatus>;
  warnings: string[];
};

type ExecutionContext = Record<string, unknown>;

/** Browser-side simulation for the workflow editor test run. */
export function executeWorkflow(definition: WorkflowDefinition): ExecuteWorkflowResult {
  const { ordered, warnings } = topologicalOrder(definition);
  const steps: RunStep[] = [];
  const nodeStatuses: Record<string, NodeRunStatus> = {};
  const context: ExecutionContext = { payload: { demo: true } };
  const baseTime = Date.now();

  for (const node of definition.nodes) {
    nodeStatuses[node.id] = "idle";
  }

  for (let i = 0; i < ordered.length; i++) {
    const node = ordered[i];
    if (!node) continue;
    nodeStatuses[node.id] = "running";
    const startedAt = new Date(baseTime + i * 400).toISOString();

    try {
      const { message, level } = runNodeSimulated(node, context);
      context[`node_${node.id}`] = message;
      steps.push({
        id: `step_${node.id}`,
        title: node.data.label || defaultLabel(node.type),
        message,
        level,
        startedAt,
      });
      nodeStatuses[node.id] = level === "error" ? "error" : "done";
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
      break;
    }
  }

  return { steps, nodeStatuses, warnings };
}

function runNodeSimulated(
  node: WorkflowNode,
  context: ExecutionContext,
): { message: string; level: "info" | "warning" | "error" } {
  const summary = summarizeNodeData(node.type, node.data);

  switch (node.type) {
    case "trigger": {
      const kind = node.data.trigger?.kind ?? "webhook";
      return { message: `Triggered via ${kind} (${summary})`, level: "info" };
    }
    case "dbQuery": {
      const table = node.data.dbQuery?.table ?? "table";
      const preset = node.data.dbQuery?.queryPreset ?? "list_recent";
      const count =
        preset === "count" ? 42 : preset === "by_id" || preset === "update" ? 1 : preset === "delete" ? 0 : 12;
      context.rows = count;
      return { message: `Queried ${table} (${preset}): ${count} row(s)`, level: "info" };
    }
    case "transform": {
      const expr = node.data.transform?.expression ?? "map";
      context.transformed = true;
      return { message: `Applied transform: ${expr}`, level: "info" };
    }
    case "httpResponse": {
      const code = node.data.httpResponse?.statusCode ?? 200;
      return { message: `Responded HTTP ${code} with mock body`, level: "info" };
    }
    case "slackNotify": {
      const channel = node.data.slackNotify?.channel ?? "#alerts";
      return { message: `Posted to Slack ${channel}`, level: "info" };
    }
    case "emailSend": {
      const to = node.data.emailSend?.to ?? "recipient";
      return { message: `Sent email to ${to}`, level: "info" };
    }
    default:
      return { message: summary, level: "info" };
  }
}
