import { useQuery } from "@tanstack/react-query";
import { autotaskApi } from "@/services/autotask-api";
import { getApiMode } from "@/services/endpoint-config";
import { queryKeys } from "@/services/query-keys";

export function useRuns() {
  return useQuery({
    queryKey: queryKeys.runs.list(),
    queryFn: () => autotaskApi.runs.list(),
  });
}

export function useRun(runId: string) {
  const isRemote = getApiMode() === "remote";
  return useQuery({
    queryKey: queryKeys.runs.detail(runId),
    queryFn: () => autotaskApi.runs.get(runId),
    enabled: Boolean(runId),
    refetchInterval: isRemote ? 1000 : false,
  });
}

export function useRunsByTask(taskId: string) {
  const isRemote = getApiMode() === "remote";
  return useQuery({
    queryKey: queryKeys.runs.byTask(taskId),
    queryFn: () => autotaskApi.runs.listByTask(taskId),
    enabled: Boolean(taskId),
    refetchInterval: isRemote ? 2000 : false,
  });
}

export function useRunEvents(runId: string) {
  const isRemote = getApiMode() === "remote";
  return useQuery({
    queryKey: queryKeys.runs.events(runId),
    queryFn: () => autotaskApi.runs.listEvents(runId),
    enabled: Boolean(runId),
    refetchInterval: isRemote ? 1000 : false,
  });
}
