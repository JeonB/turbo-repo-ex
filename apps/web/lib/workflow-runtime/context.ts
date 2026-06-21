export type ExecutionContext = {
  payload: Record<string, unknown>;
  lastRow?: Record<string, unknown>;
  rows?: unknown[];
  rowCount?: number;
  transformed?: boolean;
  [key: string]: unknown;
};

export function createExecutionContext(payload?: Record<string, unknown>): ExecutionContext {
  return { payload: payload ?? {} };
}
