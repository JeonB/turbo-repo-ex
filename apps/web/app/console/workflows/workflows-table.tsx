"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import type { Workflow } from "@repo/api-client";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { DataTable, type DataTableColumn } from "@repo/ui/data-table";
import { RunStatusBadge } from "@repo/ui/run-status-badge";
import {
  ensureWorkflowSeeds,
  loadRegistry,
  mergeWorkflowLists,
  registryToWorkflows,
  subscribeRegistryChanges,
} from "../../../lib/workflow";

type WorkflowRow = Workflow;

const columns: DataTableColumn<WorkflowRow>[] = [
  {
    accessorKey: "name",
    header: "워크플로",
    cell: (ctx) => {
      const row = ctx.row.original;
      return (
        <Link
          className="ui:font-medium ui:text-text-primary ui:underline-offset-2 hover:ui:underline"
          href={`/console/workflows/${row.id}`}
        >
          {row.name}
        </Link>
      );
    },
  },
  { accessorKey: "trigger", header: "트리거" },
  {
    accessorKey: "status",
    header: "상태",
    cell: (ctx) => {
      const status = ctx.getValue() as Workflow["status"];
      const label = status === "active" ? "활성" : status === "paused" ? "일시중지" : "초안";
      return <Badge variant="default">{label}</Badge>;
    },
  },
  {
    accessorKey: "lastRunStatus",
    header: "마지막 실행",
    cell: (ctx) => {
      const row = ctx.row.original;
      if (!row.lastRunStatus || !row.lastRunId) {
        return <span className="ui:text-text-muted">-</span>;
      }
      return (
        <Link
          className="ui:inline-flex ui:items-center ui:gap-2 ui:text-sm ui:underline-offset-2 hover:ui:underline"
          href={`/console/runs/${row.lastRunId}`}
        >
          <RunStatusBadge status={row.lastRunStatus} />
        </Link>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: (ctx) => (
      <Button asChild size="sm" variant="default">
        <Link href={`/console/workflows/${ctx.row.original.id}`}>편집</Link>
      </Button>
    ),
  },
];

function subscribeRegistry(onStoreChange: () => void): () => void {
  const handler = (): void => onStoreChange();
  window.addEventListener("storage", handler);
  const unsubscribeLocal = subscribeRegistryChanges(handler);
  return () => {
    window.removeEventListener("storage", handler);
    unsubscribeLocal();
  };
}

type WorkflowsTableProps = {
  apiConfigured: boolean;
  initialWorkflows: Workflow[];
  showCreate?: boolean;
};

export function WorkflowsTable({ apiConfigured, initialWorkflows, showCreate }: WorkflowsTableProps) {
  const getSnapshot = useCallback((): Workflow[] => {
    ensureWorkflowSeeds();
    const local = registryToWorkflows(loadRegistry());
    if (!apiConfigured) {
      return local;
    }
    return mergeWorkflowLists(initialWorkflows, local);
  }, [apiConfigured, initialWorkflows]);

  const workflows = useSyncExternalStore(
    subscribeRegistry,
    getSnapshot,
    () => initialWorkflows,
  );

  return (
    <div className="ui:space-y-4">
      {showCreate ? (
        <div className="ui:flex ui:justify-end">
          <Button asChild>
            <Link href="/console/workflows/new">새 워크플로</Link>
          </Button>
        </div>
      ) : null}
      <DataTable columns={columns} data={workflows} />
    </div>
  );
}
