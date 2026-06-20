import { z } from "zod";
import { applyMockApiSimulation, mockApiJson } from "../../../../../../lib/mock-api";
import { getWorkflowServerStore } from "../../../../../../lib/workflow-server-store";

const PatchWorkflowBodySchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["active", "paused", "draft"]).optional(),
});

type RouteContext = {
  params: Promise<{ workflowId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const simulated = await applyMockApiSimulation(request.headers);
  if (simulated) {
    return simulated;
  }

  const { workflowId } = await context.params;
  const workflow = await getWorkflowServerStore().getWorkflow(workflowId);
  if (!workflow) {
    return mockApiJson({ error: "Workflow not found" }, { status: 404 });
  }
  return mockApiJson(workflow);
}

export async function PATCH(request: Request, context: RouteContext) {
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

  const parsed = PatchWorkflowBodySchema.safeParse(body);
  if (!parsed.success) {
    return mockApiJson({ error: "Invalid patch body" }, { status: 400 });
  }

  const updated = await getWorkflowServerStore().updateWorkflowMeta(workflowId, parsed.data);
  if (!updated) {
    return mockApiJson({ error: "Workflow not found" }, { status: 404 });
  }
  return mockApiJson(updated);
}
