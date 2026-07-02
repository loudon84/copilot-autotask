import { ipc } from "@/ipc/manager";
import type { BrowserType } from "@/types/browser";

export function detectBrowsers() {
  return ipc.client.browser.detectBrowsers();
}

export function listBrowserSessions() {
  return ipc.client.browser.listSessions();
}

export function openPortal(input: {
  portalId: string;
  profilePath: string;
  targetUrl: string;
  browserType?: BrowserType;
  executablePath?: string;
}) {
  return ipc.client.browser.openPortal({
    portalId: input.portalId,
    profilePath: input.profilePath,
    targetUrl: input.targetUrl,
    browserType: input.browserType ?? "chrome",
    executablePath: input.executablePath,
  });
}

export function openHumanTask(input: {
  taskId: string;
  profilePath: string;
  targetUrl: string;
  browserType?: BrowserType;
  executablePath?: string;
}) {
  return ipc.client.browser.openHumanTask({
    taskId: input.taskId,
    profilePath: input.profilePath,
    targetUrl: input.targetUrl,
    browserType: input.browserType ?? "chrome",
    executablePath: input.executablePath,
  });
}

export function closeBrowserSession(sessionId: string) {
  return ipc.client.browser.closeSession({ sessionId });
}

export function openProfileFolder(profilePath: string) {
  return ipc.client.browser.openProfileFolder({ profilePath });
}

export function resetPortalProfile(profilePath: string) {
  return ipc.client.browser.resetPortalProfile({ profilePath });
}
