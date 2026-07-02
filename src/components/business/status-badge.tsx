import type { AutomationTaskStatus } from "@/types/automation-task";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/tailwind";

const statusConfig: Record<
  AutomationTaskStatus,
  { label: string; className: string }
> = {
  DRAFT: { label: "草稿", className: "bg-muted text-muted-foreground" },
  READY: { label: "待执行", className: "bg-muted text-muted-foreground" },
  QUEUED: { label: "排队中", className: "bg-purple-500/15 text-purple-700 dark:text-purple-300" },
  RUNNING: { label: "执行中", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300 animate-pulse" },
  WAITING_HUMAN: { label: "待人工", className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  WAITING_RETRY: { label: "等待重试", className: "bg-orange-500/15 text-orange-700 dark:text-orange-300" },
  SUCCESS: { label: "成功", className: "bg-green-500/15 text-green-700 dark:text-green-300" },
  PARTIAL_SUCCESS: { label: "部分成功", className: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  FAILED: { label: "失败", className: "bg-red-500/15 text-red-700 dark:text-red-300" },
  CANCELLED: { label: "已取消", className: "bg-muted text-muted-foreground" },
};

export function StatusBadge({ status }: { status: AutomationTaskStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("border-0 font-normal", config.className)}>
      {config.label}
    </Badge>
  );
}

export function getStatusLabel(status: AutomationTaskStatus): string {
  return statusConfig[status].label;
}
