import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/page-header";
import { MockLoading } from "@/components/common/mock-loading";
import { DataTable } from "@/components/common/data-table";
import { LoginStateBadge } from "@/components/business/login-state-badge";
import { PortalActions } from "@/components/business/portal-actions";
import { mockApi } from "@/services/mock-api";
import type { SRMPortal } from "@/types/srm-portal";
import type { BrowserSession } from "@/types/browser";

function buildColumns(sessions: BrowserSession[]): ColumnDef<SRMPortal>[] {
  return [
    { accessorKey: "customerName", header: "客户名称" },
    {
      accessorKey: "name",
      header: "门户名称",
      cell: ({ row }) => (
        <Link to="/srm-portals/$portalId" params={{ portalId: row.original.id }} className="hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    { accessorKey: "url", header: "URL" },
    { accessorKey: "loginType", header: "登录方式" },
    { accessorKey: "browserType", header: "浏览器" },
    { accessorKey: "runMode", header: "运行模式" },
    {
      accessorKey: "loginState",
      header: "登录态",
      cell: ({ row }) => <LoginStateBadge state={row.original.loginState} />,
    },
    {
      id: "profile",
      header: "Profile",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground truncate max-w-[120px] inline-block">
          {row.original.profileId}
        </span>
      ),
    },
    {
      accessorKey: "lastOpenedAt",
      header: "最近打开",
      cell: ({ row }) => row.original.lastOpenedAt ?? "-",
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "enabled" ? "default" : "secondary"}>
          {row.original.status === "enabled" ? "启用" : "禁用"}
        </Badge>
      ),
    },
    { accessorKey: "updatedAt", header: "更新时间" },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const activeSession = sessions.find(
          (s) => s.portalId === row.original.id && (s.status === "OPENED" || s.status === "ATTACHED")
        );
        return (
          <div className="flex items-center gap-1">
            {activeSession && (
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-700">
                会话中
              </Badge>
            )}
            <PortalActions portal={row.original} compact />
          </div>
        );
      },
    },
  ];
}

export function SrmPortalsListPage() {
  const { data: portals = [], isLoading: portalsLoading } = useQuery({
    queryKey: ["srm-portals"],
    queryFn: mockApi.getSrmPortals,
  });
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["browser-sessions"],
    queryFn: mockApi.getBrowserSessions,
  });

  if (portalsLoading || sessionsLoading) return <MockLoading />;

  const columns = buildColumns(sessions);

  return (
    <div className="space-y-4">
      <PageHeader title="客户 SRM" description="管理客户 SRM 门户配置，支持快速打开与 Profile 管理" />
      <DataTable columns={columns} data={portals} />
    </div>
  );
}
