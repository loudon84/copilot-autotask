import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockApi } from "@/services/mock-api";
import type { HumanAction, HumanActionType } from "@/types/human-action";
import { ExternalLink, CheckCircle, Copy } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { openHumanTask } from "@/actions/web-workspace";

const typeLabels: Record<HumanActionType, string> = {
  manual_confirm: "人工确认",
  manual_upload: "人工上传",
  manual_approve: "人工审批",
  manual_captcha: "验证码",
  manual_mfa: "MFA 验证",
  manual_exception_handle: "异常处理",
};

type HumanConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  humanActionId: string;
  onConfirmed?: () => void;
};

export function HumanConfirmDialog({
  open,
  onOpenChange,
  taskId,
  humanActionId,
  onConfirmed,
}: HumanConfirmDialogProps) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await mockApi.confirmHumanAction({
        taskId,
        humanActionId,
        note,
      });
      toast.success("已确认完成", {
        description: `任务状态: ${result.status}。后台不会继续执行同一浏览器会话。`,
      });
      onOpenChange(false);
      setNote("");
      onConfirmed?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "确认失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认人工操作已完成？</DialogTitle>
          <DialogDescription>
            确认后任务将标记为人工完成，后台不会继续执行同一浏览器会话。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>处理备注（可选）</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：已在客户B供应商平台完成装箱单上传"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            <CheckCircle className="mr-2 h-4 w-4" /> 确认已完成
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type HumanActionPanelProps = {
  taskId: string;
  status: string;
  onUpdate?: () => void;
};

export function HumanActionPanel({ taskId, status, onUpdate }: HumanActionPanelProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opening, setOpening] = useState(false);

  const { data: humanAction } = useQuery({
    queryKey: ["human-action", taskId],
    queryFn: () => mockApi.getHumanAction(taskId),
    enabled: !!taskId,
  });

  if (!humanAction) return null;
  if (!["WAITING_HUMAN", "HUMAN_OPERATING", "SUCCESS_MANUAL"].includes(status)) return null;

  const handleOpen = async () => {
    setOpening(true);
    try {
      let sessionPartition = humanAction.portalId
        ? `persist:srm:${humanAction.portalId}`
        : `persist:task:${taskId}`;
      if (humanAction.portalId) {
        const portal = await mockApi.getSrmPortalById(humanAction.portalId);
        if (portal) sessionPartition = portal.clientSessionPartition;
      }

      const tab = await openHumanTask({
        taskId,
        humanActionId: humanAction.id,
        url: humanAction.targetUrl,
        title: typeLabels[humanAction.type],
        portalId: humanAction.portalId,
        sessionPartition,
      });

      await mockApi.markHumanOpened({
        taskId,
        humanActionId: humanAction.id,
        clientTabId: tab.id,
      });

      toast.success("已打开待人工处理页面", { description: `Tab: ${tab.id}` });
      navigate({ to: "/web-workspace" });
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "打开失败");
    } finally {
      setOpening(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(humanAction.targetUrl);
      toast.success("链接已复制");
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <>
      <Card className="border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-sm">人工处理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">当前状态</dt>
              <dd>{status}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">处理类型</dt>
              <dd>{typeLabels[humanAction.type]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-1">处理说明</dt>
              <dd>{humanAction.instruction}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">目标页面</dt>
              <dd className="font-mono text-xs truncate max-w-[300px]">{humanAction.targetUrl}</dd>
            </div>
            {humanAction.confirmedAt && (
              <>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">确认人</dt>
                  <dd>{humanAction.confirmedBy ?? "-"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">确认时间</dt>
                  <dd>{humanAction.confirmedAt}</dd>
                </div>
                {humanAction.note && (
                  <div>
                    <dt className="text-muted-foreground mb-1">确认备注</dt>
                    <dd>{humanAction.note}</dd>
                  </div>
                )}
              </>
            )}
          </dl>

          {(status === "WAITING_HUMAN" || status === "HUMAN_OPERATING") && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleOpen} disabled={opening}>
                <ExternalLink className="mr-2 h-4 w-4" />
                {status === "HUMAN_OPERATING" ? "重新打开" : "快速打开"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCopyUrl}>
                <Copy className="mr-2 h-4 w-4" /> 复制链接
              </Button>
              <Button size="sm" variant="outline" onClick={() => setConfirmOpen(true)}>
                <CheckCircle className="mr-2 h-4 w-4" /> 确认已完成
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <HumanConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        taskId={taskId}
        humanActionId={humanAction.id}
        onConfirmed={onUpdate}
      />
    </>
  );
}

export function getHumanActionTypeLabel(type: HumanActionType): string {
  return typeLabels[type];
}

// Backward-compatible exports
export { HumanActionPanel as HumanCheckpointPanel };
export function getReasonLabel(type: HumanActionType): string {
  return typeLabels[type];
}
