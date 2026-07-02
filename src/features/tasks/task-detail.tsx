import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MockLoading } from "@/components/common/mock-loading";
import { EmptyState } from "@/components/common/empty-state";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/business/status-badge";
import { PriorityBadge } from "@/components/business/priority-badge";
import { StepTimeline } from "@/components/business/step-timeline";
import { RunLogPanel } from "@/components/business/run-log-panel";
import { ArtifactList } from "@/components/business/artifact-preview";
import { TaskActions } from "@/components/business/task-actions";
import { HumanCheckpointPanel } from "@/components/business/human-checkpoint-panel";
import { mockApi } from "@/services/mock-api";
import type { AuditLog } from "@/types/audit-log";

export function TaskDetailPage({ taskId }: { taskId: string }) {
  const queryClient = useQueryClient();
  const onUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    queryClient.invalidateQueries({ queryKey: ["human-action", taskId] });
    queryClient.invalidateQueries({ queryKey: ["web-tabs"] });
    queryClient.invalidateQueries({ queryKey: ["audit-logs", taskId] });
  };

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => mockApi.getTaskById(taskId),
  });
  const { data: workflow } = useQuery({
    queryKey: ["workflow", task?.workflowTemplateId],
    queryFn: () => mockApi.getWorkflowById(task!.workflowTemplateId),
    enabled: !!task?.workflowTemplateId,
  });
  const { data: runs = [] } = useQuery({
    queryKey: ["runs", taskId],
    queryFn: () => mockApi.getRunsByTaskId(taskId),
    enabled: !!taskId,
  });
  const { data: artifacts = [] } = useQuery({
    queryKey: ["artifacts", taskId],
    queryFn: () => mockApi.getArtifactsByTaskId(taskId),
    enabled: !!taskId,
  });
  const { data: auditLogs = [] } = useQuery({
    queryKey: ["audit-logs", taskId],
    queryFn: () => mockApi.getAuditLogs(taskId),
    enabled: !!taskId,
  });

  if (isLoading) return <MockLoading />;
  if (!task) return <EmptyState title="任务不存在" />;

  const latestRun = runs[0];
  const auditColumns: ColumnDef<AuditLog>[] = [
    { accessorKey: "createdAt", header: "时间" },
    { accessorKey: "action", header: "操作" },
    { accessorKey: "operator", header: "操作人" },
    { accessorKey: "detail", header: "详情" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{task.title}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <span className="text-sm text-muted-foreground">{task.customerName} · {task.owner}</span>
          </div>
        </div>
        <TaskActions taskId={task.id} status={task.status} onUpdate={onUpdate} />
      </div>

      <HumanCheckpointPanel taskId={task.id} status={task.status} onUpdate={onUpdate} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">流程步骤</CardTitle></CardHeader>
          <CardContent>
            {workflow ? (
              <StepTimeline steps={workflow.steps} />
            ) : (
              <p className="text-sm text-muted-foreground">无流程信息</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-sm">运行日志</CardTitle></CardHeader>
          <CardContent>
            {latestRun ? (
              <RunLogPanel logs={latestRun.logs} />
            ) : (
              <p className="text-sm text-muted-foreground">暂无运行记录</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">任务输入参数</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                {Object.entries(task.input).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-mono">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">关联证据</CardTitle></CardHeader>
            <CardContent>
              <ArtifactList artifacts={artifacts} />
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">审计日志</h3>
        <DataTable columns={auditColumns} data={auditLogs} pageSize={5} />
      </div>
    </div>
  );
}
