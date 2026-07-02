import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { MockLoading } from "@/components/common/mock-loading";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/business/status-badge";
import { WorkerStatusCard } from "@/components/business/worker-status-card";
import { mockApi } from "@/services/mock-api";
import type { TaskRun } from "@/types/task-run";
import { Eye } from "lucide-react";

function buildRunColumns(): ColumnDef<TaskRun>[] {
  return [
    { accessorKey: "id", header: "Run ID" },
    {
      accessorKey: "taskTitle",
      header: "任务标题",
      cell: ({ row }) => (
        <Link to="/tasks/$taskId" params={{ taskId: row.original.taskId }} className="hover:underline">
          {row.original.taskTitle}
        </Link>
      ),
    },
    { accessorKey: "workflowTemplateName", header: "流程模板" },
    { accessorKey: "workerId", header: "Worker" },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "currentStep",
      header: "当前步骤",
      cell: ({ row }) => {
        const step = row.original.stepRuns.find((s) => s.stepId === row.original.currentStepId);
        return step?.stepName ?? "-";
      },
    },
    { accessorKey: "startedAt", header: "开始时间" },
    {
      id: "duration",
      header: "耗时",
      cell: ({ row }) =>
        row.original.durationSeconds
          ? `${Math.floor(row.original.durationSeconds / 60)}m ${row.original.durationSeconds % 60}s`
          : "进行中",
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" asChild>
          <Link to="/runs/$runId" params={{ runId: row.original.id }}>
            <Eye className="h-4 w-4" />
          </Link>
        </Button>
      ),
    },
  ];
}

export function RunsListPage() {
  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ["runs"],
    queryFn: mockApi.getRuns,
  });
  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: mockApi.getWorkers,
  });

  const columns = buildRunColumns();

  if (runsLoading || workersLoading) return <MockLoading />;

  const activeRuns = runs.filter((r) => r.status === "RUNNING" || r.status === "QUEUED");
  const failedRuns = runs.filter((r) => r.status === "FAILED");

  return (
    <div className="space-y-6">
      <PageHeader title="运行监控" description="运行队列、Worker 状态与历史记录" />

      <div>
        <h3 className="mb-3 text-lg font-semibold">Worker 状态</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {workers.map((w) => (
            <WorkerStatusCard key={w.id} worker={w} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">运行队列</h3>
        <DataTable columns={columns} data={activeRuns} pageSize={5} />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">历史运行记录</h3>
        <DataTable columns={columns} data={runs} />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold">失败重试列表</h3>
        <DataTable columns={columns} data={failedRuns} pageSize={5} />
      </div>
    </div>
  );
}
