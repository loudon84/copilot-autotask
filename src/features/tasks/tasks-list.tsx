import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/common/page-header";
import { MockLoading } from "@/components/common/mock-loading";
import { DataTable } from "@/components/common/data-table";
import { FilterBar } from "@/components/common/filter-bar";
import { SearchInput } from "@/components/common/search-input";
import { StatusBadge } from "@/components/business/status-badge";
import { PriorityBadge } from "@/components/business/priority-badge";
import { ProgressCell } from "@/components/business/progress-cell";
import { TaskActions } from "@/components/business/task-actions";
import { mockApi } from "@/services/mock-api";
import type { AutomationTask, AutomationTaskStatus } from "@/types/automation-task";
import { Plus } from "lucide-react";

const statusTabs: { value: string; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "RUNNING", label: "执行中" },
  { value: "WAITING_HUMAN", label: "待人工" },
  { value: "FAILED", label: "失败" },
  { value: "SUCCESS", label: "成功" },
  { value: "READY", label: "待执行" },
];

export function TasksListPage() {
  const queryClient = useQueryClient();
  const [statusTab, setStatusTab] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [customer, setCustomer] = useState("all");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: mockApi.getTasks,
  });

  const onUpdate = () => queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const customers = [...new Set(tasks.map((t) => t.customerName))];

  const filtered = tasks.filter((t) => {
    if (statusTab !== "all" && t.status !== statusTab) return false;
    if (customer !== "all" && t.customerName !== customer) return false;
    if (keyword && !t.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  const columns: ColumnDef<AutomationTask>[] = [
    {
      accessorKey: "title",
      header: "任务标题",
      cell: ({ row }) => (
        <Link to="/tasks/$taskId" params={{ taskId: row.original.id }} className="hover:underline font-medium">
          {row.original.title}
        </Link>
      ),
    },
    { accessorKey: "customerName", header: "客户" },
    { accessorKey: "taskType", header: "任务类型" },
    { accessorKey: "workflowTemplateName", header: "流程模板" },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "priority",
      header: "优先级",
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    { accessorKey: "currentStep", header: "当前步骤" },
    {
      accessorKey: "progress",
      header: "进度",
      cell: ({ row }) => <ProgressCell progress={row.original.progress} />,
    },
    { accessorKey: "owner", header: "负责人" },
    { accessorKey: "createdAt", header: "创建时间" },
    { accessorKey: "updatedAt", header: "更新时间" },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <TaskActions taskId={row.original.id} status={row.original.status} compact onUpdate={onUpdate} />
      ),
    },
  ];

  if (isLoading) return <MockLoading />;

  return (
    <div className="space-y-4">
      <PageHeader title="自动化任务" description="管理所有自动化任务">
        <Button asChild>
          <Link to="/tasks/new">
            <Plus className="mr-2 h-4 w-4" /> 新建任务
          </Link>
        </Button>
      </PageHeader>

      <FilterBar>
        <SearchInput value={keyword} onChange={setKeyword} placeholder="关键词搜索..." className="w-48" />
        <Select value={customer} onValueChange={setCustomer}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="客户" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部客户</SelectItem>
            {customers.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <Tabs value={statusTab} onValueChange={setStatusTab}>
        <TabsList>
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable columns={columns} data={filtered} />
    </div>
  );
}
