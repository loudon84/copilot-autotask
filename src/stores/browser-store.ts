import { create } from "zustand";
import browserSessionsData from "@/mock/browser-sessions.json";
import browserConfigData from "@/mock/browser-config.json";
import humanCheckpointsData from "@/mock/human-checkpoints.json";
import type { BrowserConfig, BrowserSession, HumanCheckpoint } from "@/types/browser";

interface BrowserStore {
  sessions: BrowserSession[];
  config: BrowserConfig;
  checkpoints: HumanCheckpoint[];
  sessionOverrides: Record<string, Partial<BrowserSession>>;
  checkpointOverrides: Record<string, Partial<HumanCheckpoint>>;
  addedSessions: BrowserSession[];

  addSession: (session: BrowserSession) => void;
  updateSession: (id: string, patch: Partial<BrowserSession>) => void;
  closeSession: (id: string) => void;
  updateConfig: (patch: Partial<BrowserConfig>) => void;
  updateCheckpoint: (id: string, patch: Partial<HumanCheckpoint>) => void;
  resetPortalProfile: (portalId: string) => void;
}

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export const useBrowserStore = create<BrowserStore>((set) => ({
  sessions: browserSessionsData as BrowserSession[],
  config: browserConfigData as BrowserConfig,
  checkpoints: humanCheckpointsData as HumanCheckpoint[],
  sessionOverrides: {},
  checkpointOverrides: {},
  addedSessions: [],

  addSession: (session) =>
    set((state) => ({
      addedSessions: [session, ...state.addedSessions],
    })),

  updateSession: (id, patch) =>
    set((state) => ({
      sessionOverrides: {
        ...state.sessionOverrides,
        [id]: {
          ...state.sessionOverrides[id],
          ...patch,
          lastActiveAt: now(),
        },
      },
    })),

  closeSession: (id) =>
    set((state) => ({
      sessionOverrides: {
        ...state.sessionOverrides,
        [id]: {
          ...state.sessionOverrides[id],
          status: "CLOSED",
          closedAt: now(),
        },
      },
    })),

  updateConfig: (patch) =>
    set((state) => ({
      config: { ...state.config, ...patch },
    })),

  updateCheckpoint: (id, patch) =>
    set((state) => ({
      checkpointOverrides: {
        ...state.checkpointOverrides,
        [id]: {
          ...state.checkpointOverrides[id],
          ...patch,
        },
      },
    })),

  resetPortalProfile: (portalId) =>
    set((state) => {
      const closedOverrides = { ...state.sessionOverrides };
      for (const session of getSessions(state)) {
        if (session.portalId === portalId && session.status !== "CLOSED") {
          closedOverrides[session.id] = {
            ...closedOverrides[session.id],
            status: "CLOSED",
            closedAt: now(),
          };
        }
      }
      return { sessionOverrides: closedOverrides };
    }),
}));

function getSessions(state: Pick<BrowserStore, "sessions" | "addedSessions" | "sessionOverrides">) {
  return [...state.addedSessions, ...state.sessions].map((session) => ({
    ...session,
    ...state.sessionOverrides[session.id],
  }));
}

export function mergeSessions(
  baseSessions: BrowserSession[],
  addedSessions: BrowserSession[],
  overrides: Record<string, Partial<BrowserSession>>
): BrowserSession[] {
  return [...addedSessions, ...baseSessions].map((session) => ({
    ...session,
    ...overrides[session.id],
  }));
}

export function mergeCheckpoints(
  baseCheckpoints: HumanCheckpoint[],
  overrides: Record<string, Partial<HumanCheckpoint>>
): HumanCheckpoint[] {
  return baseCheckpoints.map((checkpoint) => ({
    ...checkpoint,
    ...overrides[checkpoint.id],
  }));
}

export function getBrowserSessionsFromStore(): BrowserSession[] {
  const state = useBrowserStore.getState();
  return mergeSessions(state.sessions, state.addedSessions, state.sessionOverrides);
}

export function getHumanCheckpointsFromStore(): HumanCheckpoint[] {
  const state = useBrowserStore.getState();
  return mergeCheckpoints(state.checkpoints, state.checkpointOverrides);
}

export function allocateCdpPort(): number {
  const { minPort, maxPort } = useBrowserStore.getState().config;
  return Math.floor(Math.random() * (maxPort - minPort + 1)) + minPort;
}

export function createSessionId(): string {
  return `browser_sess_${Date.now()}`;
}
