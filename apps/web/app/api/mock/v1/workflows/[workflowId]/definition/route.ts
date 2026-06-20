import { applyMockApiSimulation, mockApiJson } from "../../../../../../../lib/mock-api";
import { getWorkflowServerStore } from "../../../../../../../lib/workflow-server-store";
import { WorkflowDefinitionSchema } from "../../../../../../../lib/workflow/types";

type RouteContext = {
  params: Promise<{ workflowId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const simulated = await applyMockApiSimulation(request.headers);
  if (simulated) {
    return simulated;
  }

  const { workflowId } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mockApiJson({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = WorkflowDefinitionSchema.safeParse(body);
  if (!parsed.success) {
    return mockApiJson({ error: "Invalid workflow definition" }, { status: 400 });
  }

  const updated = await getWorkflowServerStore().putDefinition(workflowId, parsed.data);
  if (!updated) {
    return mockApiJson({ error: "Workflow not found" }, { status: 404 });
  }
  return mockApiJson({ id: updated.id, updatedAt: updated.updatedAt });
}
