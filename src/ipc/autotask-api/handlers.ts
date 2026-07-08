import { os } from "@orpc/server";
import { requestAutotaskApi } from "@/main/autotask-api/autotask-api-client";
import { autotaskApiRequestSchema } from "./schemas";

export const request = os
  .input(autotaskApiRequestSchema)
  .handler(({ input }) => requestAutotaskApi(input));
