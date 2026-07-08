import { useQuery } from "@tanstack/react-query";
import { autotaskApi } from "@/services/autotask-api";
import { queryKeys } from "@/services/query-keys";

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: queryKeys.workflows.list(),
    queryFn: () => autotaskApi.workflowTemplates.list(),
  });
}

export function useWorkflowTemplate(workflowId: string) {
  return useQuery({
    queryKey: queryKeys.workflows.detail(workflowId),
    queryFn: () => autotaskApi.workflowTemplates.get(workflowId),
    enabled: Boolean(workflowId),
  });
}
