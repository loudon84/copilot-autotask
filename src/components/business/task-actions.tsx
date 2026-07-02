import { useState } from "react";
import type { AutomationTaskStatus } from "@/types/automation-task";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HumanConfirmDialog } from "@/components/business/human-checkpoint-panel";
import { MoreHorizontal, Play, Pause, RotateCcw, X, Eye, UserCheck, ExternalLink, CheckCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { mockApi } from "@/services/mock-api";
import { useQuery } from "@tanstack/react-query";

type TaskActionsProps = {
  taskId: string;
  status: AutomationTaskStatus;
  compact?: boolean;
  onUpdate?: () => void;
};

export function TaskActions({ taskId, status, compact, onUpdate }: TaskActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opening, setOpening] = useState(false);

  const { data: checkpoint } = useQuery({
    queryKey: ["human-checkpoint", taskId],
    queryFn: () => mockApi.getHumanCheckpointByTaskId(taskId),
    enabled: status === "WAITING_HUMAN" || status === "HUMAN_OPERATING",
  });

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

  const handleOpenHuman = async () => {
    setOpening(true);
    try {
      const result = await mockApi.openHumanTaskMock({ taskId });
      toast.success("已打开待人工处理页面", {
        description: `Session: ${result.session.id}`,
      });
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "打开失败");
    } finally {
      setOpening(false);
    }
  };

  if (compact) {
    return (
      <>
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
            {status === "READY" && (
              <DropdownMenuItem onClick={() => handleAction("执行", "RUNNING", { progress: 10 })}>
                <Play className="mr-2 h-4 w-4" /> 执行
              </DropdownMenuItem>
            )}
            {status === "RUNNING" && (
              <DropdownMenuItem onClick={() => handleAction("暂停", "WAITING_HUMAN")}>
                <Pause className="mr-2 h-4 w-4" /> 暂停
              </DropdownMenuItem>
            )}
            {(status === "WAITING_HUMAN" || status === "HUMAN_OPERATING") && (
              <>
                <DropdownMenuItem onClick={handleOpenHuman} disabled={opening}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {status === "HUMAN_OPERATING" ? "重新打开" : "快速打开"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setConfirmOpen(true)}>
                  <CheckCircle className="mr-2 h-4 w-4" /> 确认已完成
                </DropdownMenuItem>
              </>
            )}
            {status === "FAILED" && (
              <>
                <DropdownMenuItem onClick={handleOpenHuman} disabled={opening}>
                  <ExternalLink className="mr-2 h-4 w-4" /> 快速打开
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("重试", "QUEUED")}>
                  <RotateCcw className="mr-2 h-4 w-4" /> 重试
                </DropdownMenuItem>
              </>
            )}
            {status !== "SUCCESS" && status !== "SUCCESS_MANUAL" && status !== "CANCELLED" && (
              <DropdownMenuItem onClick={() => handleAction("取消", "CANCELLED")}>
                <X className="mr-2 h-4 w-4" /> 取消
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {checkpoint && (
          <HumanConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            taskId={taskId}
            checkpointId={checkpoint.id}
            onConfirmed={onUpdate}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-1">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tasks/$taskId" params={{ taskId }}>
            <Eye className="mr-1 h-3 w-3" /> 查看
          </Link>
        </Button>

        {status === "READY" && (
          <Button variant="outline" size="sm" onClick={() => handleAction("执行", "RUNNING", { progress: 10 })}>
            <Play className="mr-1 h-3 w-3" /> 执行
          </Button>
        )}

        {status === "RUNNING" && (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link to="/tasks/$taskId" params={{ taskId }}>
                查看运行
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction("人工接管", "WAITING_HUMAN")}>
              <UserCheck className="mr-1 h-3 w-3" /> 人工接管
            </Button>
          </>
        )}

        {(status === "WAITING_HUMAN" || status === "HUMAN_OPERATING") && (
          <>
            <Button variant="outline" size="sm" onClick={handleOpenHuman} disabled={opening}>
              <ExternalLink className="mr-1 h-3 w-3" />
              {status === "HUMAN_OPERATING" ? "重新打开" : "快速打开"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
              <CheckCircle className="mr-1 h-3 w-3" /> 确认已完成
            </Button>
          </>
        )}

        {status === "SUCCESS_MANUAL" && (
          <Button variant="outline" size="sm" asChild>
            <Link to="/tasks/$taskId" params={{ taskId }}>
              查看记录
            </Link>
          </Button>
        )}

        {status === "FAILED" && (
          <>
            <Button variant="outline" size="sm" onClick={handleOpenHuman} disabled={opening}>
              <ExternalLink className="mr-1 h-3 w-3" /> 快速打开
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction("重试", "QUEUED")}>
              <RotateCcw className="mr-1 h-3 w-3" /> 重试
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleAction("标记完成", "SUCCESS_MANUAL", { progress: 100 })}>
              标记完成
            </Button>
          </>
        )}

        {status !== "SUCCESS" && status !== "SUCCESS_MANUAL" && status !== "CANCELLED" && status !== "WAITING_HUMAN" && status !== "HUMAN_OPERATING" && (
          <Button variant="outline" size="sm" onClick={() => handleAction("取消", "CANCELLED")}>
            <X className="mr-1 h-3 w-3" /> 取消
          </Button>
        )}
      </div>

      {checkpoint && (
        <HumanConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          taskId={taskId}
          checkpointId={checkpoint.id}
          onConfirmed={onUpdate}
        />
      )}
    </>
  );
}
