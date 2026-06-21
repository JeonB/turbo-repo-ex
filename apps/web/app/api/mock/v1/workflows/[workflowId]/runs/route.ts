import { applyMockApiSimulation, MOCK_API_NO_STORE, mockApiJson } from "../../../../../../../lib/mock-api";
import { getRunServerStore } from "../../../../../../../lib/run-server-store";
import { executeWorkflowOnServer } from "../../../../../../../lib/workflow-runtime";
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
  const workflow = await getWorkflowServerStore().getWorkflow(workflowId);
  if (!workflow) {
    return mockApiJson({ error: "Workflow not found" }, { status: 404, cacheControl: MOCK_API_NO_STORE });
  }

  let payload: Record<string, unknown> = {};
  try {
    const body = (await request.json()) as unknown;
    if (
      typeof body === "object" &&
      body !== null &&
      "payload" in body &&
      typeof (body as { payload?: unknown }).payload === "object" &&
      (body as { payload?: unknown }).payload !== null
    ) {
      payload = (body as { payload: Record<string, unknown> }).payload;
    }
  } catch {
    // empty body is valid for manual test runs
  }

  const startedAt = new Date().toISOString();
  const result = await executeWorkflowOnServer(workflow.definition, { payload });
  const finishedAt = new Date().toISOString();

  const run = await getRunServerStore().createRun({
    workflowId,
    status: result.status,
    startedAt,
    finishedAt,
    steps: result.steps,
  });

  return mockApiJson(run, { status: 201, cacheControl: MOCK_API_NO_STORE });
}
