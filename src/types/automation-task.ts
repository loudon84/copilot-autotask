export type AutomationTaskStatus =
  | "DRAFT"
  | "READY"
  | "QUEUED"
  | "RUNNING"
  | "WAITING_HUMAN"
  | "HUMAN_OPERATING"
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
  customerName: string;
  srmPortalName: string;
  workflowTemplateId: string;
  workflowTemplateName: string;
  status: AutomationTaskStatus;
  priority: TaskPriority;
  owner: string;
  input: Record<string, unknown>;
  currentStep?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}
