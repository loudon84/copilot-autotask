import dashboardData from "@/mock/dashboard.json";
import tasksData from "@/mock/tasks.json";
import taskRunsData from "@/mock/task-runs.json";
import workflowTemplatesData from "@/mock/workflow-templates.json";
import rpaComponentsData from "@/mock/rpa-components.json";
import srmPortalsData from "@/mock/srm-portals.json";
import workersData from "@/mock/workers.json";
import artifactsData from "@/mock/artifacts.json";
import auditLogsData from "@/mock/audit-logs.json";
import { mergeTasks, useTaskStore } from "@/stores/task-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  getHumanActionById,
  getHumanActionByTaskId,
  getHumanActionsFromStore,
  useHumanActionStore,
} from "@/stores/human-action-store";
import type { AutomationTask, AutomationTaskStatus } from "@/types/automation-task";
import type { HumanAction } from "@/types/human-action";
import type { WorkflowTemplate } from "@/types/workflow";
import type { TaskRun } from "@/types/task-run";
import type { SRMPortal } from "@/types/srm-portal";
import type { Artifact } from "@/types/artifact";
import type { Worker } from "@/types/worker";
import type { DashboardData } from "@/types/dashboard";
import type { AppSettings } from "@/types/settings";
import type { RpaComponent } from "@/types/rpa-component";
import type { AuditLog } from "@/types/audit-log";

function getDelay(): number {
  return useSettingsStore.getState().settings.mockDelayMs;
}

