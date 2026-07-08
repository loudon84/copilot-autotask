import { ipc } from "@/ipc/manager";
import type { PublicAuthState } from "@/types/auth";
import type { AutoTaskEndpointConfig } from "@/types/endpoint-config";

export function getAuthState(): Promise<PublicAuthState> {
  return ipc.client.auth.getState();
}

export function getAuthEndpointConfig(): Promise<AutoTaskEndpointConfig> {
  return ipc.client.auth.getEndpointConfig();
}

export function saveAuthEndpointConfig(
  config: AutoTaskEndpointConfig
): Promise<AutoTaskEndpointConfig> {
  return ipc.client.auth.saveEndpoint(config);
}

export function login(
  email: string,
  password: string
): Promise<PublicAuthState> {
  return ipc.client.auth.login({ email, password });
}

export function logout(): Promise<PublicAuthState> {
  return ipc.client.auth.logout();
}

export function refreshAuth(): Promise<PublicAuthState> {
  return ipc.client.auth.refresh();
}
