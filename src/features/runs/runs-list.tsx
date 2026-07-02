import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import { MockLoading } from "@/components/common/mock-loading";
import { DataTable } from "@/components/common/data-table";
import { StatusBadge } from "@/components/business/status-badge";
import { BrowserSessionStatusBadge } from "@/components/business/browser-session-status-badge";
import { WorkerStatusCard } from "@/components/business/worker-status-card";
import { mockApi } from "@/services/mock-api";
import type { TaskRun } from "@/types/task-run";
import type { BrowserSession } from "@/types/browser";
import { toast } from "sonner";
import { Copy, Eye, FolderOpen, X } from "lucide-react";

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

function buildSessionColumns(
  onClose: (id: string) => void
): ColumnDef<BrowserSession>[] {
  return [
    { accessorKey: "id", header: "Session ID" },
    { accessorKey: "customerName", header: "客户" },
    { accessorKey: "portalName", header: "SRM 门户" },
    {
      accessorKey: "taskId",
      header: "任务",
      cell: ({ row }) =>
        row.original.taskId ? (
          <Link to="/tasks/$taskId" params={{ taskId: row.original.taskId }} className="hover:underline text-xs">
            {row.original.taskId}
          </Link>
        ) : (
          "-"
        ),
    },
    { accessorKey: "profileId", header: "Profile ID" },
    { accessorKey: "browserType", header: "浏览器" },
    { accessorKey: "pid", header: "PID" },
    { accessorKey: "cdpPort", header: "CDP Port" },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => <BrowserSessionStatusBadge status={row.original.status} />,
    },
    { accessorKey: "startedAt", header: "启动时间" },
    { accessorKey: "lastActiveAt", header: "最近活跃" },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.cdpEndpoint && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                navigator.clipboard.writeText(row.original.cdpEndpoint!);
                toast.success("已复制 CDP Endpoint");
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => toast.info(`Profile: ${row.original.profilePath}`)}
          >
            <FolderOpen className="h-3 w-3" />
          </Button>
          {row.original.status !== "CLOSED" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onClose(row.original.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}

export function RunsListPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("queue");

  const { data: runs = [], isLoading: runsLoading } = useQuery({
    queryKey: ["runs"],
    queryFn: mockApi.getRuns,
  });
  const { data: workers = [], isLoading: workersLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: mockApi.getWorkers,
  });
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["browser-sessions"],
    queryFn: mockApi.getBrowserSessions,
  });

  const handleCloseSession = async (sessionId: string) => {
    await mockApi.closeSessionMock(sessionId);
    toast.success("会话已关闭");
    queryClient.invalidateQueries({ queryKey: ["browser-sessions"] });
  };

  if (runsLoading || workersLoading || sessionsLoading) return <MockLoading />;

  const runColumns = buildRunColumns();
  const sessionColumns = buildSessionColumns(handleCloseSession);
  const activeRuns = runs.filter((r) => r.status === "RUNNING" || r.status === "QUEUED");
  const failedRuns = runs.filter((r) => r.status === "FAILED");
  const activeSessions = sessions.filter((s) => s.status !== "CLOSED");

  return (
    <div className="space-y-6">
      <PageHeader title="运行监控" description="运行队列、Worker 状态、浏览器会话与历史记录" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queue">运行队列</TabsTrigger>
          <TabsTrigger value="history">历史运行</TabsTrigger>
          <TabsTrigger value="workers">Worker 状态</TabsTrigger>
          <TabsTrigger value="sessions">浏览器会话</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-4">
          <DataTable columns={runColumns} data={activeRuns} pageSize={5} />
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-6">
          <DataTable columns={runColumns} data={runs} />
          <div>
            <h3 className="mb-3 text-lg font-semibold">失败重试列表</h3>
            <DataTable columns={runColumns} data={failedRuns} pageSize={5} />
          </div>
        </TabsContent>

        <TabsContent value="workers" className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {workers.map((w) => (
              <WorkerStatusCard key={w.id} worker={w} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-4">
          <DataTable columns={sessionColumns} data={activeSessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
