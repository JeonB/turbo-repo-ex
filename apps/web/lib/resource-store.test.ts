import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createResourceStore } from "./resource-store";

describe("resource-store", () => {
  let dataDir = "";

  afterEach(() => {
    if (dataDir) {
      rmSync(dataDir, { recursive: true, force: true });
      dataDir = "";
    }
  });

  it("creates and lists rows", async () => {
    dataDir = mkdtempSync(path.join(tmpdir(), "resource-store-"));
    const store = createResourceStore(dataDir);
    const row = await store.createRow("leads", { email: "lead@example.com" });
    expect(row.id).toMatch(/^row_/);
    const rows = await store.listRows("leads");
    expect(rows).toHaveLength(1);

    const updated = await store.updateRow("leads", row.id, { name: "Updated" });
    expect(updated?.data.name).toBe("Updated");

    const deleted = await store.deleteRow("leads", row.id);
    expect(deleted).toBe(true);
    expect(await store.listRows("leads")).toHaveLength(0);
  });
});
