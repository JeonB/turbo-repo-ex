import {
  AuditEventsPageSchema,
  HealthCheckSchema,
  IntegrationSchema,
  MemberSummarySchema,
  NotificationDtoSchema,
  RunSchema,
  UsageSummaryDtoSchema,
  WorkflowSchema,
  WorkflowDetailSchema,
  WorkflowDefinitionPutResponseSchema,
} from "./schemas";
import type {
  AuditEventAction,
  AuditEventsPage,
  Integration,
  MemberSummary,
  NotificationCategory,
  NotificationDto,
  NotificationSeverity,
  Run,
  UsageSummaryDto,
  Workflow,
  WorkflowDetail,
  WorkflowStatus,
} from "./types";

/**
 * Default ceiling for outbound requests so SSR and UI do not hang on a stalled API.
 * Kept short (5s) to release connections quickly during traffic spikes.
 */
export const DEFAULT_REQUEST_TIMEOUT_MS = 5_000;

/** Default extra GET attempts after the first try (each full attempt uses `requestTimeoutMs`). */
export const DEFAULT_MAX_RETRIES = 0;

/** Base delay before the first retry; grows by `retryBackoffFactor` each attempt. */
export const DEFAULT_RETRY_DELAY_MS = 250;

export const DEFAULT_RETRY_BACKOFF_FACTOR = 2;

/** Retry waits are jittered by default so simultaneous clients do not retry in lockstep. */
export const DEFAULT_RETRY_JITTER = true;

function generateRequestId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

export type ConsoleApiClientConfig = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  getAccessToken?: () => string | Promise<string | undefined>;
  /**
   * Correlation id for `X-Request-Id`; when omitted, a new id is generated once per logical request
   * (including retries of the same `healthCheck` / `getUsageSummary` call).
   */
  getRequestId?: () => string;
  /** When set, aborts the request after this many milliseconds (combined with `init.signal` when provided). */
  requestTimeoutMs?: number;
  /**
   * Retries idempotent GETs on transient failures.
   * Each attempt has its own `requestTimeoutMs` budget.
   */
  maxRetries?: number;
  /** Milliseconds before the first retry; subsequent waits multiply by `retryBackoffFactor`. */
  retryDelayMs?: number;
  /** Multiplier applied to the wait after each failed attempt. */
  retryBackoffFactor?: number;
  /**
   * When true (default), each retry wait is multiplied by a random factor in [0.5, 1]
   * to spread retries from many clients over time (thundering-herd protection).
   */
  retryJitter?: boolean;
};

export class ConsoleApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string) {
    super(`Console API ${status}: ${body.slice(0, 200)}`);
    this.name = "ConsoleApiError";
    this.status = status;
    this.body = body;
  }
}

