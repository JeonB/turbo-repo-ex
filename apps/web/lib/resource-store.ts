import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ResourceRow = {
  id: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type ResourceTable = {
  slug: string;
  displayName: string;
  rows: ResourceRow[];
};

type ResourceStoreFile = {
  tables: Record<string, ResourceTable>;
};

const DEFAULT_DATA_DIR = path.join(process.cwd(), ".workflow-data");
const STORE_FILENAME = "resources.json";

function seedStore(): ResourceStoreFile {
  const now = new Date().toISOString();
  return {
    tables: {
      contacts: {
        slug: "contacts",
        displayName: "Contacts",
        rows: [
          {
            id: "ct_1",
            data: { email: "ada@example.com", name: "Ada Lovelace" },
            createdAt: now,
            updatedAt: now,
          },
        ],
      },
      leads: {
        slug: "leads",
        displayName: "Leads",
        rows: [],
      },
    },
  };
}

export type ResourceStore = {
  listRows: (slug: string, limit?: number) => Promise<ResourceRow[]>;
  countRows: (slug: string) => Promise<number>;
  getRowById: (slug: string, id: string) => Promise<ResourceRow | null>;
  createRow: (slug: string, data: Record<string, unknown>) => Promise<ResourceRow>;
  updateRow: (
    slug: string,
    id: string,
    data: Record<string, unknown>,
  ) => Promise<ResourceRow | null>;
  deleteRow: (slug: string, id: string) => Promise<boolean>;
};

export function createResourceStore(dataDir = DEFAULT_DATA_DIR): ResourceStore {
  const storePath = path.join(dataDir, STORE_FILENAME);

  async function readStore(): Promise<ResourceStoreFile> {
    try {
      const raw = await readFile(storePath, "utf8");
      const parsed = JSON.parse(raw) as ResourceStoreFile;
      if (!parsed.tables) throw new Error("Invalid resource store");
      return parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
      const seeded = seedStore();
      await mkdir(dataDir, { recursive: true });
      await writeFile(storePath, JSON.stringify(seeded, null, 2), "utf8");
      return seeded;
    }
  }

  async function writeStore(store: ResourceStoreFile): Promise<void> {
    await mkdir(dataDir, { recursive: true });
    await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
  }

  function getTable(store: ResourceStoreFile, slug: string): ResourceTable | null {
    return store.tables[slug] ?? null;
  }

  return {
    async listRows(slug, limit = 20) {
      const store = await readStore();
      const table = getTable(store, slug);
      if (!table) return [];
      return [...table.rows]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, limit);
    },

    async countRows(slug) {
      const store = await readStore();
      const table = getTable(store, slug);
      return table?.rows.length ?? 0;
    },

    async getRowById(slug, id) {
      const store = await readStore();
      const table = getTable(store, slug);
      return table?.rows.find((row) => row.id === id) ?? null;
    },

    async createRow(slug, data) {
      const store = await readStore();
      const table = getTable(store, slug);
      if (!table) {
        throw new Error(`Unknown resource table: ${slug}`);
      }
      const now = new Date().toISOString();
      const row: ResourceRow = {
        id: `row_${crypto.randomUUID().slice(0, 8)}`,
        data,
        createdAt: now,
        updatedAt: now,
      };
      table.rows.push(row);
      await writeStore(store);
      return row;
    },

    async updateRow(slug, id, data) {
      const store = await readStore();
      const table = getTable(store, slug);
      if (!table) return null;
      const idx = table.rows.findIndex((row) => row.id === id);
      if (idx < 0) return null;
      const current = table.rows[idx];
      if (!current) return null;
      const next: ResourceRow = {
        ...current,
        data: { ...current.data, ...data },
        updatedAt: new Date().toISOString(),
      };
      table.rows[idx] = next;
      await writeStore(store);
      return next;
    },

    async deleteRow(slug, id) {
      const store = await readStore();
      const table = getTable(store, slug);
      if (!table) return false;
      const before = table.rows.length;
      table.rows = table.rows.filter((row) => row.id !== id);
      if (table.rows.length === before) return false;
      await writeStore(store);
      return true;
    },
  };
}

let defaultResourceStore: ResourceStore | undefined;

export function getResourceStore(): ResourceStore {
  defaultResourceStore ??= createResourceStore();
  return defaultResourceStore;
}
