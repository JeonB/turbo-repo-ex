import { createConsoleApiClient } from "@repo/api-client";
import { getConsoleApiBaseUrl } from "../console-api";
import {
  saveDefinition,
  updateWorkflowMeta,
} from "./storage";
import { WorkflowDefinitionSchema, type WorkflowDefinition } from "./types";

export function isWorkflowApiEnabled(): boolean {
  return Boolean(getConsoleApiBaseUrl());
}

function requireClient() {
  const baseUrl = getConsoleApiBaseUrl();
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
  return createConsoleApiClient({ baseUrl });
}

function mirrorWorkflowLocally(
  workflowId: string,
  name: string,
  definition: WorkflowDefinition,
): void {
  saveDefinition(workflowId, definition);
  updateWorkflowMeta(workflowId, { name });
}

export async function fetchWorkflowDetail(workflowId: string) {
  const detail = await requireClient().getWorkflow(workflowId);
  const parsed = WorkflowDefinitionSchema.safeParse(detail.definition);
  if (parsed.success) {
    mirrorWorkflowLocally(workflowId, detail.name, parsed.data);
  }
  return detail;
}

export async function createWorkflowRemote(name: string) {
  const detail = await requireClient().createWorkflow({ name });
  const parsed = WorkflowDefinitionSchema.safeParse(detail.definition);
  if (parsed.success) {
    mirrorWorkflowLocally(detail.id, detail.name, parsed.data);
  }
  return detail;
}

export async function putWorkflowDefinitionRemote(
  workflowId: string,
  definition: WorkflowDefinition,
): Promise<void> {
  await requireClient().putWorkflowDefinition(workflowId, definition);
  saveDefinition(workflowId, definition);
}

export async function patchWorkflowMetaRemote(
  workflowId: string,
  patch: { name?: string },
): Promise<void> {
  await requireClient().patchWorkflow(workflowId, patch);
  updateWorkflowMeta(workflowId, patch);
}

export async function createWorkflowRunRemote(
  workflowId: string,
  body?: { payload?: Record<string, unknown> },
) {
  return requireClient().createWorkflowRun(workflowId, body);
}
