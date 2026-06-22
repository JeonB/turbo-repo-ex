import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createResourceStore } from "../resource-store";
import { executeWorkflowOnServer } from "./execute";
import { SEED_DEFINITIONS } from "../workflow/seeds";

describe("executeWorkflowOnServer", () => {
  let dataDir = "";

  afterEach(() => {
    if (dataDir) {
      rmSync(dataDir, { recursive: true, force: true });
      dataDir = "";
    }
  });

  it("executes lead sync workflow against resource store", async () => {
    dataDir = mkdtempSync(path.join(tmpdir(), "wf-runtime-"));
    const resources = createResourceStore(dataDir);
    const result = await executeWorkflowOnServer(SEED_DEFINITIONS.wf_lead_sync, {
      payload: { id: "ct_1" },
      resources,
    });
    expect(result.status).toBe("succeeded");
    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.httpResponse?.statusCode).toBe(200);
  });

  it("creates a lead via webhook CRUD workflow", async () => {
    dataDir = mkdtempSync(path.join(tmpdir(), "wf-runtime-leads-"));
    const resources = createResourceStore(dataDir);
    const result = await executeWorkflowOnServer(SEED_DEFINITIONS.wf_leads_api, {
      payload: { email: "lead@example.com", name: "Lead User" },
      resources,
    });
    expect(result.status).toBe("succeeded");
    expect(result.httpResponse?.statusCode).toBe(201);
    const body = result.httpResponse?.body as { id?: string; email?: string };
    expect(body.email).toBe("lead@example.com");
    expect(body.id).toMatch(/^row_/);
    const rows = await resources.listRows("leads");
    expect(rows).toHaveLength(1);
  });
});
