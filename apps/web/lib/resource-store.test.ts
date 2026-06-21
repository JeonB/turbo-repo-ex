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
  });
});
