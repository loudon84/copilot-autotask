import { describe, expect, it, vi } from "vitest";

describe("getApiMode", () => {
  it("defaults to mock when env is unset", async () => {
    vi.stubEnv("VITE_AUTOTASK_API_MODE", "");
    const { getApiMode } = await import("@/types/endpoint-config");
    expect(getApiMode()).toBe("mock");
    vi.unstubAllEnvs();
  });

  it("returns remote when env is remote", async () => {
    vi.stubEnv("VITE_AUTOTASK_API_MODE", "remote");
    const { getApiMode } = await import("@/types/endpoint-config");
    expect(getApiMode()).toBe("remote");
    vi.unstubAllEnvs();
  });
});

describe("autotaskApi facade", () => {
  it("exposes domain namespaces", async () => {
    const { autotaskApi } = await import("@/services/autotask-api");
    expect(autotaskApi.dashboard.getSummary).toBeTypeOf("function");
    expect(autotaskApi.tasks.list).toBeTypeOf("function");
    expect(autotaskApi.portalAccounts.list).toBeTypeOf("function");
    expect(autotaskApi.search).toBeTypeOf("function");
  });
});
