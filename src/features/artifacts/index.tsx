import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/common/page-header";
import { MockLoading } from "@/components/common/mock-loading";
import { DataTable } from "@/components/common/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { SearchInput } from "@/components/common/search-input";
import { ArtifactPreview } from "@/components/business/artifact-preview";
import { mockApi } from "@/services/mock-api";
import type { Artifact, ArtifactType } from "@/types/artifact";
import { Eye } from "lucide-react";

const typeLabels: Record<ArtifactType, string> = {
  screenshot: "截图",
  download: "下载文件",
  upload: "上传文件",
  trace: "Trace",
  dom_snapshot: "DOM 快照",
  log: "日志",
};

export function ArtifactsPage() {
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [preview, setPreview] = useState<Artifact | null>(null);

  const { data: artifacts = [], isLoading } = useQuery({
    queryKey: ["artifacts"],
    queryFn: mockApi.getArtifacts,
  });

  const filtered = artifacts.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    if (keyword && !a.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  const columns: ColumnDef<Artifact>[] = [
    { accessorKey: "name", header: "文件名" },
    {
      accessorKey: "type",
      header: "类型",
      cell: ({ row }) => <Badge variant="outline">{typeLabels[row.original.type]}</Badge>,
    },
    { accessorKey: "customerName", header: "客户" },
    { accessorKey: "taskTitle", header: "任务" },
    { accessorKey: "runId", header: "Run ID" },
    { accessorKey: "sizeText", header: "大小" },
    { accessorKey: "createdAt", header: "创建时间" },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setPreview(row.original)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/tasks/$taskId" params={{ taskId: row.original.taskId }}>任务</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/runs/$runId" params={{ runId: row.original.runId }}>运行</Link>
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <MockLoading />;

  return (
    <div className="space-y-4">
      <PageHeader title="证据中心" description="RPA 执行产生的截图、文件与日志" />

      <FilterBar>
        <SearchInput value={keyword} onChange={setKeyword} placeholder="关键词..." className="w-48" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="文件类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            {Object.entries(typeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <DataTable columns={columns} data={filtered} />

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>证据预览</DialogTitle>
          </DialogHeader>
          {preview && <ArtifactPreview artifact={preview} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
