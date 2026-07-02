import type { AutomationTaskStatus } from "@/types/automation-task";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Play, Pause, RotateCcw, X, Eye, UserCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { mockApi } from "@/services/mock-api";

type TaskActionsProps = {
  taskId: string;
  status: AutomationTaskStatus;
  compact?: boolean;
  onUpdate?: () => void;
};

export function TaskActions({ taskId, status, compact, onUpdate }: TaskActionsProps) {
  const handleAction = async (
    action: string,
    newStatus?: AutomationTaskStatus,
    extra?: Record<string, unknown>
  ) => {
    if (newStatus) {
      await mockApi.updateTaskStatus(taskId, newStatus);
    }
    if (extra) {
      await mockApi.updateTask(taskId, extra);
    }
    toast.success(`操作成功: ${action}`);
    onUpdate?.();
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to="/tasks/$taskId" params={{ taskId }}>
              <Eye className="mr-2 h-4 w-4" /> 查看
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAction("执行", "RUNNING", { progress: 10 })}>
            <Play className="mr-2 h-4 w-4" /> 执行
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("暂停", "WAITING_HUMAN")}>
            <Pause className="mr-2 h-4 w-4" /> 暂停
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("重试", "QUEUED")}>
            <RotateCcw className="mr-2 h-4 w-4" /> 重试
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("取消", "CANCELLED")}>
            <X className="mr-2 h-4 w-4" /> 取消
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      <Button variant="outline" size="sm" asChild>
        <Link to="/tasks/$taskId" params={{ taskId }}>
          <Eye className="mr-1 h-3 w-3" /> 查看
        </Link>
      </Button>
      {status !== "RUNNING" && status !== "SUCCESS" && (
        <Button variant="outline" size="sm" onClick={() => handleAction("执行", "RUNNING", { progress: 10 })}>
          <Play className="mr-1 h-3 w-3" /> 执行
        </Button>
      )}
      {status === "RUNNING" && (
        <Button variant="outline" size="sm" onClick={() => handleAction("暂停", "WAITING_HUMAN")}>
          <Pause className="mr-1 h-3 w-3" /> 暂停
        </Button>
      )}
      {status === "FAILED" && (
        <Button variant="outline" size="sm" onClick={() => handleAction("重试", "QUEUED")}>
          <RotateCcw className="mr-1 h-3 w-3" /> 重试
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={() => handleAction("人工接管", "WAITING_HUMAN")}>
        <UserCheck className="mr-1 h-3 w-3" /> 接管
      </Button>
      {status !== "SUCCESS" && status !== "CANCELLED" && (
        <Button variant="outline" size="sm" onClick={() => handleAction("标记完成", "SUCCESS", { progress: 100 })}>
          完成
        </Button>
      )}
    </div>
  );
}
