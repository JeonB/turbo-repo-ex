import { z } from "zod";

export const HealthCheckSchema = z.object({
  status: z.string().min(1),
});

export const UsageSummaryDtoSchema = z.object({
  mrrUsd: z.number(),
  activeSeats: z.number().int().nonnegative(),
  churnRate: z.number(),
  nps: z.number(),
});

export const AuditEventActionSchema = z.enum([
  "member.invited",
  "member.removed",
  "role.changed",
  "billing.payment_method_added",
  "api_key.created",
  "api_key.revoked",
]);

export const AuditActorSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
});

export const AuditTargetSchema = z.object({
  type: z.string().min(1),
  id: z.string().min(1),
  label: z.string().min(1).optional(),
});

export const AuditEventDtoSchema = z.object({
  id: z.string().min(1),
  occurredAt: z.string().datetime({ offset: true }),
  actor: AuditActorSchema,
  action: AuditEventActionSchema,
  target: AuditTargetSchema.optional(),
  ip: z.string().min(1).optional(),
});

export const AuditEventsPageSchema = z.object({
  items: z.array(AuditEventDtoSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  size: z.number().int().positive(),
});

export const IntegrationStatusSchema = z.enum(["connected", "disconnected", "error"]);

export const IntegrationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  vendor: z.string().min(1),
  description: z.string().min(1).optional(),
  status: IntegrationStatusSchema,
  lastSyncAt: z.string().datetime({ offset: true }).optional(),
});

export const WorkflowStatusSchema = z.enum(["active", "paused", "draft"]);
export const RunStatusSchema = z.enum(["queued", "running", "succeeded", "failed", "cancelled"]);

export const WorkflowSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  trigger: z.string().min(1),
  status: WorkflowStatusSchema,
  lastRunId: z.string().min(1).optional(),
  lastRunStatus: RunStatusSchema.optional(),
  updatedAt: z.string().datetime({ offset: true }),
});

export const WorkflowDetailSchema = WorkflowSchema.extend({
  definition: z.unknown(),
});

export const WorkflowDefinitionPutResponseSchema = z.object({
  id: z.string().min(1),
  updatedAt: z.string().datetime({ offset: true }),
});

export const CreateWorkflowBodySchema = z.object({
  name: z.string().min(1),
});

export const RunStepLogLevelSchema = z.enum(["info", "warning", "error"]);

export const RunStepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
  level: RunStepLogLevelSchema,
  startedAt: z.string().datetime({ offset: true }),
});

export const RunSchema = z.object({
  id: z.string().min(1),
  workflowId: z.string().min(1),
  status: RunStatusSchema,
  startedAt: z.string().datetime({ offset: true }),
  finishedAt: z.string().datetime({ offset: true }).optional(),
  steps: z.array(RunStepSchema),
});

export const OrgRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);

export const MemberSummarySchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: OrgRoleSchema,
});

export const NotificationCategorySchema = z.enum([
  "run",
  "integration",
  "billing",
  "member",
  "system",
]);

export const NotificationSeveritySchema = z.enum(["info", "success", "warning", "error"]);

export const NotificationDtoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: NotificationCategorySchema,
  severity: NotificationSeveritySchema,
  createdAt: z.string().datetime({ offset: true }),
  href: z.string().min(1).optional(),
});
