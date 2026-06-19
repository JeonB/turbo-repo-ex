import type { Workflow } from "@repo/api-client";
import { deriveTriggerLabel } from "./derive-trigger-label";
import {
  WorkflowDefinitionSchema,
  WorkflowRegistryEntrySchema,
  type WorkflowDefinition,
  type WorkflowRegistryEntry,
} from "./types";
import { SEED_DEFINITIONS, SEED_REGISTRY, createEmptyDefinition } from "./seeds";

const REGISTRY_KEY = "workflow:registry";
const DEFINITION_PREFIX = "workflow:definition:";
const HYDRATED_KEY = "workflow:hydrated";

const registryListeners = new Set<() => void>();

function notifyRegistryListeners(): void {
  for (const listener of registryListeners) {
    listener();
  }
}

export function subscribeRegistryChanges(onStoreChange: () => void): () => void {
  registryListeners.add(onStoreChange);
  return () => registryListeners.delete(onStoreChange);
}

function definitionKey(workflowId: string): string {
  return `${DEFINITION_PREFIX}${workflowId}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function ensureWorkflowSeeds(): void {
  if (!isBrowser()) return;
  if (window.localStorage.getItem(HYDRATED_KEY) === "1") return;

  window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(SEED_REGISTRY));
  for (const [id, definition] of Object.entries(SEED_DEFINITIONS)) {
    window.localStorage.setItem(
      definitionKey(id),
      JSON.stringify({ definition, updatedAt: new Date().toISOString() }),
    );
  }
  window.localStorage.setItem(HYDRATED_KEY, "1");
}

export function loadRegistry(): WorkflowRegistryEntry[] {
  if (!isBrowser()) return [...SEED_REGISTRY];
  ensureWorkflowSeeds();
  try {
    const raw = window.localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [...SEED_REGISTRY];
    const parsed = zodParseRegistry(JSON.parse(raw));
    return parsed.length > 0 ? parsed : [...SEED_REGISTRY];
  } catch {
    return [...SEED_REGISTRY];
  }
}

function zodParseRegistry(raw: unknown): WorkflowRegistryEntry[] {
  if (!Array.isArray(raw)) return [];
  const entries: WorkflowRegistryEntry[] = [];
  for (const item of raw) {
    const result = WorkflowRegistryEntrySchema.safeParse(item);
    if (result.success) entries.push(result.data);
  }
  return entries;
}

export function saveRegistry(entries: WorkflowRegistryEntry[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(entries));
  notifyRegistryListeners();
}

export function loadDefinition(workflowId: string): WorkflowDefinition | null {
  if (!isBrowser()) return SEED_DEFINITIONS[workflowId] ?? null;
  ensureWorkflowSeeds();
  try {
    const raw = window.localStorage.getItem(definitionKey(workflowId));
    if (!raw) return SEED_DEFINITIONS[workflowId] ?? null;
    const parsed = JSON.parse(raw) as { definition?: unknown };
    const result = WorkflowDefinitionSchema.safeParse(parsed.definition);
    return result.success ? result.data : SEED_DEFINITIONS[workflowId] ?? null;
  } catch {
    return SEED_DEFINITIONS[workflowId] ?? null;
  }
}

export function saveDefinition(workflowId: string, definition: WorkflowDefinition): void {
  if (!isBrowser()) return;
  const payload = { definition, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(definitionKey(workflowId), JSON.stringify(payload));

  const registry = loadRegistry();
  const idx = registry.findIndex((e) => e.id === workflowId);
  const triggerLabel = deriveTriggerLabel(definition);

  const updated: WorkflowRegistryEntry = {
    id: workflowId,
    name: registry[idx]?.name ?? "Untitled workflow",
    trigger: triggerLabel,
    status: registry[idx]?.status ?? "draft",
    updatedAt: new Date().toISOString(),
    lastRunId: registry[idx]?.lastRunId,
    lastRunStatus: registry[idx]?.lastRunStatus,
  };

  if (idx >= 0) {
    registry[idx] = updated;
  } else {
    registry.push(updated);
  }
  saveRegistry(registry);
}

export function createWorkflow(name: string): { id: string; definition: WorkflowDefinition } {
  const id = `wf_${crypto.randomUUID().slice(0, 8)}`;
  const definition = createEmptyDefinition();
  const entry: WorkflowRegistryEntry = {
    id,
    name,
    trigger: deriveTriggerLabel(definition),
    status: "draft",
    updatedAt: new Date().toISOString(),
  };
  if (isBrowser()) {
    ensureWorkflowSeeds();
    const registry = loadRegistry();
    registry.unshift(entry);
    saveRegistry(registry);
    saveDefinition(id, definition);
  }
  return { id, definition };
}

export function updateWorkflowMeta(
  workflowId: string,
  patch: Partial<Pick<WorkflowRegistryEntry, "name" | "status">>,
): void {
  if (!isBrowser()) return;
  const registry = loadRegistry();
  const idx = registry.findIndex((e) => e.id === workflowId);
  if (idx < 0) return;
  const current = registry[idx];
  if (!current) return;
  registry[idx] = { ...current, ...patch, updatedAt: new Date().toISOString() };
  saveRegistry(registry);
}

export function registryToWorkflows(entries: WorkflowRegistryEntry[]): Workflow[] {
  return entries.map((e) => ({
    id: e.id,
    name: e.name,
    trigger: e.trigger,
    status: e.status,
    lastRunId: e.lastRunId,
    lastRunStatus: e.lastRunStatus,
    updatedAt: e.updatedAt,
  }));
}
