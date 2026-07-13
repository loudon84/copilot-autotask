export interface AutoTaskEndpointConfig {
  aiosHomeUrl?: string;
  authBackendUrl: string;
  authPrefix: string;
  taskBackendUrl: string;
  taskPrefix: string;
}

export const defaultAutoTaskEndpointConfig: AutoTaskEndpointConfig = {
  authBackendUrl: "http://127.0.0.1:4510",
  authPrefix: "/api/v1/auth",
  taskBackendUrl: "http://127.0.0.1:4520",
  taskPrefix: "/api/v1/autotask",
  aiosHomeUrl: "http://127.0.0.1:4517",
};

export type ApiMode = "mock" | "remote";

export function getApiMode(): ApiMode {
  const mode = import.meta.env.VITE_AUTOTASK_API_MODE ?? "remote";
  return mode === "mock" ? "mock" : "remote";
}

export function buildAuthUrl(
  config: AutoTaskEndpointConfig,
  path: string
): string {
  const base = config.authBackendUrl.replace(/\/$/, "");
  const prefix = config.authPrefix.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${prefix}${normalizedPath}`;
}

export function buildTaskUrl(
  config: AutoTaskEndpointConfig,
  path: string
): string {
  const base = config.taskBackendUrl.replace(/\/$/, "");
  const prefix = config.taskPrefix.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${prefix}${normalizedPath}`;
}
