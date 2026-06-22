import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ConsoleApiError,
  ConsoleApiNetworkError,
  ConsoleApiTimeoutError,
  createConsoleApiClient,
  DEFAULT_REQUEST_TIMEOUT_MS,
} from "./client";

/** Mimics real fetch: rejects when `init.signal` aborts (tests use a custom `fetchImpl`). */
function createHangingFetch(): typeof fetch {
  return (_url, init) => {
    const signal = init?.signal;
    if (!signal) {
      return Promise.reject(new Error("expected RequestInit.signal"));
    }
    if (signal.aborted) {
      return Promise.reject(
        signal.reason ?? new DOMException("The operation was aborted.", "AbortError"),
      );
    }
    return new Promise<Response>((_, reject) => {
      signal.addEventListener(
        "abort",
        () => {
          reject(signal.reason ?? new DOMException("The operation was aborted.", "AbortError"));
        },
        { once: true },
      );
    });
  };
}

describe("createConsoleApiClient", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws ConsoleApiTimeoutError when the request exceeds requestTimeoutMs", async () => {
    const fetchImpl = vi.fn(createHangingFetch());
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 30,
    });

    await expect(client.healthCheck()).rejects.toThrow(ConsoleApiTimeoutError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it("rethrows caller AbortError when the caller signal is aborted", async () => {
    const fetchImpl = vi.fn(createHangingFetch());
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 60_000,
    });

    const ac = new AbortController();
    ac.abort();

    await expect(client.healthCheck({ signal: ac.signal })).rejects.toMatchObject({
      name: "AbortError",
    });
  });

  it("uses DEFAULT_REQUEST_TIMEOUT_MS when requestTimeoutMs is omitted", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(createHangingFetch());
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
    });

    const pending = client.healthCheck();
    const assertion = expect(pending).rejects.toThrow(ConsoleApiTimeoutError);
    await vi.advanceTimersByTimeAsync(DEFAULT_REQUEST_TIMEOUT_MS);
    await assertion;
  });

  it("wraps fetch TypeError as ConsoleApiNetworkError when retries are disabled", async () => {
    const fetchImpl = vi.fn(async (): Promise<Response> => {
      throw new TypeError("Failed to fetch");
    });
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.healthCheck()).rejects.toThrow(ConsoleApiNetworkError);
  });

  it("sends X-Request-Id and reuses it across retries", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("unavailable", { status: 503, headers: { "Content-Type": "text/plain" } }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
      maxRetries: 2,
      retryDelayMs: 0,
    });

    await expect(client.healthCheck()).resolves.toEqual({ status: "ok" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const h0 = fetchImpl.mock.calls[0]?.[1] as RequestInit | undefined;
    const h1 = fetchImpl.mock.calls[1]?.[1] as RequestInit | undefined;
    const id0 = new Headers(h0?.headers).get("X-Request-Id");
    const id1 = new Headers(h1?.headers).get("X-Request-Id");
    expect(id0).toBeTruthy();
    expect(id0).toBe(id1);
  });

  it("retries on 503 then succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("unavailable", { status: 503, headers: { "Content-Type": "text/plain" } }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
      maxRetries: 2,
      retryDelayMs: 0,
    });

    await expect(client.healthCheck()).resolves.toEqual({ status: "ok" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("does not retry on 500", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response("err", { status: 500, headers: { "Content-Type": "text/plain" } }),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
      maxRetries: 2,
      retryDelayMs: 0,
    });

    await expect(client.healthCheck()).rejects.toThrow(ConsoleApiError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("does not retry when the attempt times out", async () => {
    const fetchImpl = vi.fn(createHangingFetch());
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 30,
      maxRetries: 3,
      retryDelayMs: 0,
    });

    await expect(client.healthCheck()).rejects.toThrow(ConsoleApiTimeoutError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("retries on fetch TypeError then succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
      maxRetries: 2,
      retryDelayMs: 0,
    });

    await expect(client.healthCheck()).resolves.toEqual({ status: "ok" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("returns JSON on success", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.healthCheck()).resolves.toEqual({ status: "ok" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/health",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("parses audit events response with zod schema", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify({
            items: [
              {
                id: "evt_1",
                occurredAt: "2026-01-10T00:00:00.000Z",
                actor: { id: "usr_1", email: "owner@example.com", name: "Owner" },
                action: "member.invited",
                target: { type: "member", id: "usr_2", label: "member@example.com" },
                ip: "10.0.0.1",
              },
            ],
            total: 1,
            page: 2,
            size: 10,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(
      client.getAuditEvents({ actor: "owner", action: "member.invited", page: 2, size: 10 }),
    ).resolves.toEqual({
      items: [
        {
          id: "evt_1",
          occurredAt: "2026-01-10T00:00:00.000Z",
          actor: { id: "usr_1", email: "owner@example.com", name: "Owner" },
          action: "member.invited",
          target: { type: "member", id: "usr_2", label: "member@example.com" },
          ip: "10.0.0.1",
        },
      ],
      total: 1,
      page: 2,
      size: 10,
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/audit/events?actor=owner&action=member.invited&page=2&size=10",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("throws ConsoleApiError when audit response shape is invalid", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify({
            items: [{ id: "evt_1", action: "member.invited" }],
            total: 1,
            page: 1,
            size: 20,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.getAuditEvents()).rejects.toThrow(ConsoleApiError);
  });

  it("parses integrations list", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify([
            {
              id: "int_1",
              name: "Slack",
              vendor: "Slack",
              status: "connected",
              lastSyncAt: "2026-04-28T11:00:00.000Z",
            },
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.getIntegrations()).resolves.toEqual([
      {
        id: "int_1",
        name: "Slack",
        vendor: "Slack",
        status: "connected",
        lastSyncAt: "2026-04-28T11:00:00.000Z",
      },
    ]);
  });

  it("parses run detail response", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify({
            id: "run_1",
            workflowId: "wf_1",
            status: "running",
            startedAt: "2026-04-28T11:00:00.000Z",
            steps: [
              {
                id: "step_1",
                title: "Parse Payload",
                message: "Webhook payload parsed",
                level: "info",
                startedAt: "2026-04-28T11:00:01.000Z",
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.getRun("run_1")).resolves.toMatchObject({
      id: "run_1",
      workflowId: "wf_1",
      status: "running",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/runs/run_1",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("uses access token and custom request id when provided", async () => {
    const fetchImpl = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit): Promise<Response> =>
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example/",
      fetchImpl,
      requestTimeoutMs: 5_000,
      getAccessToken: () => "token-123",
      getRequestId: () => "req-fixed",
    });

    await expect(client.healthCheck()).resolves.toEqual({ status: "ok" });
    const init = fetchImpl.mock.calls[0]?.[1] as RequestInit | undefined;
    const headers = new Headers(init?.headers);
    expect(headers.get("Authorization")).toBe("Bearer token-123");
    expect(headers.get("X-Request-Id")).toBe("req-fixed");
  });

  it("uses default pagination params for audit events", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(JSON.stringify({ items: [], total: 0, page: 1, size: 20 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.getAuditEvents()).resolves.toEqual({ items: [], total: 0, page: 1, size: 20 });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/audit/events?page=1&size=20",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("supports audit date range filters", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(JSON.stringify({ items: [], total: 0, page: 1, size: 20 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await client.getAuditEvents({ from: "2026-04-01", to: "2026-04-30" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/audit/events?from=2026-04-01&to=2026-04-30&page=1&size=20",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it("parses usage summary and workflows response", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            mrrUsd: 9999,
            activeSeats: 28,
            churnRate: 0.04,
            nps: 52,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              id: "wf_1",
              name: "Lead Sync",
              trigger: "webhook",
              status: "active",
              updatedAt: "2026-04-28T11:00:00.000Z",
            },
          ]),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.getUsageSummary()).resolves.toMatchObject({ activeSeats: 28 });
    await expect(client.getWorkflows()).resolves.toHaveLength(1);
  });

  it("parses workflow detail and definition endpoints", async () => {
    const definition = { version: 1, nodes: [], edges: [] };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "wf_1",
            name: "Lead Sync",
            trigger: "webhook.lead.created",
            status: "active",
            updatedAt: "2026-04-28T11:00:00.000Z",
            definition,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "wf_1", updatedAt: "2026-04-28T12:00:00.000Z" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.getWorkflow("wf_1")).resolves.toMatchObject({
      id: "wf_1",
      definition,
    });
    await expect(client.putWorkflowDefinition("wf_1", definition)).resolves.toMatchObject({
      id: "wf_1",
    });
  });

  it("parses publish workflow endpoint", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: "wf_1",
          name: "Lead Sync",
          trigger: "webhook.lead.created",
          status: "active",
          updatedAt: "2026-04-28T12:00:00.000Z",
          definition: { version: 1, nodes: [], edges: [] },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.publishWorkflow("wf_1")).resolves.toMatchObject({
      id: "wf_1",
      status: "active",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/workflows/wf_1/publish",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("throws ConsoleApiNetworkError for DOMException NetworkError", async () => {
    const fetchImpl = vi.fn(async (): Promise<Response> => {
      throw new DOMException("network down", "NetworkError");
    });
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.healthCheck()).rejects.toThrow(ConsoleApiNetworkError);
  });

  it("retries with exponential backoff for retriable statuses", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("gateway", { status: 502, headers: { "Content-Type": "text/plain" } }),
      )
      .mockResolvedValueOnce(
        new Response("gateway", { status: 503, headers: { "Content-Type": "text/plain" } }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
      maxRetries: 3,
      retryDelayMs: 100,
      retryBackoffFactor: 2,
    });

    const pending = client.healthCheck();
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);
    await expect(pending).resolves.toEqual({ status: "ok" });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("throws ConsoleApiError when health response schema is invalid", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(JSON.stringify({ bad: "shape" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
    });

    await expect(client.healthCheck()).rejects.toThrow(ConsoleApiError);
  });

  it("does not retry on network errors when caller signal is already aborted", async () => {
    const fetchImpl = vi.fn(async (): Promise<Response> => {
      throw new TypeError("Failed to fetch");
    });
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      maxRetries: 2,
      retryDelayMs: 0,
    });
    const ac = new AbortController();
    ac.abort();

    await expect(client.healthCheck({ signal: ac.signal })).rejects.toBeInstanceOf(TypeError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("parses runs list from /v1/runs", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify([
            {
              id: "run_1",
              workflowId: "wf_1",
              status: "succeeded",
              startedAt: "2026-04-28T11:00:00.000Z",
              finishedAt: "2026-04-28T11:00:06.000Z",
              steps: [],
            },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.getRuns()).resolves.toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/runs",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("parses notifications and forwards category/severity filters", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify([
            {
              id: "ntf_1",
              title: "워크플로 실행 실패",
              description: "run_1002가 중단되었습니다.",
              category: "run",
              severity: "error",
              createdAt: "2026-04-28T10:50:04.000Z",
              href: "/console/runs/run_1002",
            },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(
      client.getNotifications({ category: "run", severity: "error" }),
    ).resolves.toMatchObject([{ id: "ntf_1", category: "run" }]);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/notifications?category=run&severity=error",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("requests /v1/notifications without query when no filters are set", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.getNotifications()).resolves.toEqual([]);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/notifications",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("parses members list from /v1/members", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify([
            { id: "1", name: "김운영", email: "owner@example.com", role: "owner" },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
    });

    await expect(client.getMembers()).resolves.toEqual([
      { id: "1", name: "김운영", email: "owner@example.com", role: "owner" },
    ]);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/members",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("applies jitter in [0.5, 1] of the backoff delay by default", async () => {
    vi.useFakeTimers();
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);
    try {
      const fetchImpl = vi
        .fn()
        .mockResolvedValueOnce(
          new Response("unavailable", { status: 503, headers: { "Content-Type": "text/plain" } }),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      const client = createConsoleApiClient({
        baseUrl: "https://api.example",
        fetchImpl,
        requestTimeoutMs: 5_000,
        maxRetries: 1,
        retryDelayMs: 100,
      });

      const pending = client.healthCheck();
      // Math.random() === 0 → jitter factor 0.5 → wait 50ms instead of 100ms.
      await vi.advanceTimersByTimeAsync(50);
      await expect(pending).resolves.toEqual({ status: "ok" });
      expect(fetchImpl).toHaveBeenCalledTimes(2);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("uses the exact backoff delay when retryJitter is false", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("unavailable", { status: 503, headers: { "Content-Type": "text/plain" } }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
      requestTimeoutMs: 5_000,
      maxRetries: 1,
      retryDelayMs: 100,
      retryJitter: false,
    });

    const pending = client.healthCheck();
    await vi.advanceTimersByTimeAsync(99);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await expect(pending).resolves.toEqual({ status: "ok" });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("URL-encodes run id in getRun request path", async () => {
    const fetchImpl = vi.fn(
      async (): Promise<Response> =>
        new Response(
          JSON.stringify({
            id: "run/with space",
            workflowId: "wf_1",
            status: "queued",
            startedAt: "2026-04-28T11:00:00.000Z",
            steps: [],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    );
    const client = createConsoleApiClient({
      baseUrl: "https://api.example",
      fetchImpl,
    });

    await client.getRun("run/with space");
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.example/v1/runs/run%2Fwith%20space",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
  });
});
