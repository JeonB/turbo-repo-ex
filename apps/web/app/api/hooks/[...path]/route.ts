import { NextResponse } from "next/server";
import { getRunServerStore } from "../../../../lib/run-server-store";
import { executeWorkflowOnServer } from "../../../../lib/workflow-runtime";
import { findActiveWorkflowByWebhookPath } from "../../../../lib/workflow-runtime/webhook-registry";
import { getWorkflowServerStore } from "../../../../lib/workflow-server-store";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function buildWebhookPayload(request: Request): Promise<Record<string, unknown>> {
  const url = new URL(request.url);
  const payload: Record<string, unknown> = {};
  url.searchParams.forEach((value, key) => {
    payload[key] = value;
  });

  if (request.method === "GET" || request.method === "HEAD") {
    return payload;
  }

  try {
    const body = (await request.json()) as unknown;
    if (typeof body === "object" && body !== null) {
      return { ...payload, ...(body as Record<string, unknown>) };
    }
  } catch {
    // empty or non-JSON body is valid for some webhook calls
  }

  return payload;
}

async function handleWebhook(request: Request, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const workflows = await getWorkflowServerStore().listStoredWorkflows();
  const workflow = findActiveWorkflowByWebhookPath(workflows, path);

  if (!workflow) {
    return NextResponse.json({ error: "No active workflow for this webhook path" }, { status: 404 });
  }

  const payload = await buildWebhookPayload(request);
  const startedAt = new Date().toISOString();
  const result = await executeWorkflowOnServer(workflow.definition, { payload });
  const finishedAt = new Date().toISOString();

  await getRunServerStore().createRun({
    workflowId: workflow.id,
    status: result.status,
    startedAt,
    finishedAt,
    steps: result.steps,
  });

  if (result.status === "failed") {
    return NextResponse.json(
      { error: "Workflow execution failed", steps: result.steps },
      { status: 500 },
    );
  }

  const httpResponse = result.httpResponse ?? { statusCode: 200, body: { ok: true } };
  return NextResponse.json(httpResponse.body, { status: httpResponse.statusCode });
}

export async function GET(request: Request, context: RouteContext) {
  return handleWebhook(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleWebhook(request, context);
}

export async function PUT(request: Request, context: RouteContext) {
  return handleWebhook(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return handleWebhook(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return handleWebhook(request, context);
}
