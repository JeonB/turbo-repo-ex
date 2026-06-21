"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type RunStep,
  type XYPosition,
} from "@repo/ui";
import {
  definitionToXYFlow,
  ensureWorkflowSeeds,
  executeWorkflow,
  fetchWorkflowDetail,
  isWorkflowApiEnabled,
  createWorkflowRunRemote,
  loadDefinition,
  loadRegistry,
  patchWorkflowMetaRemote,
  putWorkflowDefinitionRemote,
  saveDefinition,
  updateWorkflowMeta,
  xyFlowToDefinition,
  type WorkflowFlowEdge,
  type WorkflowFlowNode,
} from "../../../lib/workflow";
import {
  AUTOMATION_NODE_TYPES,
  defaultNodeData,
  summarizeNodeData,
  WorkflowDefinitionSchema,
  type AutomationNodeType,
  type NodeRunStatus,
  type WorkflowNodeData,
} from "../../../lib/workflow/types";

function loadInitialFlow(workflowId: string): {
  nodes: WorkflowFlowNode[];
  edges: WorkflowFlowEdge[];
  name: string;
} {
  ensureWorkflowSeeds();
  const entry = loadRegistry().find((e) => e.id === workflowId);
  const def = loadDefinition(workflowId);
  if (!def) {
    return { nodes: [], edges: [], name: entry?.name ?? "워크플로" };
  }
  const flow = definitionToXYFlow(def);
  return { nodes: flow.nodes, edges: flow.edges, name: entry?.name ?? "워크플로" };
}

type UseWorkflowEditorOptions = {
  workflowId: string;
};

export function useWorkflowEditor({ workflowId }: UseWorkflowEditorOptions) {
  const apiEnabled = isWorkflowApiEnabled();
  const initial = useMemo(() => loadInitialFlow(workflowId), [workflowId]);
  const [workflowName, setWorkflowName] = useState(initial.name);
  const [nodes, setNodes] = useState<WorkflowFlowNode[]>(initial.nodes);
  const [edges, setEdges] = useState<WorkflowFlowEdge[]>(initial.edges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [runSteps, setRunSteps] = useState<RunStep[]>([]);
  const [runWarnings, setRunWarnings] = useState<string[]>([]);
  const [remoteLoaded, setRemoteLoaded] = useState(!apiEnabled);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  useEffect(() => {
    if (!apiEnabled) return;
    let cancelled = false;
    void fetchWorkflowDetail(workflowId)
      .then((detail) => {
        if (cancelled) return;
        const parsed = WorkflowDefinitionSchema.safeParse(detail.definition);
        if (parsed.success) {
          const flow = definitionToXYFlow(parsed.data);
          setNodes(flow.nodes);
          setEdges(flow.edges);
        }
        setWorkflowName(detail.name);
      })
      .finally(() => {
        if (!cancelled) setRemoteLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [apiEnabled, workflowId]);

  const persist = useCallback(
    (nextNodes: WorkflowFlowNode[], nextEdges: WorkflowFlowEdge[]) => {
      const definition = xyFlowToDefinition(nextNodes, nextEdges);
      if (apiEnabled) {
        void putWorkflowDefinitionRemote(workflowId, definition);
        return;
      }
      saveDefinition(workflowId, definition);
    },
    [apiEnabled, workflowId],
  );

  const schedulePersist = useCallback(
    (nextNodes: WorkflowFlowNode[], nextEdges: WorkflowFlowEdge[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(nextNodes, nextEdges), 400);
    },
    [persist],
  );

  const flushPersist = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    persist(nodesRef.current, edgesRef.current);
  }, [persist]);

  const onNodesChange = useCallback(
    (changes: NodeChange<WorkflowFlowNode>[]) => {
      setNodes((prev) => {
        const next = applyNodeChanges(changes, prev);
        schedulePersist(next, edgesRef.current);
        return next;
      });
    },
    [schedulePersist],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<WorkflowFlowEdge>[]) => {
      setEdges((prev) => {
        const next = applyEdgeChanges(changes, prev);
        schedulePersist(nodesRef.current, next);
        return next;
      });
    },
    [schedulePersist],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((prev) => {
        const next = addEdge(
          { ...connection, id: `e_${connection.source}_${connection.target}` },
          prev,
        );
        schedulePersist(nodesRef.current, next);
        return next;
      });
    },
    [schedulePersist],
  );

  const onDropNode = useCallback(
    (type: AutomationNodeType, position: XYPosition) => {
      if (!AUTOMATION_NODE_TYPES.includes(type)) return;
      const id = `n_${crypto.randomUUID().slice(0, 8)}`;
      const data = defaultNodeData(type);
      const newNode: WorkflowFlowNode = {
        id,
        type,
        position,
        data: { ...data, summary: summarizeNodeData(type, data) },
      };
      setNodes((prev) => {
        const next = [...prev, newNode];
        schedulePersist(next, edgesRef.current);
        return next;
      });
    },
    [schedulePersist],
  );

  const updateNodeData = useCallback(
    (nodeId: string, patch: Partial<WorkflowNodeData>) => {
      setNodes((prev) => {
        const next = prev.map((n) => {
          if (n.id !== nodeId) return n;
          const merged = { ...n.data, ...patch };
          return {
            ...n,
            data: {
              ...merged,
              summary: summarizeNodeData(n.type, merged),
            },
          };
        });
        schedulePersist(next, edgesRef.current);
        return next;
      });
    },
    [schedulePersist],
  );

  const saveNow = useCallback(() => {
    flushPersist();
    if (apiEnabled) {
      void patchWorkflowMetaRemote(workflowId, { name: workflowName });
      return;
    }
    updateWorkflowMeta(workflowId, { name: workflowName });
  }, [apiEnabled, flushPersist, workflowId, workflowName]);

  const runTest = useCallback(() => {
    flushPersist();
    const currentNodes = nodesRef.current;
    const currentEdges = edgesRef.current;

    const applyRunResult = (
      steps: RunStep[],
      warnings: string[],
      nodeStatuses: Record<string, NodeRunStatus>,
    ) => {
      setRunSteps(steps);
      setRunWarnings(warnings);
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          data: {
            ...n.data,
            runStatus: (nodeStatuses[n.id] ?? "idle") as NodeRunStatus,
          },
        })),
      );
    };

    if (apiEnabled) {
      const definition = xyFlowToDefinition(currentNodes, currentEdges);
      void createWorkflowRunRemote(workflowId, { payload: { source: "editor-test" } })
        .then((run) => {
          applyRunResult(
            run.steps,
            [],
            Object.fromEntries(
              definition.nodes.map((n) => [
                n.id,
                run.steps.some((s) => s.id === `step_${n.id}` && s.level === "error")
                  ? "error"
                  : run.steps.some((s) => s.id === `step_${n.id}`)
                    ? "done"
                    : "idle",
              ]),
            ),
          );
        })
        .catch(() => {
          const result = executeWorkflow(definition);
          applyRunResult(result.steps, result.warnings, result.nodeStatuses);
        });
      return;
    }

    const definition = xyFlowToDefinition(currentNodes, currentEdges);
    const result = executeWorkflow(definition);
    applyRunResult(result.steps, result.warnings, result.nodeStatuses);
  }, [apiEnabled, flushPersist, workflowId]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  return {
    workflowName,
    setWorkflowName,
    nodes,
    edges,
    selectedNode,
    selectedNodeId,
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
  };
}
