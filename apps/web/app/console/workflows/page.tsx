import { Alert } from "@repo/ui/alert";
import { PermissionGate } from "../../../components/permission-gate";
import { getConsoleApiBaseUrl } from "../../../lib/console-api";
import { hasPermission } from "../../../lib/rbac";
import { getSession } from "../../../lib/session";
import { getWorkflowsData } from "../../../lib/workflows-mock";
import { WorkflowsTable } from "./workflows-table";

export default async function WorkflowsPage() {
  const workflows = await getWorkflowsData();
  const session = await getSession();
  const canManage = session ? hasPermission(session.role, "workflows:manage") : false;
  const apiConfigured = Boolean(getConsoleApiBaseUrl());

  return (
    <div className="ui:mx-auto ui:max-w-5xl ui:px-4 ui:py-10 ui:text-text-primary sm:ui:px-6 lg:ui:px-8">
      <h1 className="ui:text-2xl ui:font-bold ui:tracking-tight">워크플로</h1>
      <p className="ui:mt-2 ui:text-sm ui:text-text-secondary">
        배포된 자동화 흐름을 편집하고, 트리거 → DB 조회 → 응답/알림 흐름을 시각적으로 확인합니다.
      </p>

      <PermissionGate
        fallback={
          <Alert title="권한" variant="info">
            워크플로 조회는 owner, admin, member, viewer 역할에서 가능합니다.
          </Alert>
        }
        permission="workflows:read"
      >
        <div className="ui:mt-8 ui:overflow-x-auto ui:rounded-ui-lg ui:border ui:border-border-subtle ui:bg-surface-raised ui:p-4">
          <WorkflowsTable
            apiConfigured={apiConfigured}
            initialWorkflows={workflows}
            showCreate={canManage}
          />
        </div>
      </PermissionGate>
    </div>
  );
}
