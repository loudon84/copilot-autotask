import { requestAutotaskApi } from "@/actions/autotask-api";
import type { Artifact } from "@/types/artifact";
import type { AuditLog } from "@/types/audit-log";
import type {
  AutomationTask,
  AutomationTaskStatus,
} from "@/types/automation-task";
import type { DashboardData } from "@/types/dashboard";
import type { HumanAction } from "@/types/human-action";
import type { RpaComponent } from "@/types/rpa-component";
import type { AppSettings } from "@/types/settings";
import type { SRMPortal } from "@/types/srm-portal";
import type { TaskRun } from "@/types/task-run";
import type { Worker } from "@/types/worker";
import type { WorkflowTemplate } from "@/types/workflow";
import { mapItemResponse, mapListResponse } from "./dto-mappers";

export const remoteApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/dashboard/summary",
    });
    return mapItemResponse<DashboardData>(data);
  },

  getTasks: async (): Promise<AutomationTask[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/tasks",
    });
    return mapListResponse<AutomationTask>(data);
  },

  getTaskById: async (id: string): Promise<AutomationTask | undefined> => {
    try {
      const data = await requestAutotaskApi<unknown>({
        method: "GET",
        path: `/tasks/${id}`,
      });
      return mapItemResponse<AutomationTask>(data);
    } catch {
      return;
    }
  },

  createTask: async (
    task: Omit<AutomationTask, "id" | "createdAt" | "updatedAt">
  ): Promise<AutomationTask> => {
    const data = await requestAutotaskApi<unknown>({
      method: "POST",
      path: "/tasks",
      body: task,
    });
    return mapItemResponse<AutomationTask>(data);
  },

  updateTask: async (
    id: string,
    patch: Partial<AutomationTask>
  ): Promise<AutomationTask | undefined> => {
    const data = await requestAutotaskApi<unknown>({
      method: "PATCH",
      path: `/tasks/${id}`,
      body: patch,
    });
    return mapItemResponse<AutomationTask>(data);
  },

  startTask: async (id: string): Promise<AutomationTask> => {
    const data = await requestAutotaskApi<unknown>({
      method: "POST",
      path: `/tasks/${id}/start`,
    });
    return mapItemResponse<AutomationTask>(data);
  },

  cancelTask: async (id: string): Promise<AutomationTask> => {
    const data = await requestAutotaskApi<unknown>({
      method: "POST",
      path: `/tasks/${id}/cancel`,
    });
    return mapItemResponse<AutomationTask>(data);
  },

  retryTask: async (id: string): Promise<AutomationTask> => {
    const data = await requestAutotaskApi<unknown>({
      method: "POST",
      path: `/tasks/${id}/retry`,
    });
    return mapItemResponse<AutomationTask>(data);
  },

  updateTaskStatus: async (
    id: string,
    status: AutomationTaskStatus
  ): Promise<AutomationTask | undefined> =>
    remoteApi.updateTask(id, { status }),

  getWorkflowTemplates: async (): Promise<WorkflowTemplate[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/workflow-templates",
    });
    return mapListResponse<WorkflowTemplate>(data);
  },

  getWorkflowById: async (
    id: string
  ): Promise<WorkflowTemplate | undefined> => {
    try {
      const data = await requestAutotaskApi<unknown>({
        method: "GET",
        path: `/workflow-templates/${id}`,
      });
      return mapItemResponse<WorkflowTemplate>(data);
    } catch {
      return;
    }
  },

  getRuns: async (): Promise<TaskRun[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/runs",
    });
    return mapListResponse<TaskRun>(data);
  },

  getRunById: async (id: string): Promise<TaskRun | undefined> => {
    try {
      const data = await requestAutotaskApi<unknown>({
        method: "GET",
        path: `/runs/${id}`,
      });
      return mapItemResponse<TaskRun>(data);
    } catch {
      return;
    }
  },

  getRunsByTaskId: async (taskId: string): Promise<TaskRun[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/runs",
      query: { task_id: taskId },
    });
    return mapListResponse<TaskRun>(data);
  },

  getRunEvents: async (runId: string): Promise<TaskRun | undefined> =>
    remoteApi.getRunById(runId),

  getArtifacts: async (): Promise<Artifact[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/artifacts",
    });
    return mapListResponse<Artifact>(data);
  },

  getArtifactsByTaskId: async (taskId: string): Promise<Artifact[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/artifacts",
      query: { task_id: taskId },
    });
    return mapListResponse<Artifact>(data);
  },

  getArtifactsByRunId: async (runId: string): Promise<Artifact[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/artifacts",
      query: { run_id: runId },
    });
    return mapListResponse<Artifact>(data);
  },

  getArtifactDownloadUrl: async (id: string): Promise<string> => {
    const data = await requestAutotaskApi<{
      url?: string;
      download_url?: string;
    }>({
      method: "GET",
      path: `/artifacts/${id}/download-url`,
    });
    return data.url ?? data.download_url ?? "";
  },

  getWorkers: async (): Promise<Worker[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/rpa-workers",
    });
    return mapListResponse<Worker>(data);
  },

  getSrmPortals: async (): Promise<SRMPortal[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/portal-accounts",
    });
    return mapListResponse<SRMPortal>(data);
  },

  getSrmPortalById: async (id: string): Promise<SRMPortal | undefined> => {
    try {
      const data = await requestAutotaskApi<unknown>({
        method: "GET",
        path: `/portal-accounts/${id}`,
      });
      return mapItemResponse<SRMPortal>(data);
    } catch {
      return;
    }
  },

  getRpaComponents: async (): Promise<RpaComponent[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/rpa-components",
    });
    return mapListResponse<RpaComponent>(data);
  },

  getAuditLogs: async (taskId?: string): Promise<AuditLog[]> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/audit-logs",
      query: taskId ? { task_id: taskId } : undefined,
    });
    return mapListResponse<AuditLog>(data);
  },

  getSettings: async (): Promise<AppSettings> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/settings",
    });
    return mapItemResponse<AppSettings>(data);
  },

  updateSettings: async (patch: Partial<AppSettings>): Promise<AppSettings> => {
    const data = await requestAutotaskApi<unknown>({
      method: "PATCH",
      path: "/settings",
      body: patch,
    });
    return mapItemResponse<AppSettings>(data);
  },

  getHumanAction: async (taskId: string): Promise<HumanAction | undefined> => {
    try {
      const data = await requestAutotaskApi<unknown>({
        method: "GET",
        path: `/tasks/${taskId}/human-action`,
      });
      return mapItemResponse<HumanAction>(data);
    } catch {
      return;
    }
  },

  markHumanOpened: async (input: {
    taskId: string;
    humanActionId: string;
    openedBy?: string;
    clientTabId?: string;
  }): Promise<{ taskId: string; status: AutomationTaskStatus }> => {
    const data = await requestAutotaskApi<unknown>({
      method: "POST",
      path: `/tasks/${input.taskId}/human-opened`,
      body: input,
    });
    return mapItemResponse<{ taskId: string; status: AutomationTaskStatus }>(
      data
    );
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
    const data = await requestAutotaskApi<unknown>({
      method: "POST",
      path: `/tasks/${input.taskId}/confirm-human`,
      body: input,
    });
    return mapItemResponse<{
      taskId: string;
      status: AutomationTaskStatus;
      confirmedAt: string;
    }>(data);
  },

  search: async (query: string) => {
    const [tasks, workflows, portals, runs] = await Promise.all([
      remoteApi.getTasks(),
      remoteApi.getWorkflowTemplates(),
      remoteApi.getSrmPortals(),
      remoteApi.getRuns(),
    ]);
    const q = query.toLowerCase();
    return {
      tasks: tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.customerName.toLowerCase().includes(q)
      ),
      workflows: workflows.filter(
        (w) =>
          w.name.toLowerCase().includes(q) || w.code.toLowerCase().includes(q)
      ),
      portals: portals.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q)
      ),
      runs: runs.filter(
        (r) =>
          r.taskTitle.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      ),
    };
  },
};
