import type { ResourceStore } from "../resource-store";
import type { WorkflowNode } from "../workflow/types";
import { defaultLabel } from "../workflow/types";
import type { ExecutionContext } from "./context";

export type NodeHandlerResult = {
  message: string;
  level: "info" | "warning" | "error";
  patch?: Partial<ExecutionContext>;
  httpResponse?: { statusCode: number; body: unknown };
};

export type NodeHandler = (
  node: WorkflowNode,
  ctx: ExecutionContext,
  resources: ResourceStore,
) => Promise<NodeHandlerResult>;

function payloadId(ctx: ExecutionContext): string | undefined {
  const id = ctx.payload.id;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}

export async function handleTriggerNode(
  node: WorkflowNode,
  ctx: ExecutionContext,
): Promise<NodeHandlerResult> {
  const kind = node.data.trigger?.kind ?? "webhook";
  return {
    message: `Triggered via ${kind} with ${Object.keys(ctx.payload).length} payload field(s)`,
    level: "info",
  };
}

export async function handleDbQueryNode(
  node: WorkflowNode,
  ctx: ExecutionContext,
  resources: ResourceStore,
): Promise<NodeHandlerResult> {
  const table = node.data.dbQuery?.table ?? "contacts";
  const preset = node.data.dbQuery?.queryPreset ?? "list_recent";

  switch (preset) {
    case "list_recent": {
      const rows = await resources.listRows(table, 20);
      return {
        message: `Listed ${rows.length} row(s) from ${table}`,
        level: "info",
        patch: { rows: rows.map((r) => ({ id: r.id, ...r.data })), rowCount: rows.length },
      };
    }
    case "by_id": {
      const id = payloadId(ctx);
      if (!id) {
        return { message: `Missing payload.id for ${table} lookup`, level: "error" };
      }
      const row = await resources.getRowById(table, id);
      if (!row) {
        return { message: `No row found in ${table} for id ${id}`, level: "error" };
      }
      return {
        message: `Fetched ${table} row ${id}`,
        level: "info",
        patch: { lastRow: { id: row.id, ...row.data }, rowCount: 1 },
      };
    }
    case "count": {
      const count = await resources.countRows(table);
      return {
        message: `Counted ${count} row(s) in ${table}`,
        level: "info",
        patch: { rowCount: count },
      };
    }
    case "create": {
      const { id: _omit, ...data } = ctx.payload;
      const row = await resources.createRow(table, data);
      return {
        message: `Created row in ${table}`,
        level: "info",
        patch: { lastRow: { id: row.id, ...row.data }, rowCount: 1 },
      };
    }
    case "update": {
      const id = payloadId(ctx);
      if (!id) {
        return { message: `Missing payload.id for ${table} update`, level: "error" };
      }
      const { id: _omit, ...patch } = ctx.payload;
      const row = await resources.updateRow(table, id, patch);
      if (!row) {
        return { message: `No row found in ${table} for id ${id}`, level: "error" };
      }
      return {
        message: `Updated ${table} row ${id}`,
        level: "info",
        patch: { lastRow: { id: row.id, ...row.data }, rowCount: 1 },
      };
    }
    case "delete": {
      const id = payloadId(ctx);
      if (!id) {
        return { message: `Missing payload.id for ${table} delete`, level: "error" };
      }
      const deleted = await resources.deleteRow(table, id);
      if (!deleted) {
        return { message: `No row found in ${table} for id ${id}`, level: "error" };
      }
      return {
        message: `Deleted ${table} row ${id}`,
        level: "info",
        patch: { lastRow: { id }, rowCount: 0 },
      };
    }
    default: {
      const _exhaustive: never = preset;
      return { message: `Unsupported dbQuery preset: ${String(_exhaustive)}`, level: "error" };
    }
  }
}

export async function handleTransformNode(
  node: WorkflowNode,
  ctx: ExecutionContext,
): Promise<NodeHandlerResult> {
  const expr = node.data.transform?.expression ?? "map(payload)";
  const mapped = {
    ...ctx.payload,
    ...(ctx.lastRow ?? {}),
    transformed: true,
  };
  return {
    message: `Applied transform: ${expr}`,
    level: "info",
    patch: { payload: mapped, transformed: true, lastRow: mapped },
  };
}

function renderTemplate(template: string, ctx: ExecutionContext): unknown {
  const source: Record<string, unknown> = {
    ...ctx.payload,
    ...(ctx.lastRow ?? {}),
    id: ctx.lastRow?.id ?? ctx.payload.id,
  };

  if (template.trim().startsWith("{")) {
    try {
      const replaced = template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
        const value = source[key];
        return typeof value === "string" || typeof value === "number" ? String(value) : "";
      });
      return JSON.parse(replaced) as unknown;
    } catch {
      return { ok: true, ...source };
    }
  }
  return template;
}

export async function handleHttpResponseNode(
  node: WorkflowNode,
  ctx: ExecutionContext,
): Promise<NodeHandlerResult> {
  const statusCode = node.data.httpResponse?.statusCode ?? 200;
  const bodyTemplate = node.data.httpResponse?.bodyTemplate ?? '{"ok":true}';
  const body = renderTemplate(bodyTemplate, ctx);
  return {
    message: `Responded HTTP ${statusCode}`,
    level: "info",
    httpResponse: { statusCode, body },
  };
}

export async function handleSlackNotifyNode(node: WorkflowNode): Promise<NodeHandlerResult> {
  const channel = node.data.slackNotify?.channel ?? "#alerts";
  return {
    message: `Slack notify stub → ${channel}`,
    level: "warning",
  };
}

export async function handleEmailSendNode(node: WorkflowNode): Promise<NodeHandlerResult> {
  const to = node.data.emailSend?.to ?? "recipient";
  return {
    message: `Email send stub → ${to}`,
    level: "warning",
  };
}

export async function runNodeHandler(
  node: WorkflowNode,
  ctx: ExecutionContext,
  resources: ResourceStore,
): Promise<NodeHandlerResult> {
  switch (node.type) {
    case "trigger":
      return handleTriggerNode(node, ctx);
    case "dbQuery":
      return handleDbQueryNode(node, ctx, resources);
    case "transform":
      return handleTransformNode(node, ctx);
    case "httpResponse":
      return handleHttpResponseNode(node, ctx);
    case "slackNotify":
      return handleSlackNotifyNode(node);
    case "emailSend":
      return handleEmailSendNode(node);
    default: {
      return { message: defaultLabel(node.type as never), level: "info" };
    }
  }
}
