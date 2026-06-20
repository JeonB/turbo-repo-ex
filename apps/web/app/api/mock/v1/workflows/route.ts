import { applyMockApiSimulation, mockApiJson } from "../../../../../lib/mock-api";
import { getWorkflowServerStore } from "../../../../../lib/workflow-server-store";

export async function GET(request: Request) {
  const simulated = await applyMockApiSimulation(request.headers);
  if (simulated) {
    return simulated;
  }
  const workflows = await getWorkflowServerStore().listWorkflows();
  return mockApiJson(workflows);
}

export async function POST(request: Request) {
  const simulated = await applyMockApiSimulation(request.headers);
  if (simulated) {
    return simulated;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return mockApiJson({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name =
    typeof body === "object" && body !== null && "name" in body && typeof body.name === "string"
      ? body.name.trim()
      : "";
  if (!name) {
    return mockApiJson({ error: "name is required" }, { status: 400 });
  }

  const workflow = await getWorkflowServerStore().createWorkflow(name);
  return mockApiJson(workflow, { status: 201 });
}
