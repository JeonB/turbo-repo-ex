import { z } from "zod";

export const AUTOMATION_NODE_TYPES = [
  "trigger",
  "dbQuery",
  "httpResponse",
  "transform",
  "slackNotify",
  "emailSend",
] as const;

export type AutomationNodeType = (typeof AUTOMATION_NODE_TYPES)[number];

export const NodeRunStatusSchema = z.enum(["idle", "running", "done", "error"]);
export type NodeRunStatus = z.infer<typeof NodeRunStatusSchema>;

export const TriggerKindSchema = z.enum(["webhook", "schedule", "event"]);
export type TriggerKind = z.infer<typeof TriggerKindSchema>;

export const TriggerNodeConfigSchema = z.object({
  kind: TriggerKindSchema,
  path: z.string().optional(),
  schedule: z.string().optional(),
  eventName: z.string().optional(),
});

export const DB_QUERY_PRESETS = [
  "by_id",
  "list_recent",
  "count",
  "create",
  "update",
  "delete",
] as const;

export type DbQueryPreset = (typeof DB_QUERY_PRESETS)[number];

export const DbQueryNodeConfigSchema = z.object({
  table: z.string().default("contacts"),
  queryPreset: z.enum(DB_QUERY_PRESETS).default("list_recent"),
});

export const HttpResponseNodeConfigSchema = z.object({
  statusCode: z.number().int().min(100).max(599).default(200),
  bodyTemplate: z.string().default('{"ok":true}'),
});

export const TransformNodeConfigSchema = z.object({
  expression: z.string().default("map(payload)"),
});

export const SlackNotifyNodeConfigSchema = z.object({
  channel: z.string().default("#alerts"),
  messageTemplate: z.string().default("Workflow completed"),
});

export const EmailSendNodeConfigSchema = z.object({
  to: z.string().default("team@example.com"),
  subject: z.string().default("Notification"),
  bodyTemplate: z.string().default("See attached summary."),
});

export const WorkflowNodeDataSchema = z.object({
  label: z.string(),
  summary: z.string().optional(),
  runStatus: NodeRunStatusSchema.optional(),
  trigger: TriggerNodeConfigSchema.optional(),
  dbQuery: DbQueryNodeConfigSchema.optional(),
  httpResponse: HttpResponseNodeConfigSchema.optional(),
  transform: TransformNodeConfigSchema.optional(),
  slackNotify: SlackNotifyNodeConfigSchema.optional(),
  emailSend: EmailSendNodeConfigSchema.optional(),
});

export type WorkflowNodeData = z.infer<typeof WorkflowNodeDataSchema>;

export const WorkflowNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(AUTOMATION_NODE_TYPES),
  position: z.object({ x: z.number(), y: z.number() }),
  data: WorkflowNodeDataSchema,
});

export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;

export const WorkflowEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
});

export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>;

export const WorkflowDefinitionSchema = z.object({
  version: z.literal(1),
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
});

export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;

export const WorkflowRegistryEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  trigger: z.string().min(1),
  status: z.enum(["active", "paused", "draft"]),
  updatedAt: z.string().datetime({ offset: true }),
  lastRunId: z.string().min(1).optional(),
  lastRunStatus: z.enum(["queued", "running", "succeeded", "failed", "cancelled"]).optional(),
});

export type WorkflowRegistryEntry = z.infer<typeof WorkflowRegistryEntrySchema>;

export function defaultNodeData(type: AutomationNodeType, label?: string): WorkflowNodeData {
  const base = { label: label ?? defaultLabel(type) };
  switch (type) {
    case "trigger":
      return { ...base, trigger: { kind: "webhook", path: "/hooks/inbound" } };
    case "dbQuery":
      return { ...base, dbQuery: { table: "contacts", queryPreset: "list_recent" } };
    case "httpResponse":
      return { ...base, httpResponse: { statusCode: 200, bodyTemplate: '{"ok":true}' } };
    case "transform":
      return { ...base, transform: { expression: "map(payload)" } };
    case "slackNotify":
      return { ...base, slackNotify: { channel: "#alerts", messageTemplate: "Workflow completed" } };
    case "emailSend":
      return { ...base, emailSend: { to: "team@example.com", subject: "Notification", bodyTemplate: "See summary." } };
    default:
      return base;
  }
}

export function defaultLabel(type: AutomationNodeType): string {
  switch (type) {
    case "trigger":
      return "Trigger";
    case "dbQuery":
      return "DB Query";
    case "httpResponse":
      return "HTTP Response";
    case "transform":
      return "Transform";
    case "slackNotify":
      return "Slack Notify";
    case "emailSend":
      return "Email Send";
    default:
      return "Node";
  }
}

export function summarizeNodeData(type: AutomationNodeType, data: WorkflowNodeData): string {
  switch (type) {
    case "trigger":
      return data.trigger?.kind === "schedule"
        ? `schedule ${data.trigger.schedule ?? "—"}`
        : data.trigger?.kind === "event"
          ? `event ${data.trigger.eventName ?? "—"}`
          : `webhook ${data.trigger?.path ?? "—"}`;
    case "dbQuery":
      return `${data.dbQuery?.table ?? "table"} · ${data.dbQuery?.queryPreset ?? "query"}`;
    case "httpResponse":
      return `HTTP ${data.httpResponse?.statusCode ?? 200}`;
    case "transform":
      return data.transform?.expression ?? "transform";
    case "slackNotify":
      return data.slackNotify?.channel ?? "#channel";
    case "emailSend":
      return data.emailSend?.to ?? "recipient";
    default:
      return "";
  }
}
