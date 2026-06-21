import { applyMockApiSimulation, MOCK_API_NO_STORE, mockApiJson } from "../../../../../../lib/mock-api";
import { getRunServerStore } from "../../../../../../lib/run-server-store";

export async function GET(
  request: Request,
  context: { params: Promise<{ runId: string }> },
) {
  const simulated = await applyMockApiSimulation(request.headers);
  if (simulated) {
    return simulated;
  }
  const { runId } = await context.params;
  const run = await getRunServerStore().getRun(runId);
  if (!run) {
    return Response.json(
      { error: `run not found: ${runId}` },
      { status: 404, headers: { "Cache-Control": MOCK_API_NO_STORE } },
    );
  }
  return mockApiJson(run, { cacheControl: MOCK_API_NO_STORE });
}
