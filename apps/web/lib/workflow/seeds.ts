import type { WorkflowDefinition, WorkflowRegistryEntry } from "./types";
import { defaultNodeData } from "./types";

export const SEED_REGISTRY: WorkflowRegistryEntry[] = [
  {
    id: "wf_lead_sync",
    name: "Lead Intake to CRM",
    trigger: "webhook.lead.created",
    status: "active",
    lastRunId: "run_1001",
    lastRunStatus: "succeeded",
    updatedAt: "2026-04-28T11:00:00.000Z",
  },
  {
    id: "wf_contract_notice",
    name: "Contract Renewal Notice",
    trigger: "schedule.daily.09",
    status: "active",
    lastRunId: "run_1002",
    lastRunStatus: "failed",
    updatedAt: "2026-04-28T10:50:00.000Z",
  },
  {
    id: "wf_trial_nurture",
    name: "Trial Nurture Sequence",
    trigger: "event.trial.started",
    status: "paused",
    lastRunId: "run_1003",
    lastRunStatus: "cancelled",
    updatedAt: "2026-04-28T10:20:00.000Z",
  },
  {
    id: "wf_leads_api",
    name: "Leads CRUD API",
    trigger: "webhook.leads",
    status: "active",
    updatedAt: "2026-06-20T12:00:00.000Z",
  },
];

export const SEED_DEFINITIONS: Record<string, WorkflowDefinition> = {
  wf_lead_sync: {
    version: 1,
    nodes: [
      {
        id: "n_trigger",
        type: "trigger",
        position: { x: 0, y: 80 },
        data: {
          ...defaultNodeData("trigger", "Webhook Trigger"),
          trigger: { kind: "webhook", path: "/hooks/lead.created" },
        },
      },
      {
        id: "n_db",
        type: "dbQuery",
        position: { x: 280, y: 80 },
        data: {
          ...defaultNodeData("dbQuery", "Upsert Contact"),
          dbQuery: { table: "contacts", queryPreset: "by_id" },
        },
      },
      {
        id: "n_transform",
        type: "transform",
        position: { x: 560, y: 80 },
        data: {
          ...defaultNodeData("transform", "Map CRM Fields"),
          transform: { expression: "map(lead → contact)" },
        },
      },
      {
        id: "n_http",
        type: "httpResponse",
        position: { x: 840, y: 80 },
        data: {
          ...defaultNodeData("httpResponse", "Return Payload"),
          httpResponse: { statusCode: 200, bodyTemplate: '{"contactId":"{{id}}"}' },
        },
      },
    ],
    edges: [
      { id: "e1", source: "n_trigger", target: "n_db" },
      { id: "e2", source: "n_db", target: "n_transform" },
      { id: "e3", source: "n_transform", target: "n_http" },
    ],
  },
  wf_contract_notice: {
    version: 1,
    nodes: [
      {
        id: "n_trigger",
        type: "trigger",
        position: { x: 0, y: 80 },
        data: {
          ...defaultNodeData("trigger", "Daily Schedule"),
          trigger: { kind: "schedule", schedule: "0 9 * * *" },
        },
      },
      {
        id: "n_db",
        type: "dbQuery",
        position: { x: 280, y: 80 },
        data: {
          ...defaultNodeData("dbQuery", "Expiring Contracts"),
          dbQuery: { table: "contracts", queryPreset: "list_recent" },
        },
      },
      {
        id: "n_email",
        type: "emailSend",
        position: { x: 560, y: 80 },
        data: {
          ...defaultNodeData("emailSend", "Renewal Batch"),
          emailSend: {
            to: "customers@example.com",
            subject: "Contract renewal reminder",
            bodyTemplate: "{{count}} contracts expiring soon",
          },
        },
      },
    ],
    edges: [
      { id: "e1", source: "n_trigger", target: "n_db" },
      { id: "e2", source: "n_db", target: "n_email" },
    ],
  },
  wf_trial_nurture: {
    version: 1,
    nodes: [
      {
        id: "n_trigger",
        type: "trigger",
        position: { x: 0, y: 80 },
        data: {
          ...defaultNodeData("trigger", "Trial Started"),
          trigger: { kind: "event", eventName: "trial.started" },
        },
      },
      {
        id: "n_slack",
        type: "slackNotify",
        position: { x: 320, y: 80 },
        data: {
          ...defaultNodeData("slackNotify", "Notify Sales"),
          slackNotify: { channel: "#sales", messageTemplate: "New trial: {{email}}" },
        },
      },
    ],
    edges: [{ id: "e1", source: "n_trigger", target: "n_slack" }],
  },
  wf_leads_api: {
    version: 1,
    nodes: [
      {
        id: "n_trigger",
        type: "trigger",
        position: { x: 0, y: 80 },
        data: {
          ...defaultNodeData("trigger", "Webhook Trigger"),
          trigger: { kind: "webhook", path: "/hooks/leads" },
        },
      },
      {
        id: "n_db",
        type: "dbQuery",
        position: { x: 280, y: 80 },
        data: {
          ...defaultNodeData("dbQuery", "Create Lead"),
          dbQuery: { table: "leads", queryPreset: "create" },
        },
      },
      {
        id: "n_http",
        type: "httpResponse",
        position: { x: 560, y: 80 },
        data: {
          ...defaultNodeData("httpResponse", "Created Response"),
          httpResponse: {
            statusCode: 201,
            bodyTemplate: '{"id":"{{id}}","email":"{{email}}"}',
          },
        },
      },
    ],
    edges: [
      { id: "e1", source: "n_trigger", target: "n_db" },
      { id: "e2", source: "n_db", target: "n_http" },
    ],
  },
};

export function createEmptyDefinition(): WorkflowDefinition {
  return {
    version: 1,
    nodes: [
      {
        id: "n_trigger_new",
        type: "trigger",
        position: { x: 80, y: 120 },
        data: defaultNodeData("trigger", "Webhook Trigger"),
      },
    ],
    edges: [],
  };
}
