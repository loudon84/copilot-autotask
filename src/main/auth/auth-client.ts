import {
  type AutoTaskEndpointConfig,
  buildAuthUrl,
} from "@/types/endpoint-config";
import { getEndpointConfig } from "./auth-endpoint-config-store";
import {
  type AuthMeResponse,
  type AuthTokenResponse,
  type StoredAuthSession,
  toStoredSession,
} from "./nodeskclaw-auth-response";
import {
  clearSession,
  getMemorySession,
  loadSession,
  saveSession,
  setMemorySession,
} from "./token-store";

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

async function authFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Auth request failed: ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string; message?: string };
      message = body.detail ?? body.message ?? message;
    } catch {
      // ignore parse error
    }
    throw new AuthError(message, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

function getConfig(): AutoTaskEndpointConfig {
  return getEndpointConfig();
}

export async function loginWithCredentials(
  account: string,
  password: string
): Promise<StoredAuthSession> {
  debugger;
  const config = getConfig();
  const tokens = await authFetch<AuthTokenResponse>(
    buildAuthUrl(config, "/account-login"),
    {
      method: "POST",
      body: JSON.stringify({ account, password }),
    }
  );

  const me = await authFetch<AuthMeResponse>(buildAuthUrl(config, "/me"), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  });

  const session = toStoredSession(tokens, me);
  await saveSession(session);
  return session;
}

export function fetchMe(accessToken: string): Promise<AuthMeResponse> {
  const config = getConfig();
  return authFetch<AuthMeResponse>(buildAuthUrl(config, "/me"), {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function refreshSession(): Promise<StoredAuthSession | null> {
  const current = getMemorySession() ?? (await loadSession());
  if (!current?.refreshToken) {
    return null;
  }

  const config = getConfig();
  try {
    const tokens = await authFetch<AuthTokenResponse>(
      buildAuthUrl(config, "/refresh"),
      {
        method: "POST",
        body: JSON.stringify({ refresh_token: current.refreshToken }),
      }
    );

    const me = await fetchMe(tokens.access_token);
    const session = toStoredSession(tokens, me);
    await saveSession(session);
    return session;
  } catch {
    await clearSession();
    setMemorySession(null);
    return null;
  }
}

export async function logoutSession(): Promise<void> {
  const current = getMemorySession() ?? (await loadSession());
  if (current?.accessToken) {
    const config = getConfig();
    try {
      await authFetch(buildAuthUrl(config, "/logout"), {
        method: "POST",
        headers: { Authorization: `Bearer ${current.accessToken}` },
      });
    } catch {
      // ignore logout errors
    }
  }
  await clearSession();
}

export async function getValidSession(): Promise<StoredAuthSession | null> {
  let session = getMemorySession() ?? (await loadSession());
  if (!session) {
    return null;
  }

  setMemorySession(session);

  const expiresSoon = session.expiresAt - Date.now() < 60_000;
  if (expiresSoon) {
    session = await refreshSession();
  }

  return session;
}

export async function getPublicAuthState() {
  const session = await getValidSession();
  if (!session) {
    return { status: "unauthenticated" as const };
  }

  return {
    status: "authenticated" as const,
    user: session.user,
    organization: session.organization,
  };
}
