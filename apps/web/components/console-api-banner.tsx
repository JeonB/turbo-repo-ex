import { ConsoleApiNetworkError, ConsoleApiTimeoutError } from "@repo/api-client";
import { Alert } from "@repo/ui/alert";
import { readApiDevSimulation } from "../lib/api-dev-simulation-server";
import { getConsoleDegradationState } from "../lib/console-degradation";
import { getConsoleApiClient, getConsoleApiBaseUrl } from "../lib/console-api";

export async function ConsoleApiBanner() {
  const baseUrl = getConsoleApiBaseUrl();
  const degradation = getConsoleDegradationState();

  if (!baseUrl) {
    return (
      <div className="ui:mx-auto ui:max-w-5xl ui:px-4 ui:pb-4 ui:pt-2 sm:ui:px-6 lg:ui:px-8">
        <Alert title="API" variant="info">
          <code className="ui:rounded ui:bg-surface-muted ui:px-1">NEXT_PUBLIC_API_URL</code>이 비어 있으면
          mock 데이터와 localStorage로 동작합니다. HTTP 경로를 검증하려면 mock URL을 설정하세요.
        </Alert>
      </div>
    );
  }

  const simulation = await readApiDevSimulation();
  const client = getConsoleApiClient(simulation);
  if (!client) {
    return null;
  }

  let healthOk = false;
  let timedOut = false;
  let networkFailed = false;
  try {
    await client.healthCheck();
    healthOk = true;
  } catch (e) {
    healthOk = false;
    timedOut = e instanceof ConsoleApiTimeoutError;
    networkFailed = e instanceof ConsoleApiNetworkError;
  }

  if (healthOk && !degradation.usedMockFallback) {
    return null;
  }

  if (degradation.usedMockFallback && healthOk) {
    return (
      <div className="ui:mx-auto ui:max-w-5xl ui:px-4 ui:pb-4 ui:pt-2 sm:ui:px-6 lg:ui:px-8">
        <Alert title="데모 데이터" variant="warning">
          API 호출이 일시적으로 실패해 이 페이지는 mock 스냅샷을 표시하고 있습니다. 백엔드 상태를 확인한 뒤
          새로고침하세요.
        </Alert>
      </div>
    );
  }

  return (
    <div className="ui:mx-auto ui:max-w-5xl ui:px-4 ui:pb-4 ui:pt-2 sm:ui:px-6 lg:ui:px-8">
      <Alert title="API" variant="warning">
        {timedOut
          ? "health 확인 요청이 시간 초과되었습니다. API가 느리거나 응답하지 않을 수 있습니다."
          : networkFailed
            ? "health 호출 전에 네트워크에서 실패했습니다. DNS·TLS·방화벽·오프라인을 점검하세요."
            : "API URL은 설정됐지만 health 엔드포인트 호출에 실패했습니다. CORS·경로를 확인하세요."}
      </Alert>
    </div>
  );
}
