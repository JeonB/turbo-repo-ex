import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Run, RunStatus } from "@repo/api-client";
import { MOCK_RUNS } from "./runs-mock";

type RunStoreFile = {
  runs: Record<string, Run>;
};

const DEFAULT_DATA_DIR = path.join(process.cwd(), ".workflow-data");
const STORE_FILENAME = "runs.json";

function seedStore(): RunStoreFile {
  const runs: Record<string, Run> = {};
  for (const run of MOCK_RUNS) {
    runs[run.id] = run;
  }
  return { runs };
}

export type RunServerStore = {
  listRuns: () => Promise<Run[]>;
  getRun: (runId: string) => Promise<Run | null>;
  createRun: (input: {
    workflowId: string;
    status: RunStatus;
    startedAt: string;
    finishedAt?: string;
    steps: Run["steps"];
  }) => Promise<Run>;
  updateWorkflowLastRun: (
    workflowId: string,
    runId: string,
    status: RunStatus,
  ) => Promise<void>;
};

export function createRunServerStore(
  dataDir = DEFAULT_DATA_DIR,
  onWorkflowRun?: (workflowId: string, runId: string, status: RunStatus) => Promise<void>,
): RunServerStore {
  const storePath = path.join(dataDir, STORE_FILENAME);

  async function readStore(): Promise<RunStoreFile> {
    try {
      const raw = await readFile(storePath, "utf8");
      const parsed = JSON.parse(raw) as RunStoreFile;
      if (!parsed.runs) throw new Error("Invalid run store");
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

  async function writeStore(store: RunStoreFile): Promise<void> {
    await mkdir(dataDir, { recursive: true });
    await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
  }

  return {
    async listRuns() {
      const store = await readStore();
      return Object.values(store.runs);
    },

    async getRun(runId) {
      const store = await readStore();
      return store.runs[runId] ?? null;
    },

    async createRun(input) {
      const store = await readStore();
      const id = `run_${crypto.randomUUID().slice(0, 8)}`;
      const run: Run = {
        id,
        workflowId: input.workflowId,
        status: input.status,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
        steps: input.steps,
      };
      store.runs[id] = run;
      await writeStore(store);
      if (onWorkflowRun) {
        await onWorkflowRun(input.workflowId, id, input.status);
      }
      return run;
    },

    async updateWorkflowLastRun(workflowId, runId, status) {
      if (onWorkflowRun) {
        await onWorkflowRun(workflowId, runId, status);
      }
    },
  };
}

let defaultRunStore: RunServerStore | undefined;

export function getRunServerStore(): RunServerStore {
  defaultRunStore ??= createRunServerStore(undefined, async (workflowId, runId, status) => {
    const { getWorkflowServerStore } = await import("./workflow-server-store");
    await getWorkflowServerStore().updateWorkflowMeta(workflowId, {
      lastRunId: runId,
      lastRunStatus: status,
    });
  });
  return defaultRunStore;
}