async function delay<T>(data: T): Promise<T> {
  const ms = getDelay();
  if (ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
  return data;
}

function getTasks(): AutomationTask[] {
  const { addedTasks, overrides } = useTaskStore.getState();
  return mergeTasks(
    tasksData as AutomationTask[],
    addedTasks,
    overrides
  );
}

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function getPortals(): SRMPortal[] {
  return srmPortalsData as unknown as SRMPortal[];
}

function findPortalById(portalId: string): SRMPortal | undefined {
  return getPortals().find((p) => p.id === portalId);
}

function findPortalByTask(task: AutomationTask): SRMPortal | undefined {
  if (task.portalId) {
    return findPortalById(task.portalId);
  }
  return getPortals().find((p) => p.name === task.srmPortalName);
}

function appendAuditLog(entry: Omit<AuditLog, "id">) {
  (auditLogsData as AuditLog[]).unshift({
    id: `audit_${Date.now()}`,
    ...entry,
  });
}

export const mockApi = {
  getDashboard: async (): Promise<DashboardData> =>
    delay(dashboardData as DashboardData),

  getTasks: async (): Promise<AutomationTask[]> => delay(getTasks()),

  getTaskById: async (id: string): Promise<AutomationTask | undefined> => {
    const tasks = getTasks();
    return delay(tasks.find((t) => t.id === id));
  },

  createTask: async (
    task: Omit<AutomationTask, "id" | "createdAt" | "updatedAt">
  ): Promise<AutomationTask> => {
    const now = new Date().toISOString().replace("T", " ").slice(0, 19);
    const newTask: AutomationTask = {
      ...task,
      id: `task_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    useTaskStore.getState().addTask(newTask);
    return delay(newTask);
  },

  updateTaskStatus: async (
    id: string,
    status: AutomationTaskStatus
  ): Promise<AutomationTask | undefined> => {
    useTaskStore.getState().updateTaskStatus(id, status);
    const task = getTasks().find((t) => t.id === id);
    return delay(task);
  },

  updateTask: async (
    id: string,
    patch: Partial<AutomationTask>
  ): Promise<AutomationTask | undefined> => {
    useTaskStore.getState().updateTask(id, patch);
    const task = getTasks().find((t) => t.id === id);
    return delay(task);
  },

  getWorkflowTemplates: async (): Promise<WorkflowTemplate[]> =>
    delay(workflowTemplatesData as WorkflowTemplate[]),

  getWorkflowById: async (id: string): Promise<WorkflowTemplate | undefined> =>
    delay(
      (workflowTemplatesData as WorkflowTemplate[]).find((w) => w.id === id)
    ),

  getRuns: async (): Promise<TaskRun[]> =>
    delay(taskRunsData as TaskRun[]),

  getRunById: async (id: string): Promise<TaskRun | undefined> =>
    delay((taskRunsData as TaskRun[]).find((r) => r.id === id)),

  getRunsByTaskId: async (taskId: string): Promise<TaskRun[]> =>
    delay((taskRunsData as TaskRun[]).filter((r) => r.taskId === taskId)),

  getArtifacts: async (): Promise<Artifact[]> =>
    delay(artifactsData as Artifact[]),

  getArtifactsByTaskId: async (taskId: string): Promise<Artifact[]> =>
    delay((artifactsData as Artifact[]).filter((a) => a.taskId === taskId)),

  getArtifactsByRunId: async (runId: string): Promise<Artifact[]> =>
    delay((artifactsData as Artifact[]).filter((a) => a.runId === runId)),

  getWorkers: async (): Promise<Worker[]> =>
    delay(workersData as Worker[]),

  getSrmPortals: async (): Promise<SRMPortal[]> =>
    delay(srmPortalsData as unknown as SRMPortal[]),

  getSrmPortalById: async (id: string): Promise<SRMPortal | undefined> =>
    delay((srmPortalsData as unknown as SRMPortal[]).find((p) => p.id === id)),

  getRpaComponents: async (): Promise<RpaComponent[]> =>
    delay(rpaComponentsData as RpaComponent[]),

  getAuditLogs: async (taskId?: string): Promise<AuditLog[]> => {
    const logs = auditLogsData as AuditLog[];
    return delay(taskId ? logs.filter((l) => l.taskId === taskId) : logs);
  },

  getSettings: async (): Promise<AppSettings> =>
    delay(useSettingsStore.getState().settings),

  updateSettings: async (patch: Partial<AppSettings>): Promise<AppSettings> => {
    useSettingsStore.getState().updateSettings(patch);
    return delay(useSettingsStore.getState().settings);
  },

  search: async (query: string) => {
    const q = query.toLowerCase();
    const tasks = getTasks().filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q)
    );
    const workflows = (workflowTemplatesData as WorkflowTemplate[]).filter(
      (w) => w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q)
    );
    const portals = getPortals().filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q)
    );
    const runs = (taskRunsData as TaskRun[]).filter(
      (r) =>
        r.taskTitle.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    );
    return delay({ tasks, workflows, portals, runs });
  },

  getHumanActions: async (): Promise<HumanAction[]> =>
    delay(getHumanActionsFromStore()),

  getHumanAction: async (taskId: string): Promise<HumanAction | undefined> =>
    delay(getHumanActionByTaskId(taskId)),

  getHumanActionById: async (id: string): Promise<HumanAction | undefined> =>
    delay(getHumanActionById(id)),

  markHumanOpened: async (input: {
    taskId: string;
    humanActionId: string;
    openedBy?: string;
    clientTabId?: string;
  }): Promise<{ taskId: string; status: AutomationTaskStatus }> => {
    const task = getTasks().find((t) => t.id === input.taskId);
    if (!task) throw new Error("任务不存在");
    if (task.status !== "WAITING_HUMAN" && task.status !== "HUMAN_OPERATING") {
      throw new Error("任务状态不支持打开人工处理");
    }

    const action = getHumanActionById(input.humanActionId);
    if (!action) throw new Error("未找到人工动作");

    const openedAt = now();
    useHumanActionStore.getState().updateHumanAction(input.humanActionId, {
      status: "OPENED",
      openedAt,
    });
    useTaskStore.getState().updateTaskStatus(input.taskId, "HUMAN_OPERATING");

    appendAuditLog({
      taskId: input.taskId,
      action: "human_action.opened",
      operator: input.openedBy ?? "当前用户",
      detail: `打开人工处理页面，Tab: ${input.clientTabId ?? "-"}`,
      createdAt: openedAt,
    });

    return delay({ taskId: input.taskId, status: "HUMAN_OPERATING" });
  },

  confirmHumanAction: async (input: {
    taskId: string;
    humanActionId: string;
    confirmedBy?: string;
    note?: string;
  }): Promise<{
    taskId: string;
    status: AutomationTaskStatus;
    confirmedAt: string;
  }> => {
    const task = getTasks().find((t) => t.id === input.taskId);
    if (!task) throw new Error("任务不存在");
    if (task.status !== "WAITING_HUMAN" && task.status !== "HUMAN_OPERATING") {
      throw new Error("任务状态不支持确认完成");
    }

    const confirmedAt = now();
    useTaskStore.getState().updateTask(input.taskId, {
      status: "SUCCESS_MANUAL",
      progress: 100,
      currentStep: "人工确认完成",
    });
    useHumanActionStore.getState().updateHumanAction(input.humanActionId, {
      status: "CONFIRMED",
      confirmedAt,
      confirmedBy: input.confirmedBy ?? "当前用户",
      note: input.note,
    });

    appendAuditLog({
      taskId: input.taskId,
      action: "task.human_confirm",
      operator: input.confirmedBy ?? "当前用户",
      detail: input.note ? `人工确认完成: ${input.note}` : "人工确认完成",
      createdAt: confirmedAt,
    });

    return delay({
      taskId: input.taskId,
      status: "SUCCESS_MANUAL",
      confirmedAt,
    });
  },
};
