import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { MockLoading } from "@/components/common/mock-loading";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/business/status-badge";
import { TaskActions } from "@/components/business/task-actions";
import { WorkerStatusCard } from "@/components/business/worker-status-card";
import { mockApi } from "@/services/mock-api";
import type { AutomationTask } from "@/types/automation-task";

function StatCard({ title, value, suffix }: { title: string; value: number | string; suffix?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">
          {value}
          {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

function buildTaskColumns(onUpdate: () => void): ColumnDef<AutomationTask>[] {
  return [
    {
      accessorKey: "title",
      header: "任务标题",
      cell: ({ row }) => (
        <Link to="/tasks/$taskId" params={{ taskId: row.original.id }} className="hover:underline">
          {row.original.title}
        </Link>
      ),
    },
    { accessorKey: "customerName", header: "客户" },
    { accessorKey: "workflowTemplateName", header: "流程模板" },
    { accessorKey: "currentStep", header: "当前步骤" },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    { accessorKey: "owner", header: "负责人" },
    { accessorKey: "updatedAt", header: "更新时间" },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <TaskActions taskId={row.original.id} status={row.original.status} compact onUpdate={onUpdate} />
      ),
    },
  ];
}

export function DashboardPage() {
  const queryClient = useQueryClient();
  const onUpdate = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: mockApi.getDashboard,
  });
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: mockApi.getTasks,
  });
  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: mockApi.getWorkers,
  });

  if (dashLoading || tasksLoading || workersLoading) return <MockLoading />;

  const stats = dashboard?.stats;
  const runningTasks = tasks.filter((t) => t.status === "RUNNING" || t.status === "QUEUED");
  const humanTasks = tasks.filter((t) => t.status === "WAITING_HUMAN");
  const failedTasks = tasks.filter((t) => t.status === "FAILED");
  const columns = buildTaskColumns(onUpdate);

  return (
    <div className="space-y-6">
      <PageHeader title="工作台" description="自动化任务平台整体运行状态" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard title="待执行" value={stats?.pending ?? 0} />
        <StatCard title="执行中" value={stats?.running ?? 0} />
        <StatCard title="待人工" value={stats?.waitingHuman ?? 0} />
        <StatCard title="失败" value={stats?.failed ?? 0} />
        <StatCard title="今日完成" value={stats?.completedToday ?? 0} />
        <StatCard title="成功率" value={stats?.successRate ?? 0} suffix="%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold">当前执行队列</h3>
            <DataTable columns={columns} data={runningTasks} pageSize={5} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">待人工处理</h3>
            <DataTable columns={columns} data={humanTasks} pageSize={5} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">最近失败任务</h3>
            <DataTable columns={columns} data={failedTasks} pageSize={5} />
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-lg font-semibold">Worker 状态</h3>
            <div className="space-y-3">
              {workers.map((w) => (
                <WorkerStatusCard key={w.id} worker={w} />
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">任务类型分布</h3>
            <Card>
              <CardContent className="pt-4 space-y-3">
                {dashboard?.taskTypeDistribution.map((item) => (
                  <div key={item.taskType} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${Math.min(100, (item.count / (stats?.completedToday ?? 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
