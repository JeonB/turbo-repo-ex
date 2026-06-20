"use client";

import Link from "next/link";
import { Alert } from "@repo/ui/alert";
import { Button } from "@repo/ui/button";
import { StepLogPanel } from "@repo/ui/step-log-panel";
import {
  WorkflowEditor,
  type NodeChange,
  type WorkflowEditorEdge,
  type WorkflowEditorNode,
} from "@repo/ui";
import { useWorkflowEditor } from "./use-workflow-editor";
import { WorkflowNodeInspector } from "./workflow-node-inspector";

type WorkflowEditorClientProps = {
  canManage: boolean;
  workflowId: string;
};

export function WorkflowEditorClient({ canManage, workflowId }: WorkflowEditorClientProps) {
  const {
    workflowName,
    setWorkflowName,
    nodes,
    edges,
    selectedNode,
    setSelectedNodeId,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onDropNode,
    updateNodeData,
    saveNow,
    runTest,
    runSteps,
    runWarnings,
    remoteLoaded,
  } = useWorkflowEditor({ workflowId });

  const readOnly = !canManage;

  if (!remoteLoaded) {
    return <p className="ui:text-sm ui:text-text-secondary">워크플로 정의를 불러오는 중…</p>;
  }

  return (
    <div className="ui:space-y-6">
      <div className="ui:flex ui:flex-wrap ui:items-center ui:justify-between ui:gap-4">
        <div className="ui:min-w-0 ui:flex-1">
          <label className="ui:sr-only" htmlFor="workflow-name">
            워크플로 이름
          </label>
          <input
            className="ui:w-full ui:max-w-md ui:rounded-ui-md ui:border ui:border-border-subtle ui:bg-surface-raised ui:px-3 ui:py-2 ui:text-lg ui:font-semibold ui:text-text-primary disabled:ui:opacity-70"
            disabled={readOnly}
            id="workflow-name"
            name="workflowName"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
          <p className="ui:mt-1 ui:text-xs ui:text-text-muted">ID: {workflowId}</p>
        </div>
        <div className="ui:flex ui:flex-wrap ui:gap-2">
          <Button asChild variant="default">
            <Link href="/console/workflows">목록</Link>
          </Button>
          {!readOnly ? (
            <>
              <Button type="button" variant="default" onClick={saveNow}>
                저장
              </Button>
              <Button type="button" onClick={runTest}>
                테스트 실행
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {runWarnings.length > 0 ? (
        <Alert title="실행 경고" variant="info">
          <ul className="ui:list-inside ui:list-disc ui:text-sm">
            {runWarnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <div className="ui:flex ui:flex-col ui:gap-4 xl:ui:flex-row">
        <div className="ui:min-w-0 ui:flex-1">
          <WorkflowEditor
            edges={edges as WorkflowEditorEdge[]}
            nodes={nodes as WorkflowEditorNode[]}
            onConnect={onConnect}
            onDropNode={onDropNode}
            onEdgesChange={onEdgesChange}
            onNodeSelect={setSelectedNodeId}
            onNodesChange={onNodesChange as (changes: NodeChange<WorkflowEditorNode>[]) => void}
            readOnly={readOnly}
            showPalette={!readOnly}
          />
        </div>
        <WorkflowNodeInspector node={selectedNode} onUpdate={updateNodeData} readOnly={readOnly} />
      </div>

      {runSteps.length > 0 ? (
        <StepLogPanel steps={runSteps} title="테스트 실행 로그" />
      ) : null}
    </div>
  );
}
