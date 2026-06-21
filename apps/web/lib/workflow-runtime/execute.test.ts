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
});
