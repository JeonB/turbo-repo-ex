import { applyMockApiSimulation, MOCK_API_NO_STORE, mockApiJson } from "../../../../../lib/mock-api";
import { getRunServerStore } from "../../../../../lib/run-server-store";
import { sortRunsByStartedAtDesc } from "../../../../../lib/runs-mock";

export async function GET(request: Request) {
  const simulated = await applyMockApiSimulation(request.headers);
  if (simulated) {
    return simulated;
  }
  const runs = await getRunServerStore().listRuns();
  return mockApiJson(sortRunsByStartedAtDesc(runs), { cacheControl: MOCK_API_NO_STORE });
}
