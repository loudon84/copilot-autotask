import { existsSync } from "node:fs";
import { rm, mkdir } from "node:fs/promises";
import { spawn, type ChildProcess } from "node:child_process";
import { platform } from "node:os";
import { os } from "@orpc/server";
import { shell } from "electron";
import {
  openHumanTaskInputSchema,
  openPortalInputSchema,
  openProfileFolderInputSchema,
  resetPortalProfileInputSchema,
  sessionIdInputSchema,
} from "./schemas";

export interface MainBrowserSession {
  id: string;
  portalId: string;
  taskId?: string;
  profilePath: string;
  targetUrl: string;
  browserType: "chrome" | "edge" | "chromium";
  pid?: number;
  cdpPort: number;
  cdpEndpoint: string;
  status: "STARTING" | "OPENED" | "CLOSED" | "ERROR";
  startedAt: string;
  process?: ChildProcess;
}

const sessions = new Map<string, MainBrowserSession>();
let sessionCounter = 0;

const CHROME_PATHS_WIN = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
];

const EDGE_PATHS_WIN = [
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const CHROME_PATHS_MAC = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const EDGE_PATHS_MAC = [
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
];

const CHROME_PATHS_LINUX = [
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const EDGE_PATHS_LINUX = ["/usr/bin/microsoft-edge"];

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function findExecutable(paths: string[]): string | undefined {
  return paths.find((p) => existsSync(p));
}

function getDefaultPaths(browserType: "chrome" | "edge" | "chromium"): string[] {
  const osPlatform = platform();
  if (osPlatform === "win32") {
    if (browserType === "edge") return EDGE_PATHS_WIN;
    return CHROME_PATHS_WIN;
  }
  if (osPlatform === "darwin") {
    if (browserType === "edge") return EDGE_PATHS_MAC;
    return CHROME_PATHS_MAC;
  }
  if (browserType === "edge") return EDGE_PATHS_LINUX;
  return CHROME_PATHS_LINUX;
}

function resolveExecutable(
  browserType: "chrome" | "edge" | "chromium",
  executablePath?: string
): string {
  if (executablePath && existsSync(executablePath)) return executablePath;
  const found = findExecutable(getDefaultPaths(browserType));
  if (!found) throw new Error(`未找到 ${browserType} 可执行文件`);
  return found;
}

function allocatePort(): number {
  return Math.floor(45000 + Math.random() * 10000);
}

function createSessionId(): string {
  sessionCounter += 1;
  return `browser_sess_${Date.now()}_${sessionCounter}`;
}

function toPublicSession(session: MainBrowserSession) {
  return {
    id: session.id,
    portalId: session.portalId,
    taskId: session.taskId,
    profilePath: session.profilePath,
    targetUrl: session.targetUrl,
    browserType: session.browserType,
    pid: session.pid,
    cdpPort: session.cdpPort,
    cdpEndpoint: session.cdpEndpoint,
    status: session.status,
    startedAt: session.startedAt,
  };
}

async function launchBrowser(input: {
  portalId: string;
  taskId?: string;
  profilePath: string;
  targetUrl: string;
  browserType: "chrome" | "edge" | "chromium";
  executablePath?: string;
}): Promise<MainBrowserSession> {
  const executable = resolveExecutable(input.browserType, input.executablePath);
  await mkdir(input.profilePath, { recursive: true });

  const cdpPort = allocatePort();
  const sessionId = createSessionId();

  const session: MainBrowserSession = {
    id: sessionId,
    portalId: input.portalId,
    taskId: input.taskId,
    profilePath: input.profilePath,
    targetUrl: input.targetUrl,
    browserType: input.browserType,
    cdpPort,
    cdpEndpoint: `http://127.0.0.1:${cdpPort}`,
    status: "STARTING",
    startedAt: now(),
  };

  const args = [
    `--user-data-dir=${input.profilePath}`,
    "--remote-debugging-address=127.0.0.1",
    `--remote-debugging-port=${cdpPort}`,
    "--no-first-run",
    "--new-window",
    input.targetUrl,
  ];

  const child = spawn(executable, args, {
    detached: false,
    stdio: "ignore",
  });

  session.process = child;
  session.pid = child.pid;
  session.status = "OPENED";
  sessions.set(sessionId, session);

  child.on("exit", () => {
    const existing = sessions.get(sessionId);
    if (existing) {
      existing.status = "CLOSED";
      existing.process = undefined;
    }
  });

  child.on("error", () => {
    const existing = sessions.get(sessionId);
    if (existing) {
      existing.status = "ERROR";
    }
  });

  return session;
}

export const detectBrowsers = os.handler(() => {
  const items = [
    {
      browserType: "chrome" as const,
      name: "Google Chrome",
      executablePath: findExecutable(getDefaultPaths("chrome")) ?? "",
      available: !!findExecutable(getDefaultPaths("chrome")),
      version: "unknown",
    },
    {
      browserType: "edge" as const,
      name: "Microsoft Edge",
      executablePath: findExecutable(getDefaultPaths("edge")) ?? "",
      available: !!findExecutable(getDefaultPaths("edge")),
      version: "unknown",
    },
  ];
  return { items };
});

export const listSessions = os.handler(() =>
  Array.from(sessions.values()).map(toPublicSession)
);

export const openPortal = os
  .input(openPortalInputSchema)
  .handler(async ({ input }) => {
    const existing = Array.from(sessions.values()).find(
      (s) => s.portalId === input.portalId && s.status === "OPENED"
    );
    if (existing) return toPublicSession(existing);

    const session = await launchBrowser({
      portalId: input.portalId,
      profilePath: input.profilePath,
      targetUrl: input.targetUrl,
      browserType: input.browserType,
      executablePath: input.executablePath,
    });
    return toPublicSession(session);
  });

export const openHumanTask = os
  .input(openHumanTaskInputSchema)
  .handler(async ({ input }) => {
    const session = await launchBrowser({
      portalId: `task_${input.taskId}`,
      taskId: input.taskId,
      profilePath: input.profilePath,
      targetUrl: input.targetUrl,
      browserType: input.browserType,
      executablePath: input.executablePath,
    });
    return toPublicSession(session);
  });

export const closeSession = os
  .input(sessionIdInputSchema)
  .handler(async ({ input }) => {
    const session = sessions.get(input.sessionId);
    if (!session) throw new Error("会话不存在");

    if (session.process && !session.process.killed) {
      session.process.kill();
    }
    session.status = "CLOSED";
    return { success: true };
  });

export const openProfileFolder = os
  .input(openProfileFolderInputSchema)
  .handler(async ({ input }) => {
    await mkdir(input.profilePath, { recursive: true });
    const result = await shell.openPath(input.profilePath);
    if (result) throw new Error(result);
    return { success: true };
  });

export const resetPortalProfile = os
  .input(resetPortalProfileInputSchema)
  .handler(async ({ input }) => {
    for (const session of sessions.values()) {
      if (session.profilePath === input.profilePath && session.status === "OPENED") {
        if (session.process && !session.process.killed) {
          session.process.kill();
        }
        session.status = "CLOSED";
      }
    }
    if (existsSync(input.profilePath)) {
      await rm(input.profilePath, { recursive: true, force: true });
    }
    return { success: true };
  });
