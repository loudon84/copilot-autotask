import { describe, expect, it, vi } from "vitest";

describe("getApiMode", () => {
  it("defaults to remote when env is unset", async () => {
    vi.stubEnv("VITE_AUTOTASK_API_MODE", "");
    const { getApiMode } = await import("@/types/endpoint-config");
    expect(getApiMode()).toBe("remote");
    vi.unstubAllEnvs();
  });

  it("returns mock when env is mock", async () => {
    vi.stubEnv("VITE_AUTOTASK_API_MODE", "mock");
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
    expect(autotaskApi.portalAccounts.create).toBeTypeOf("function");
    expect(autotaskApi.portalAccounts.update).toBeTypeOf("function");
    expect(autotaskApi.portalAccounts.delete).toBeTypeOf("function");
    expect(autotaskApi.portalAccounts.testOpen).toBeTypeOf("function");
    expect(autotaskApi.search).toBeTypeOf("function");
  });
});