export class ConsoleApiTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Console API request timed out after ${timeoutMs}ms`);
    this.name = "ConsoleApiTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

/** Thrown when the transport layer fails before an HTTP response (DNS, TLS, offline, CORS preflight, etc.). */
export class ConsoleApiNetworkError extends Error {
  constructor(message?: string, options?: { cause?: unknown }) {
    super(message ?? "Console API request failed due to a network error", options);
    this.name = "ConsoleApiNetworkError";
  }
}

function isLikelyNetworkFailure(e: unknown): boolean {
  if (e instanceof TypeError) {
    return true;
  }
  if (e instanceof DOMException && e.name === "NetworkError") {
    return true;
  }
  return false;
}

function createTimeoutAbort(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort(
      new DOMException(`Console API request exceeded ${ms}ms`, "TimeoutError"),
    );
  }, ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(id),
  };
}

/**
 * Returns a signal that aborts when either `a` or `b` aborts, propagating `reason` when available.
 */
function anyAbortSignal(a: AbortSignal | null | undefined, b: AbortSignal): AbortSignal {
  if (a == null) {
    return b;
  }
  const out = new AbortController();
  const onAbort = (source: AbortSignal) => {
    out.abort(source.reason);
  };
  if (a.aborted) {
    onAbort(a);
    return out.signal;
  }
  if (b.aborted) {
    onAbort(b);
    return out.signal;
  }
  a.addEventListener("abort", () => onAbort(a), { once: true });
  b.addEventListener("abort", () => onAbort(b), { once: true });
  return out.signal;
}

function delay(ms: number, signal: AbortSignal | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException("The operation was aborted.", "AbortError"));
      return;
    }
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(id);
      reject(signal?.reason ?? new DOMException("The operation was aborted.", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function isRetriableHttpStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

function isRetriableFetchFailure(e: unknown): boolean {
  if (e instanceof TypeError) {
    return true;
  }
  if (e instanceof DOMException && e.name === "NetworkError") {
    return true;
  }
  return false;
}

function isRetriableError(e: unknown): boolean {
  if (e instanceof ConsoleApiTimeoutError) {
    return false;
  }
  if (e instanceof ConsoleApiError && isRetriableHttpStatus(e.status)) {
    return true;
  }
  return isRetriableFetchFailure(e);
}

export type ConsoleApiRequestOptions = {
  signal?: AbortSignal;
};

export type GetAuditEventsParams = {
  actor?: string;
  action?: AuditEventAction;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  signal?: AbortSignal;
};

export type GetNotificationsParams = {
  category?: NotificationCategory;
  severity?: NotificationSeverity;
  signal?: AbortSignal;
};

export type ConsoleApiClient = {
  healthCheck: (options?: ConsoleApiRequestOptions) => Promise<{ status: string }>;
  getUsageSummary: (options?: ConsoleApiRequestOptions) => Promise<UsageSummaryDto>;
  getAuditEvents: (params?: GetAuditEventsParams) => Promise<AuditEventsPage>;
  getIntegrations: (options?: ConsoleApiRequestOptions) => Promise<Integration[]>;
  getRun: (runId: string, options?: ConsoleApiRequestOptions) => Promise<Run>;
  getRuns: (options?: ConsoleApiRequestOptions) => Promise<Run[]>;
  getWorkflows: (options?: ConsoleApiRequestOptions) => Promise<Workflow[]>;
  getWorkflow: (workflowId: string, options?: ConsoleApiRequestOptions) => Promise<WorkflowDetail>;
  createWorkflow: (
    body: { name: string },
    options?: ConsoleApiRequestOptions,
  ) => Promise<WorkflowDetail>;
  patchWorkflow: (
    workflowId: string,
    body: { name?: string; status?: WorkflowStatus },
    options?: ConsoleApiRequestOptions,
  ) => Promise<WorkflowDetail>;
  putWorkflowDefinition: (
    workflowId: string,
    definition: unknown,
    options?: ConsoleApiRequestOptions,
  ) => Promise<{ id: string; updatedAt: string }>;
  createWorkflowRun: (
    workflowId: string,
    body?: { payload?: Record<string, unknown> },
    options?: ConsoleApiRequestOptions,
  ) => Promise<Run>;
  publishWorkflow: (workflowId: string, options?: ConsoleApiRequestOptions) => Promise<WorkflowDetail>;
  getNotifications: (params?: GetNotificationsParams) => Promise<NotificationDto[]>;
  getMembers: (options?: ConsoleApiRequestOptions) => Promise<MemberSummary[]>;
};

export function createConsoleApiClient(config: ConsoleApiClientConfig): ConsoleApiClient {
  const base = config.baseUrl.replace(/\/$/, "");
  const timeoutMs = config.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const maxRetries = Math.max(0, config.maxRetries ?? DEFAULT_MAX_RETRIES);
  const retryDelayMs = config.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const retryBackoffFactor = config.retryBackoffFactor ?? DEFAULT_RETRY_BACKOFF_FACTOR;
  const retryJitter = config.retryJitter ?? DEFAULT_RETRY_JITTER;

  function computeRetryWaitMs(attempt: number): number {
    const baseWaitMs = retryDelayMs * Math.pow(retryBackoffFactor, attempt);
    if (!retryJitter) {
      return baseWaitMs;
    }
    return baseWaitMs * (0.5 + Math.random() * 0.5);
  }

  async function request<T>(
    path: string,
    init?: RequestInit,
    parser?: (raw: unknown) => T,
  ): Promise<T> {
    const outerSignal = init?.signal;
    let lastError: unknown;
    const requestId = config.getRequestId?.() ?? generateRequestId();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const headers = new Headers(init?.headers);
      headers.set("Accept", "application/json");
      headers.set("X-Request-Id", requestId);
      const token = await config.getAccessToken?.();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      const { signal: timeoutSignal, clear: clearRequestTimeout } = createTimeoutAbort(timeoutMs);
      const signal =
        init?.signal !== undefined ? anyAbortSignal(init.signal, timeoutSignal) : timeoutSignal;

      let res: Response;
      try {
        res = await (config.fetchImpl ?? globalThis.fetch)(`${base}${path}`, {
          ...init,
          headers,
          signal,
        });
      } catch (e) {
        const userAborted = init?.signal?.aborted === true;
        const timedOut = timeoutSignal.aborted;
        if (timedOut && !userAborted) {
          lastError = new ConsoleApiTimeoutError(timeoutMs);
        } else {
          lastError = e;
        }
        if (
          attempt < maxRetries &&
          isRetriableError(lastError) &&
          outerSignal?.aborted !== true
        ) {
          await delay(computeRetryWaitMs(attempt), outerSignal ?? undefined);
          continue;
        }
        if (timedOut && !userAborted) {
          throw new ConsoleApiTimeoutError(timeoutMs);
        }
        if (!userAborted && isLikelyNetworkFailure(e)) {
          throw new ConsoleApiNetworkError(undefined, { cause: e });
        }
        throw e;
      } finally {
        clearRequestTimeout();
      }

      if (!res.ok) {
        const text = await res.text();
        const err = new ConsoleApiError(res.status, text);
        if (
          attempt < maxRetries &&
          isRetriableHttpStatus(res.status) &&
          outerSignal?.aborted !== true
        ) {
          lastError = err;
          await delay(computeRetryWaitMs(attempt), outerSignal ?? undefined);
          continue;
        }
        throw err;
      }

      const payload = (await res.json()) as unknown;
      if (!parser) {
        return payload as T;
      }
      try {
        return parser(payload);
      } catch (e) {
        const message = e instanceof Error ? e.message : "unknown parser error";
        throw new ConsoleApiError(200, `invalid_response: ${message}`);
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Console API request failed");
  }

  return {
    healthCheck: (options) =>
      request<{ status: string }>("/health", { signal: options?.signal }, (raw) =>
        HealthCheckSchema.parse(raw),
      ),
    getUsageSummary: (options) =>
      request<UsageSummaryDto>("/v1/usage/summary", { signal: options?.signal }, (raw) =>
        UsageSummaryDtoSchema.parse(raw),
      ),
    getAuditEvents: (params) => {
      const search = new URLSearchParams();
      const page = params?.page ?? 1;
      const size = params?.size ?? 20;
      if (params?.actor) {
        search.set("actor", params.actor);
      }
      if (params?.action) {
        search.set("action", params.action);
      }
      if (params?.from) {
        search.set("from", params.from);
      }
      if (params?.to) {
        search.set("to", params.to);
      }
      search.set("page", String(page));
      search.set("size", String(size));
      return request<AuditEventsPage>(
        `/v1/audit/events?${search.toString()}`,
        { signal: params?.signal },
        (raw) => AuditEventsPageSchema.parse(raw),
      );
    },
    getIntegrations: (options) =>
      request<Integration[]>("/v1/integrations", { signal: options?.signal }, (raw) =>
        IntegrationSchema.array().parse(raw),
      ),
    getWorkflows: (options) =>
      request<Workflow[]>("/v1/workflows", { signal: options?.signal }, (raw) =>
        WorkflowSchema.array().parse(raw),
      ),
    getWorkflow: (workflowId, options) =>
      request<WorkflowDetail>(
        `/v1/workflows/${encodeURIComponent(workflowId)}`,
        { signal: options?.signal },
        (raw) => WorkflowDetailSchema.parse(raw),
      ),
    createWorkflow: (body, options) =>
      request<WorkflowDetail>(
        "/v1/workflows",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: options?.signal,
        },
        (raw) => WorkflowDetailSchema.parse(raw),
      ),
    patchWorkflow: (workflowId, body, options) =>
      request<WorkflowDetail>(
        `/v1/workflows/${encodeURIComponent(workflowId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: options?.signal,
        },
        (raw) => WorkflowDetailSchema.parse(raw),
      ),
    putWorkflowDefinition: (workflowId, definition, options) =>
      request<{ id: string; updatedAt: string }>(
        `/v1/workflows/${encodeURIComponent(workflowId)}/definition`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(definition),
          signal: options?.signal,
        },
        (raw) => WorkflowDefinitionPutResponseSchema.parse(raw),
      ),
    createWorkflowRun: (workflowId, body, options) =>
      request<Run>(
        `/v1/workflows/${encodeURIComponent(workflowId)}/runs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body ?? {}),
          signal: options?.signal,
        },
        (raw) => RunSchema.parse(raw),
      ),
    publishWorkflow: (workflowId, options) =>
      request<WorkflowDetail>(
        `/v1/workflows/${encodeURIComponent(workflowId)}/publish`,
        {
          method: "POST",
          signal: options?.signal,
        },
        (raw) => WorkflowDetailSchema.parse(raw),
      ),
    getRun: (runId, options) =>
      request<Run>(`/v1/runs/${encodeURIComponent(runId)}`, { signal: options?.signal }, (raw) =>
        RunSchema.parse(raw),
      ),
    getRuns: (options) =>
      request<Run[]>("/v1/runs", { signal: options?.signal }, (raw) =>
        RunSchema.array().parse(raw),
      ),
    getNotifications: (params) => {
      const search = new URLSearchParams();
      if (params?.category) {
        search.set("category", params.category);
      }
      if (params?.severity) {
        search.set("severity", params.severity);
      }
      const query = search.toString();
      return request<NotificationDto[]>(
        `/v1/notifications${query ? `?${query}` : ""}`,
        { signal: params?.signal },
        (raw) => NotificationDtoSchema.array().parse(raw),
      );
    },
    getMembers: (options) =>
      request<MemberSummary[]>("/v1/members", { signal: options?.signal }, (raw) =>
        MemberSummarySchema.array().parse(raw),
      ),
  };
}
