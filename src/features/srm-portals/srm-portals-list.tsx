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

const openModeLabels: Record<SRMPortal["clientOpenMode"], string> = {
  webcontents: "内置 Web",
  system_browser: "系统浏览器",
};

function buildColumns(): ColumnDef<SRMPortal>[] {
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
    {
      accessorKey: "clientOpenMode",
      header: "客户端打开方式",
      cell: ({ row }) => openModeLabels[row.original.clientOpenMode],
    },
    {
      accessorKey: "clientSessionPartition",
      header: "Session 分区",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground truncate max-w-[160px] inline-block">
          {row.original.clientSessionPartition}
        </span>
      ),
    },
    {
      accessorKey: "serverRpaProfileId",
      header: "服务器 RPA Profile",
      cell: ({ row }) => row.original.serverRpaProfileId ?? "-",
    },
    {
      accessorKey: "loginState",
      header: "登录态",
      cell: ({ row }) => <LoginStateBadge state={row.original.loginState} />,
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
      cell: ({ row }) => <PortalActions portal={row.original} compact />,
    },
  ];
}

export function SrmPortalsListPage() {
  const { data: portals = [], isLoading } = useQuery({
    queryKey: ["srm-portals"],
    queryFn: mockApi.getSrmPortals,
  });

  if (isLoading) return <MockLoading />;

  const columns = buildColumns();

  return (
    <div className="space-y-4">
      <PageHeader title="客户 SRM" description="管理客户 SRM 门户配置，支持快速打开与 Session 管理" />
      <DataTable columns={columns} data={portals} />
    </div>
  );
}
