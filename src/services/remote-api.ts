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
import type { PortalAccount, CreatePortalAccountInput, UpdatePortalAccountInput } from "@/types/portal-account";
import {
  createPortalAccount as remoteCreatePortalAccount,
  deletePortalAccount as remoteDeletePortalAccount,
  getPortalAccount as remoteGetPortalAccount,
  listPortalAccounts as remoteListPortalAccounts,
  testOpenPortalAccount as remoteTestOpenPortalAccount,
  updatePortalAccount as remoteUpdatePortalAccount,
} from "./autotask-api/portal-accounts";
import type { TaskRun } from "@/types/task-run";
import type { Worker } from "@/types/worker";
import type { WorkflowTemplate } from "@/types/workflow";
import { mapItemResponse, mapListResponse } from "./dto-mappers";

type RemoteDashboardSummary = {
  todayTotal?: number;
  ready?: number;
  pending?: number;
  running?: number;
  waitingHuman?: number;
  failed?: number;
  success?: number;
  completedToday?: number;
  successRate?: number;
  onlineWorkers?: number;
  stats?: DashboardData["stats"];
  taskTypeDistribution?: DashboardData["taskTypeDistribution"];
};

function mapDashboardSummary(data: unknown): DashboardData {
  const summary = mapItemResponse<RemoteDashboardSummary>(data);

  if (summary.stats) {
    return {
      stats: {
        pending: summary.stats.pending ?? 0,
        running: summary.stats.running ?? 0,
        waitingHuman: summary.stats.waitingHuman ?? 0,
        failed: summary.stats.failed ?? 0,
        completedToday: summary.stats.completedToday ?? 0,
        successRate: summary.stats.successRate ?? 0,
      },
      taskTypeDistribution: summary.taskTypeDistribution ?? [],
    };
  }

  return {
    stats: {
      pending: summary.pending ?? summary.ready ?? 0,
      running: summary.running ?? 0,
      waitingHuman: summary.waitingHuman ?? 0,
      failed: summary.failed ?? 0,
      completedToday: summary.completedToday ?? summary.success ?? 0,
      successRate: summary.successRate ?? 0,
    },
    taskTypeDistribution: summary.taskTypeDistribution ?? [],
  };
}

export const remoteApi = {
  getDashboard: async (): Promise<DashboardData> => {
    const data = await requestAutotaskApi<unknown>({
      method: "GET",
      path: "/dashboard/summary",
    });
    return mapDashboardSummary(data);
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

  getSrmPortals: async (): Promise<PortalAccount[]> => remoteListPortalAccounts(),

  getSrmPortalById: async (id: string): Promise<PortalAccount | undefined> =>
    remoteGetPortalAccount(id),

  createPortalAccount: async (
    input: CreatePortalAccountInput
  ): Promise<PortalAccount> => remoteCreatePortalAccount(input),

  updatePortalAccount: async (
    id: string,
    patch: UpdatePortalAccountInput
  ): Promise<PortalAccount> => remoteUpdatePortalAccount(id, patch),

  deletePortalAccount: async (id: string): Promise<void> =>
    remoteDeletePortalAccount(id),

  testOpenPortalAccount: async (id: string): Promise<PortalAccount | void> =>
    remoteTestOpenPortalAccount(id),

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
          p.portalName.toLowerCase().includes(q) ||
          p.erpEntityName.toLowerCase().includes(q)
      ),
      runs: runs.filter(
        (r) =>
          r.taskTitle.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      ),
    };
  },
};
