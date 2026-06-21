import type { WorkflowDefinition, WorkflowNode } from "../workflow/types";

export function topologicalOrder(definition: WorkflowDefinition): {
  ordered: WorkflowNode[];
  warnings: string[];
} {
  const warnings: string[] = [];
  const nodeMap = new Map(definition.nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of definition.nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of definition.edges) {
    if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
      warnings.push(`Invalid edge ${edge.id}: missing node`);
      continue;
    }
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const triggers = definition.nodes.filter((n) => n.type === "trigger");
  const queue: string[] = [];

  if (triggers.length === 0) {
    warnings.push("No trigger node found; executing nodes with no incoming edges.");
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }
  } else {
    for (const t of triggers) {
      if ((inDegree.get(t.id) ?? 0) === 0) queue.push(t.id);
    }
  }

  const ordered: WorkflowNode[] = [];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const id = queue.shift();
    if (!id || visited.has(id)) continue;
    visited.add(id);
    const node = nodeMap.get(id);
    if (node) ordered.push(node);

    for (const next of adjacency.get(id) ?? []) {
      const deg = (inDegree.get(next) ?? 1) - 1;
      inDegree.set(next, deg);
      if (deg === 0) queue.push(next);
    }
  }

  const skipped = definition.nodes.filter((n) => !visited.has(n.id));
  if (skipped.length > 0) {
    warnings.push(`Skipped ${skipped.length} node(s) (cycle or disconnected).`);
  }

  return { ordered, warnings };
}
