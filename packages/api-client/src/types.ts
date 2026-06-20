/** Organization role used in API DTOs (aligns with product RBAC). */
export type OrgRole = "owner" | "admin" | "member" | "viewer";

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
};

export type MemberSummary = {
  id: string;
  email: string;
  name: string;
  role: OrgRole;
};

export type UsageSummaryDto = {
  mrrUsd: number;
  activeSeats: number;
  churnRate: number;
  nps: number;
};

export type AuditEventAction =
  | "member.invited"
  | "member.removed"
  | "role.changed"
  | "billing.payment_method_added"
  | "api_key.created"
  | "api_key.revoked";

export type AuditActor = {
  id: string;
  email: string;
  name: string;
};

export type AuditTarget = {
  type: string;
  id: string;
  label?: string;
};

export type AuditEventDto = {
  id: string;
  occurredAt: string;
  actor: AuditActor;
  action: AuditEventAction;
  target?: AuditTarget;
  ip?: string;
};

export type AuditEventsPage = {
  items: AuditEventDto[];
  total: number;
  page: number;
  size: number;
};

export type IntegrationStatus = "connected" | "disconnected" | "error";

export type Integration = {
  id: string;
  name: string;
  vendor: string;
  description?: string;
  status: IntegrationStatus;
  lastSyncAt?: string;
};

export type WorkflowStatus = "active" | "paused" | "draft";

export type RunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

export type Workflow = {
  id: string;
  name: string;
  trigger: string;
  status: WorkflowStatus;
  lastRunId?: string;
  lastRunStatus?: RunStatus;
  updatedAt: string;
};

export type WorkflowDetail = Workflow & {
  definition: unknown;
};

export type RunStepLogLevel = "info" | "warning" | "error";

export type RunStep = {
  id: string;
  title: string;
  message: string;
  level: RunStepLogLevel;
  startedAt: string;
};

export type Run = {
  id: string;
  workflowId: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  steps: RunStep[];
};

export type NotificationCategory = "run" | "integration" | "billing" | "member" | "system";

export type NotificationSeverity = "info" | "success" | "warning" | "error";

/** Console notification feed entry (named *Dto to avoid clashing with the DOM `Notification`). */
export type NotificationDto = {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  createdAt: string;
  href?: string;
};
