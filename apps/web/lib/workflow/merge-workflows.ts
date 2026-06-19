import type { Workflow } from "@repo/api-client";

/**
 * Merges API workflow metadata with client-side registry entries.
 * Local entries win when newer; local-only workflows (e.g. newly created) are included.
 */
export function mergeWorkflowLists(apiWorkflows: Workflow[], localWorkflows: Workflow[]): Workflow[] {
  const merged = new Map<string, Workflow>();

  for (const workflow of apiWorkflows) {
    merged.set(workflow.id, workflow);
  }

  for (const local of localWorkflows) {
    const existing = merged.get(local.id);
    if (!existing || local.updatedAt.localeCompare(existing.updatedAt) > 0) {
      merged.set(local.id, local);
    }
  }

  return [...merged.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
