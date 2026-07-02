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
  allocateCdpPort,
  createSessionId,
  getBrowserSessionsFromStore,
  getHumanCheckpointsFromStore,
  mergeCheckpoints,
  mergeSessions,
  useBrowserStore,
} from "@/stores/browser-store";
import type { AutomationTask, AutomationTaskStatus } from "@/types/automation-task";
import type { WorkflowTemplate } from "@/types/workflow";
import type { TaskRun } from "@/types/task-run";
import type { SRMPortal } from "@/types/srm-portal";
import type { Artifact } from "@/types/artifact";
import type { Worker } from "@/types/worker";
import type { DashboardData } from "@/types/dashboard";
import type { AppSettings } from "@/types/settings";
import type { RpaComponent } from "@/types/rpa-component";
import type { AuditLog } from "@/types/audit-log";
import type {
  BrowserConfig,
  BrowserSession,
  DetectedBrowser,
  HumanCheckpoint,
} from "@/types/browser";

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
  return getPortals().find((p) => p.name === task.srmPortalName);
}

function getActiveSessionForPortal(portalId: string): BrowserSession | undefined {
  return getBrowserSessionsFromStore().find(
    (s) => s.portalId === portalId && (s.status === "OPENED" || s.status === "ATTACHED")
  );
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

  getBrowserConfig: async (): Promise<BrowserConfig> =>
    delay(useBrowserStore.getState().config),

  updateBrowserConfig: async (patch: Partial<BrowserConfig>): Promise<BrowserConfig> => {
    useBrowserStore.getState().updateConfig(patch);
    return delay(useBrowserStore.getState().config);
  },

  detectBrowsers: async (): Promise<{ items: DetectedBrowser[] }> =>
    delay({
      items: [
        {
          browserType: "chrome",
          name: "Google Chrome",
          executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          available: true,
          version: "unknown",
        },
        {
          browserType: "edge",
          name: "Microsoft Edge",
          executablePath: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
          available: true,
          version: "unknown",
        },
      ],
    }),

  getBrowserSessions: async (): Promise<BrowserSession[]> =>
    delay(getBrowserSessionsFromStore()),

  getBrowserSessionById: async (sessionId: string): Promise<BrowserSession | undefined> =>
    delay(getBrowserSessionsFromStore().find((s) => s.id === sessionId)),

  getSessionsByPortalId: async (portalId: string): Promise<BrowserSession[]> =>
    delay(getBrowserSessionsFromStore().filter((s) => s.portalId === portalId)),

  openPortalMock: async (input: {
    portalId: string;
    targetUrl?: string;
    source?: string;
  }): Promise<BrowserSession> => {
    const portal = findPortalById(input.portalId);
    if (!portal) throw new Error("门户不存在");
    if (portal.status === "disabled") throw new Error("门户已禁用");

    const existing = getActiveSessionForPortal(input.portalId);
    if (existing) {
      useBrowserStore.getState().updateSession(existing.id, { lastActiveAt: now() });
      return delay(getBrowserSessionsFromStore().find((s) => s.id === existing.id)!);
    }

    const cdpPort = allocateCdpPort();
    const session: BrowserSession = {
      id: createSessionId(),
      portalId: portal.id,
      portalName: portal.name,
      customerName: portal.customerName,
      profileId: portal.profileId,
      profilePath: portal.profilePath,
      browserType: portal.browserType,
      launchMode: "manual_open",
      pid: Math.floor(28000 + Math.random() * 1000),
      cdpPort,
      cdpEndpoint: `http://127.0.0.1:${cdpPort}`,
      targetUrl: input.targetUrl ?? portal.quickOpenUrl ?? portal.url,
      status: "OPENED",
      startedAt: now(),
      lastActiveAt: now(),
    };

    useBrowserStore.getState().addSession(session);
    appendAuditLog({
      taskId: "",
      action: "browser.open_portal",
      operator: "当前用户",
      detail: `快速打开 SRM: ${portal.name}`,
      createdAt: now(),
    });

    return delay(session);
  },

  openHumanTaskMock: async (input: { taskId: string }): Promise<{
    session: BrowserSession;
    taskStatus: AutomationTaskStatus;
    checkpoint: HumanCheckpoint;
  }> => {
    const task = getTasks().find((t) => t.id === input.taskId);
    if (!task) throw new Error("任务不存在");
    if (task.status !== "WAITING_HUMAN" && task.status !== "HUMAN_OPERATING") {
      throw new Error("任务状态不支持快速打开");
    }

    const checkpoint = getHumanCheckpointsFromStore().find((c) => c.taskId === input.taskId);
    if (!checkpoint) throw new Error("未找到人工检查点");

    const portal = findPortalById(checkpoint.portalId) ?? findPortalByTask(task);
    if (!portal) throw new Error("未找到关联 SRM 门户");

    let session = getActiveSessionForPortal(portal.id);
    if (!session) {
      const cdpPort = allocateCdpPort();
      session = {
        id: createSessionId(),
        portalId: portal.id,
        portalName: portal.name,
        customerName: portal.customerName,
        taskId: task.id,
        profileId: portal.profileId,
        profilePath: portal.profilePath,
        browserType: portal.browserType,
        launchMode: "manual_open",
        pid: Math.floor(28000 + Math.random() * 1000),
        cdpPort,
        cdpEndpoint: `http://127.0.0.1:${cdpPort}`,
        targetUrl: checkpoint.targetUrl,
        status: "OPENED",
        startedAt: now(),
        lastActiveAt: now(),
      };
      useBrowserStore.getState().addSession(session);
    } else {
      useBrowserStore.getState().updateSession(session.id, {
        taskId: task.id,
        targetUrl: checkpoint.targetUrl,
        lastActiveAt: now(),
      });
      session = getBrowserSessionsFromStore().find((s) => s.id === session!.id)!;
    }

    useBrowserStore.getState().updateCheckpoint(checkpoint.id, {
      status: "OPENED",
      openedSessionId: session.id,
      openedAt: now(),
    });
    useTaskStore.getState().updateTaskStatus(input.taskId, "HUMAN_OPERATING");

    appendAuditLog({
      taskId: input.taskId,
      action: "browser.open_human_task",
      operator: "当前用户",
      detail: `快速打开待人工任务: ${task.title}`,
      createdAt: now(),
    });

    return delay({
      session,
      taskStatus: "HUMAN_OPERATING",
      checkpoint: mergeCheckpoints(
        useBrowserStore.getState().checkpoints,
        useBrowserStore.getState().checkpointOverrides
      ).find((c) => c.id === checkpoint.id)!,
    });
  },

  closeSessionMock: async (sessionId: string): Promise<void> => {
    useBrowserStore.getState().closeSession(sessionId);
    appendAuditLog({
      taskId: "",
      action: "browser.close_session",
      operator: "当前用户",
      detail: `关闭浏览器会话: ${sessionId}`,
      createdAt: now(),
    });
    return delay(undefined);
  },

  resetPortalProfileMock: async (portalId: string): Promise<void> => {
    useBrowserStore.getState().resetPortalProfile(portalId);
    appendAuditLog({
      taskId: "",
      action: "browser.reset_profile",
      operator: "当前用户",
      detail: `重置 Profile: ${portalId}`,
      createdAt: now(),
    });
    return delay(undefined);
  },

  getHumanCheckpoints: async (): Promise<HumanCheckpoint[]> =>
    delay(getHumanCheckpointsFromStore()),

  getHumanCheckpointByTaskId: async (taskId: string): Promise<HumanCheckpoint | undefined> =>
    delay(getHumanCheckpointsFromStore().find((c) => c.taskId === taskId)),

  confirmHumanTaskMock: async (input: {
    taskId: string;
    checkpointId: string;
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
    useBrowserStore.getState().updateCheckpoint(input.checkpointId, {
      status: "CONFIRMED",
      confirmedAt,
      confirmedBy: "当前用户",
      note: input.note,
    });

    appendAuditLog({
      taskId: input.taskId,
      action: "task.human_confirm",
      operator: "当前用户",
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
