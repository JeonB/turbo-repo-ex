"use client";

import { useMemo } from "react";
import type { RunStep } from "@repo/ui/step-log-panel";
import { WorkflowEditor, type WorkflowEditorEdge, type WorkflowEditorNode } from "@repo/ui";
import {
  definitionToXYFlow,
  ensureWorkflowSeeds,
  loadDefinition,
} from "../../../lib/workflow";

type RunWorkflowGraphProps = {
  runSteps: RunStep[];
  workflowId: string;
};

function matchStepStatus(
  nodeId: string,
  nodeLabel: string,
  steps: RunStep[],
): "idle" | "running" | "done" | "error" | undefined {
  const step =
    steps.find((s) => s.id === `step_${nodeId}`) ?? steps.find((s) => s.title === nodeLabel);
  if (!step) return "idle";
  if (step.level === "error") return "error";
  return "done";
}

export function RunWorkflowGraph({ runSteps, workflowId }: RunWorkflowGraphProps) {
  const { nodes, edges } = useMemo(() => {
    ensureWorkflowSeeds();
    const def = loadDefinition(workflowId);
    if (!def) return { nodes: [], edges: [] };
    const flow = definitionToXYFlow(def);
    return {
      nodes: flow.nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          runStatus: matchStepStatus(n.id, n.data.label, runSteps),
        },
      })),
      edges: flow.edges,
    };
  }, [runSteps, workflowId]);

  if (nodes.length === 0) {
    return (
      <p className="ui:mt-4 ui:text-sm ui:text-text-secondary">
        저장된 워크플로 정의가 없습니다. 워크플로 편집기에서 그래프를 저장하세요.
      </p>
    );
  }

  return (
    <WorkflowEditor
      className="ui:mt-4"
      edges={edges as WorkflowEditorEdge[]}
      nodes={nodes as WorkflowEditorNode[]}
      readOnly
      showPalette={false}
    />
  );
}
