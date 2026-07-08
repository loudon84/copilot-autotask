import { describe, expect, it } from "vitest";
import {
  mapItemResponse,
  mapKeysToCamel,
  mapListResponse,
} from "@/services/dto-mappers";

describe("dto-mappers", () => {
  it("maps snake_case keys to camelCase", () => {
    const result = mapKeysToCamel<{ taskId: string; customerName: string }>({
      task_id: "t1",
      customer_name: "Acme",
    });
    expect(result).toEqual({ taskId: "t1", customerName: "Acme" });
  });

  it("maps list response from items array", () => {
    const result = mapListResponse<{ id: string }>({
      items: [{ id: "1" }, { id: "2" }],
    });
    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("1");
  });

  it("maps single item response", () => {
    const result = mapItemResponse<{ status: string }>({
      status: "READY",
    });
    expect(result.status).toBe("READY");
  });
});
