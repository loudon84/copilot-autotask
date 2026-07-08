import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/common/data-table";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkflowTemplates } from "@/features/workflows/api/use-workflow-templates";
import type { WorkflowTemplate } from "@/types/workflow";

const columns: ColumnDef<WorkflowTemplate>[] = [
  {
    accessorKey: "name",
    header: "模板名称",
    cell: ({ row }) => (
      <Link
        className="font-medium hover:underline"
        params={{ workflowId: row.original.id }}
        to="/workflows/$workflowId"
      >
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "code", header: "编码" },
  { accessorKey: "category", header: "分类" },
  { accessorKey: "target", header: "目标类型" },
  { accessorKey: "version", header: "版本" },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "enabled" ? "default" : "secondary"}
      >
        {row.original.status === "enabled"
          ? "启用"
          : row.original.status === "disabled"
            ? "禁用"
            : "草稿"}
      </Badge>
    ),
  },
  {
    id: "stepCount",
    header: "步骤数",
    cell: ({ row }) => row.original.steps.length,
  },
  { accessorKey: "updatedAt", header: "更新时间" },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => (
      <Button asChild size="sm" variant="ghost">
        <Link
          params={{ workflowId: row.original.id }}
          to="/workflows/$workflowId"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];

export function WorkflowsListPage() {
  const { data: workflows = [], isLoading } = useWorkflowTemplates();

  if (isLoading) {
    return <MockLoading />;
  }

  return (
    <div className="space-y-4">
      <PageHeader description="管理 RPA 流程模板" title="流程模板" />
      <DataTable columns={columns} data={workflows} />
    </div>
  );
}
