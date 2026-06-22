import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createWorkflowServerStore } from "./workflow-server-store";

describe("workflow-server-store", () => {
  let dataDir = "";

  afterEach(() => {
    if (dataDir) {
      rmSync(dataDir, { recursive: true, force: true });
      dataDir = "";
    }
  });

  it("seeds workflows on first read", async () => {
    dataDir = mkdtempSync(path.join(tmpdir(), "wf-store-"));
    const store = createWorkflowServerStore(dataDir);
    const workflows = await store.listWorkflows();
    expect(workflows.some((w) => w.id === "wf_lead_sync")).toBe(true);
  });

  it("persists definition updates", async () => {
    dataDir = mkdtempSync(path.join(tmpdir(), "wf-store-"));
    const store = createWorkflowServerStore(dataDir);
    const created = await store.createWorkflow("Test flow");
    const definition = created.definition;
    const updated = await store.putDefinition(created.id, definition);
    expect(updated?.id).toBe(created.id);

    const loaded = await store.getWorkflow(created.id);
    expect(loaded?.name).toBe("Test flow");
    expect(loaded?.definition.version).toBe(1);
  });

  it("rejects publish when webhook path conflicts with another active workflow", async () => {
    dataDir = mkdtempSync(path.join(tmpdir(), "wf-store-"));
    const store = createWorkflowServerStore(dataDir);
    const duplicate = await store.createWorkflow("Duplicate leads hook");
    const leadsDefinition = (await store.getWorkflow("wf_leads_api"))?.definition;
    expect(leadsDefinition).toBeDefined();
    await store.putDefinition(duplicate.id, leadsDefinition!);

    const result = await store.publishWorkflow(duplicate.id);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("path_conflict");
      expect(result.conflictWorkflowId).toBe("wf_leads_api");
    }
  });
});
