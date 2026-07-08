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
import { getApiMode } from "./endpoint-config";
import { mockApi } from "./mock-api";
import { remoteApi } from "./remote-api";

function pickApi() {
  return getApiMode() === "remote" ? remoteApi : mockApi;
}

export const autotaskApi = {
  dashboard: {
    getSummary: (): Promise<DashboardData> => pickApi().getDashboard(),
  },

  tasks: {
    list: (): Promise<AutomationTask[]> => pickApi().getTasks(),
    get: (id: string): Promise<AutomationTask | undefined> =>
      pickApi().getTaskById(id),
    create: (
      task: Omit<AutomationTask, "id" | "createdAt" | "updatedAt">
    ): Promise<AutomationTask> => pickApi().createTask(task),
    update: (
      id: string,
      patch: Partial<AutomationTask>
    ): Promise<AutomationTask | undefined> => pickApi().updateTask(id, patch),
    start: async (id: string): Promise<AutomationTask> => {
      const api = pickApi();
      if ("startTask" in api && typeof api.startTask === "function") {
        return api.startTask(id);
      }
      const result = await api.updateTaskStatus(id, "QUEUED");
      if (!result) {
        throw new Error("任务不存在");
      }
      return result;
    },
    cancel: async (id: string): Promise<AutomationTask> => {
      const api = pickApi();
      if ("cancelTask" in api && typeof api.cancelTask === "function") {
        return api.cancelTask(id);
      }
      const result = await api.updateTaskStatus(id, "CANCELLED");
      if (!result) {
        throw new Error("任务不存在");
      }
      return result;
    },
    retry: async (id: string): Promise<AutomationTask> => {
      const api = pickApi();
      if ("retryTask" in api && typeof api.retryTask === "function") {
        return api.retryTask(id);
      }
      const result = await api.updateTaskStatus(id, "QUEUED");
      if (!result) {
        throw new Error("任务不存在");
      }
      return result;
    },
    updateStatus: (
      id: string,
      status: AutomationTaskStatus
    ): Promise<AutomationTask | undefined> =>
      pickApi().updateTaskStatus(id, status),
    getHumanAction: (taskId: string): Promise<HumanAction | undefined> =>
      pickApi().getHumanAction(taskId),
    markHumanOpened: (input: {
      taskId: string;
      humanActionId: string;
      openedBy?: string;
      clientTabId?: string;
    }) => pickApi().markHumanOpened(input),
    confirmHumanAction: (input: {
      taskId: string;
      humanActionId: string;
      confirmedBy?: string;
      note?: string;
    }) => pickApi().confirmHumanAction(input),
  },

  portalAccounts: {
    list: (): Promise<SRMPortal[]> => pickApi().getSrmPortals(),
    get: (id: string): Promise<SRMPortal | undefined> =>
      pickApi().getSrmPortalById(id),
  },

  workflowTemplates: {
    list: (): Promise<WorkflowTemplate[]> => pickApi().getWorkflowTemplates(),
    get: (id: string): Promise<WorkflowTemplate | undefined> =>
      pickApi().getWorkflowById(id),
  },

  runs: {
    list: (): Promise<TaskRun[]> => pickApi().getRuns(),
    get: (id: string): Promise<TaskRun | undefined> => pickApi().getRunById(id),
    listByTask: (taskId: string): Promise<TaskRun[]> =>
      pickApi().getRunsByTaskId(taskId),
    listEvents: (runId: string): Promise<TaskRun | undefined> => {
      const api = pickApi();
      if ("getRunEvents" in api && typeof api.getRunEvents === "function") {
        return api.getRunEvents(runId);
      }
      return api.getRunById(runId);
    },
  },

  artifacts: {
    list: (): Promise<Artifact[]> => pickApi().getArtifacts(),
    listByTask: (taskId: string): Promise<Artifact[]> =>
      pickApi().getArtifactsByTaskId(taskId),
    listByRun: (runId: string): Promise<Artifact[]> =>
      pickApi().getArtifactsByRunId(runId),
    getDownloadUrl: async (id: string): Promise<string> => {
      const api = pickApi();
      if (
        "getArtifactDownloadUrl" in api &&
        typeof api.getArtifactDownloadUrl === "function"
      ) {
        return api.getArtifactDownloadUrl(id);
      }
      const artifact = (await pickApi().getArtifacts()).find(
        (a) => a.id === id
      );
      return artifact?.filePath ?? "";
    },
  },

  workers: {
    list: (): Promise<Worker[]> => pickApi().getWorkers(),
  },

  settings: {
    get: (): Promise<AppSettings> => pickApi().getSettings(),
    update: (patch: Partial<AppSettings>): Promise<AppSettings> =>
      pickApi().updateSettings(patch),
  },

  rpaComponents: {
    list: (): Promise<RpaComponent[]> => pickApi().getRpaComponents(),
  },

  auditLogs: {
    list: (taskId?: string): Promise<AuditLog[]> =>
      pickApi().getAuditLogs(taskId),
  },

  search: (query: string) => pickApi().search(query),
};
