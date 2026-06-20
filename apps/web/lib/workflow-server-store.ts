import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Workflow } from "@repo/api-client";
import { deriveTriggerLabel } from "./workflow/derive-trigger-label";
import { SEED_DEFINITIONS, SEED_REGISTRY } from "./workflow/seeds";
import {
  WorkflowDefinitionSchema,
  type WorkflowDefinition,
} from "./workflow/types";

export type StoredWorkflow = Workflow & {
  definition: WorkflowDefinition;
};

type WorkflowStoreFile = {
  workflows: Record<string, StoredWorkflow>;
};

const DEFAULT_DATA_DIR = path.join(process.cwd(), ".workflow-data");
const STORE_FILENAME = "store.json";

function defaultStorePath(dataDir: string): string {
  return path.join(dataDir, STORE_FILENAME);
}

function seedStore(): WorkflowStoreFile {
  const workflows: Record<string, StoredWorkflow> = {};
  for (const entry of SEED_REGISTRY) {
    const definition = SEED_DEFINITIONS[entry.id];
    if (!definition) continue;
    workflows[entry.id] = {
      ...entry,
      definition,
    };
  }
  return { workflows };
}

function parseStore(raw: string): WorkflowStoreFile {
  const parsed = JSON.parse(raw) as WorkflowStoreFile;
  if (!parsed.workflows || typeof parsed.workflows !== "object") {
    throw new Error("Invalid workflow store file");
  }
  return parsed;
}

export type WorkflowServerStore = {
  listWorkflows: () => Promise<Workflow[]>;
  getWorkflow: (workflowId: string) => Promise<StoredWorkflow | null>;
  createWorkflow: (name: string) => Promise<StoredWorkflow>;
  updateWorkflowMeta: (
    workflowId: string,
    patch: Partial<Pick<Workflow, "name" | "status">>,
  ) => Promise<StoredWorkflow | null>;
  putDefinition: (workflowId: string, definition: WorkflowDefinition) => Promise<StoredWorkflow | null>;
};

export function createWorkflowServerStore(dataDir = DEFAULT_DATA_DIR): WorkflowServerStore {
  const storePath = defaultStorePath(dataDir);

  async function readStore(): Promise<WorkflowStoreFile> {
    try {
      const raw = await readFile(storePath, "utf8");
      return parseStore(raw);
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

  async function writeStore(store: WorkflowStoreFile): Promise<void> {
    await mkdir(dataDir, { recursive: true });
    await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
  }

  return {
    async listWorkflows() {
      const store = await readStore();
      return Object.values(store.workflows).map(({ definition: _d, ...meta }) => meta);
    },

    async getWorkflow(workflowId) {
      const store = await readStore();
      return store.workflows[workflowId] ?? null;
    },

    async createWorkflow(name) {
      const store = await readStore();
      const id = `wf_${crypto.randomUUID().slice(0, 8)}`;
      const definition = WorkflowDefinitionSchema.parse({
        version: 1,
        nodes: [
          {
            id: "n_trigger_new",
            type: "trigger",
            position: { x: 80, y: 120 },
            data: {
              label: "Webhook Trigger",
              trigger: { kind: "webhook", path: "/hooks/inbound" },
            },
          },
        ],
        edges: [],
      });

      const workflow: StoredWorkflow = {
        id,
        name,
        trigger: deriveTriggerLabel(definition),
        status: "draft",
        updatedAt: new Date().toISOString(),
        definition,
      };
      store.workflows[id] = workflow;
      await writeStore(store);
      return workflow;
    },

    async updateWorkflowMeta(workflowId, patch) {
      const store = await readStore();
      const current = store.workflows[workflowId];
      if (!current) return null;

      const next: StoredWorkflow = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      store.workflows[workflowId] = next;
      await writeStore(store);
      return next;
    },

    async putDefinition(workflowId, definition) {
      const parsed = WorkflowDefinitionSchema.parse(definition);
      const store = await readStore();
      const current = store.workflows[workflowId];
      if (!current) return null;

      const next: StoredWorkflow = {
        ...current,
        trigger: deriveTriggerLabel(parsed),
        updatedAt: new Date().toISOString(),
        definition: parsed,
      };
      store.workflows[workflowId] = next;
      await writeStore(store);
      return next;
    },
  };
}

let defaultStore: WorkflowServerStore | undefined;

export function getWorkflowServerStore(): WorkflowServerStore {
  defaultStore ??= createWorkflowServerStore();
  return defaultStore;
}
