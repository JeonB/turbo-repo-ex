import { applyMockApiSimulation, MOCK_API_NO_STORE, mockApiJson } from "../../../../../../../lib/mock-api";
import { getWorkflowServerStore } from "../../../../../../../lib/workflow-server-store";

type RouteContext = {
  params: Promise<{ workflowId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const simulated = await applyMockApiSimulation(request.headers);
  if (simulated) {
    return simulated;
  }

  const { workflowId } = await context.params;
  const result = await getWorkflowServerStore().publishWorkflow(workflowId);

  if (!result.ok && result.error === "not_found") {
    return mockApiJson({ error: "Workflow not found" }, { status: 404, cacheControl: MOCK_API_NO_STORE });
  }

  if (!result.ok && result.error === "path_conflict") {
    return mockApiJson(
      {
        error: "Webhook path already in use by another active workflow",
        conflictWorkflowId: result.conflictWorkflowId,
      },
      { status: 409, cacheControl: MOCK_API_NO_STORE },
    );
  }

  return mockApiJson(result.workflow, { cacheControl: MOCK_API_NO_STORE });
}
