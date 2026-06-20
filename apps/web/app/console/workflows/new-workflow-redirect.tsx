"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  createWorkflow,
  createWorkflowRemote,
  ensureWorkflowSeeds,
  isWorkflowApiEnabled,
} from "../../../lib/workflow";

export function NewWorkflowRedirect() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    void (async () => {
      try {
        if (isWorkflowApiEnabled()) {
          const detail = await createWorkflowRemote("새 워크플로");
          router.replace(`/console/workflows/${detail.id}`);
          return;
        }
        ensureWorkflowSeeds();
        const { id } = createWorkflow("새 워크플로");
        router.replace(`/console/workflows/${id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "워크플로 생성에 실패했습니다.");
      }
    })();
  }, [router]);

  if (error) {
    return <p className="ui:text-sm ui:text-semantic-danger">{error}</p>;
  }

  return <p className="ui:text-sm ui:text-text-secondary">새 워크플로를 준비하는 중…</p>;
}
