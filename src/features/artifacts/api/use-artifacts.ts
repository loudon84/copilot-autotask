import { useQuery } from "@tanstack/react-query";
import { autotaskApi } from "@/services/autotask-api";
import { queryKeys } from "@/services/query-keys";

export function useArtifacts() {
  return useQuery({
    queryKey: queryKeys.artifacts.list(),
    queryFn: () => autotaskApi.artifacts.list(),
  });
}

export function useArtifactsByTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.artifacts.byTask(taskId),
    queryFn: () => autotaskApi.artifacts.listByTask(taskId),
    enabled: Boolean(taskId),
  });
}

export function useArtifactsByRun(runId: string) {
  return useQuery({
    queryKey: queryKeys.artifacts.byRun(runId),
    queryFn: () => autotaskApi.artifacts.listByRun(runId),
    enabled: Boolean(runId),
  });
}
