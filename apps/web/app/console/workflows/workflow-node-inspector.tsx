"use client";

import { Field } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import { Select } from "@repo/ui/select";
import type { WorkflowFlowNode } from "../../../lib/workflow";
import type { AutomationNodeType, DbQueryPreset, WorkflowNodeData } from "../../../lib/workflow/types";
import { DB_QUERY_PRESETS } from "../../../lib/workflow/types";

type WorkflowNodeInspectorProps = {
  node: WorkflowFlowNode | null;
  onUpdate: (nodeId: string, patch: Partial<WorkflowNodeData>) => void;
  readOnly?: boolean;
};

export function WorkflowNodeInspector({ node, onUpdate, readOnly }: WorkflowNodeInspectorProps) {
  if (!node) {
    return (
      <aside className="ui:w-80 ui:shrink-0 ui:rounded-ui-lg ui:border ui:border-border-subtle ui:bg-surface-raised ui:p-4">
        <p className="ui:text-sm ui:text-text-secondary">노드를 선택하면 설정을 편집할 수 있습니다.</p>
      </aside>
    );
  }

  const type = (node.type ?? "transform") as AutomationNodeType;
  const data = node.data;

  const patch = (partial: Partial<WorkflowNodeData>) => {
    if (readOnly) return;
    onUpdate(node.id, partial);
  };

  return (
    <aside className="ui:flex ui:w-80 ui:shrink-0 ui:flex-col ui:gap-4 ui:overflow-y-auto ui:rounded-ui-lg ui:border ui:border-border-subtle ui:bg-surface-raised ui:p-4">
      <div>
        <h2 className="ui:text-sm ui:font-semibold ui:text-text-primary">노드 설정</h2>
        <p className="ui:mt-1 ui:text-xs ui:text-text-muted">{type}</p>
      </div>

      <Field id="node-label" label="표시 이름">
        <Input
          name="label"
          readOnly={readOnly}
          value={data.label}
          onChange={(e) => patch({ label: e.target.value })}
        />
      </Field>

      {type === "trigger" ? (
        <>
          <Field id="trigger-kind" label="트리거 종류">
            <Select
              name="triggerKind"
              disabled={readOnly}
              value={data.trigger?.kind ?? "webhook"}
              onChange={(e) =>
                patch({
                  trigger: {
                    kind: e.target.value as "webhook" | "schedule" | "event",
                    path: data.trigger?.path,
                    schedule: data.trigger?.schedule,
                    eventName: data.trigger?.eventName,
                  },
                })
              }
            >
              <option value="webhook">Webhook</option>
              <option value="schedule">Schedule</option>
              <option value="event">Event</option>
            </Select>
          </Field>
          {data.trigger?.kind === "webhook" ? (
            <Field id="trigger-path" label="Webhook path">
              <Input
                name="triggerPath"
                readOnly={readOnly}
                value={data.trigger?.path ?? ""}
                onChange={(e) =>
                  patch({ trigger: { ...data.trigger!, kind: "webhook", path: e.target.value } })
                }
              />
            </Field>
          ) : null}
          {data.trigger?.kind === "schedule" ? (
            <Field id="trigger-schedule" label="Cron / schedule">
              <Input
                name="triggerSchedule"
                readOnly={readOnly}
                value={data.trigger?.schedule ?? ""}
                onChange={(e) =>
                  patch({ trigger: { ...data.trigger!, kind: "schedule", schedule: e.target.value } })
                }
              />
            </Field>
          ) : null}
          {data.trigger?.kind === "event" ? (
            <Field id="trigger-event" label="Event name">
              <Input
                name="triggerEvent"
                readOnly={readOnly}
                value={data.trigger?.eventName ?? ""}
                onChange={(e) =>
                  patch({ trigger: { ...data.trigger!, kind: "event", eventName: e.target.value } })
                }
              />
            </Field>
          ) : null}
        </>
      ) : null}

      {type === "dbQuery" ? (
        <>
          <Field id="db-table" label="Table">
            <Input
              name="dbTable"
              readOnly={readOnly}
              value={data.dbQuery?.table ?? ""}
              onChange={(e) =>
                patch({ dbQuery: { ...data.dbQuery!, table: e.target.value, queryPreset: data.dbQuery?.queryPreset ?? "list_recent" } })
              }
            />
          </Field>
          <Field id="db-preset" label="Query preset">
            <Select
              name="dbPreset"
              disabled={readOnly}
              value={data.dbQuery?.queryPreset ?? "list_recent"}
              onChange={(e) =>
                patch({
                  dbQuery: {
                    table: data.dbQuery?.table ?? "contacts",
                    queryPreset: e.target.value as DbQueryPreset,
                  },
                })
              }
            >
              {DB_QUERY_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </Select>
          </Field>
        </>
      ) : null}

      {type === "transform" ? (
        <Field id="transform-expr" label="Expression">
          <Input
            name="transformExpression"
            readOnly={readOnly}
            value={data.transform?.expression ?? ""}
            onChange={(e) => patch({ transform: { expression: e.target.value } })}
          />
        </Field>
      ) : null}

      {type === "httpResponse" ? (
        <>
          <Field id="http-status" label="Status code">
            <Input
              name="httpStatus"
              readOnly={readOnly}
              type="number"
              value={String(data.httpResponse?.statusCode ?? 200)}
              onChange={(e) =>
                patch({
                  httpResponse: {
                    statusCode: Number(e.target.value),
                    bodyTemplate: data.httpResponse?.bodyTemplate ?? "{}",
                  },
                })
              }
            />
          </Field>
          <Field id="http-body" label="Body template">
            <Input
              name="httpBody"
              readOnly={readOnly}
              value={data.httpResponse?.bodyTemplate ?? ""}
              onChange={(e) =>
                patch({
                  httpResponse: {
                    statusCode: data.httpResponse?.statusCode ?? 200,
                    bodyTemplate: e.target.value,
                  },
                })
              }
            />
          </Field>
        </>
      ) : null}

      {type === "slackNotify" ? (
        <>
          <Field id="slack-channel" label="Channel">
            <Input
              name="slackChannel"
              readOnly={readOnly}
              value={data.slackNotify?.channel ?? ""}
              onChange={(e) =>
                patch({
                  slackNotify: {
                    channel: e.target.value,
                    messageTemplate: data.slackNotify?.messageTemplate ?? "",
                  },
                })
              }
            />
          </Field>
          <Field id="slack-message" label="Message">
            <Input
              name="slackMessage"
              readOnly={readOnly}
              value={data.slackNotify?.messageTemplate ?? ""}
              onChange={(e) =>
                patch({
                  slackNotify: {
                    channel: data.slackNotify?.channel ?? "#alerts",
                    messageTemplate: e.target.value,
                  },
                })
              }
            />
          </Field>
        </>
      ) : null}

      {type === "emailSend" ? (
        <>
          <Field id="email-to" label="To">
            <Input
              name="emailTo"
              readOnly={readOnly}
              value={data.emailSend?.to ?? ""}
              onChange={(e) =>
                patch({
                  emailSend: {
                    to: e.target.value,
                    subject: data.emailSend?.subject ?? "",
                    bodyTemplate: data.emailSend?.bodyTemplate ?? "",
                  },
                })
              }
            />
          </Field>
          <Field id="email-subject" label="Subject">
            <Input
              name="emailSubject"
              readOnly={readOnly}
              value={data.emailSend?.subject ?? ""}
              onChange={(e) =>
                patch({
                  emailSend: {
                    to: data.emailSend?.to ?? "",
                    subject: e.target.value,
                    bodyTemplate: data.emailSend?.bodyTemplate ?? "",
                  },
                })
              }
            />
          </Field>
        </>
      ) : null}
    </aside>
  );
}
