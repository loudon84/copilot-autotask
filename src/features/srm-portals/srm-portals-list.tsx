import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { MockLoading } from "@/components/common/mock-loading";
import { DataTable } from "@/components/common/data-table";
import { mockApi } from "@/services/mock-api";
import type { SRMPortal } from "@/types/srm-portal";
import { Eye } from "lucide-react";

const columns: ColumnDef<SRMPortal>[] = [
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
    cell: ({ row }) => (
      <Button variant="ghost" size="sm" asChild>
        <Link to="/srm-portals/$portalId" params={{ portalId: row.original.id }}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];

export function SrmPortalsListPage() {
  const { data: portals = [], isLoading } = useQuery({
    queryKey: ["srm-portals"],
    queryFn: mockApi.getSrmPortals,
  });

  if (isLoading) return <MockLoading />;

  return (
    <div className="space-y-4">
      <PageHeader title="客户 SRM" description="管理客户 SRM 门户配置" />
      <DataTable columns={columns} data={portals} />
    </div>
  );
}
