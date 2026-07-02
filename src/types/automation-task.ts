import type { HumanAction } from "@/types/human-action";

export type AutomationTaskStatus =
  | "DRAFT"
  | "READY"
  | "QUEUED"
  | "RUNNING"
  | "WAITING_HUMAN"
  | "HUMAN_OPERATING"
  | "HUMAN_CONFIRMED"
  | "WAITING_RETRY"
  | "SUCCESS"
  | "SUCCESS_MANUAL"
  | "PARTIAL_SUCCESS"
  | "FAILED"
  | "CANCELLED";

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export interface AutomationTask {
  id: string;
  title: string;
  taskType: string;

  customerId?: string;
  customerName: string;

  portalId?: string;
  srmPortalName: string;

  workflowTemplateId: string;
  workflowTemplateName: string;

  status: AutomationTaskStatus;
  priority: TaskPriority;
  owner: string;

  input: Record<string, unknown>;
  currentStep?: string;
  progress: number;

  humanActionId?: string;
  humanAction?: HumanAction;

  createdAt: string;
  updatedAt: string;
}
