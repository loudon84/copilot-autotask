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
import type { HumanCheckpoint, HumanCheckpointReason } from "@/types/browser";
import { ExternalLink, CheckCircle } from "lucide-react";

const reasonLabels: Record<HumanCheckpointReason, string> = {
  captcha: "验证码",
  mfa: "MFA 验证",
  manual_upload: "人工上传",
  manual_confirm: "人工确认",
  page_exception: "页面异常",
  business_check: "业务确认",
};

type HumanConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  checkpointId: string;
  onConfirmed?: () => void;
};

export function HumanConfirmDialog({
  open,
  onOpenChange,
  taskId,
  checkpointId,
  onConfirmed,
}: HumanConfirmDialogProps) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const result = await mockApi.confirmHumanTaskMock({ taskId, checkpointId, note });
      toast.success("已确认完成", { description: `任务状态: ${result.status}` });
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
          <DialogTitle>确认已完成</DialogTitle>
          <DialogDescription>
            请确认您已在浏览器中完成所需操作。确认后任务将标记为人工完成，不会继续自动执行。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label>确认备注（可选）</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：已完成验证码并提交装箱单"
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

type HumanCheckpointPanelProps = {
  taskId: string;
  status: string;
  onUpdate?: () => void;
};

export function HumanCheckpointPanel({ taskId, status, onUpdate }: HumanCheckpointPanelProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [opening, setOpening] = useState(false);

  const { data: checkpoint } = useQuery({
    queryKey: ["human-checkpoint", taskId],
    queryFn: () => mockApi.getHumanCheckpointByTaskId(taskId),
    enabled: !!taskId,
  });

  if (!checkpoint) return null;
  if (!["WAITING_HUMAN", "HUMAN_OPERATING", "SUCCESS_MANUAL"].includes(status)) return null;

  const handleOpen = async () => {
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

  return (
    <>
      <Card className="border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-sm">人工处理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">原因</dt>
              <dd>{reasonLabels[checkpoint.reason]}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground mb-1">操作说明</dt>
              <dd>{checkpoint.instruction}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">目标页面</dt>
              <dd className="font-mono text-xs truncate max-w-[300px]">{checkpoint.targetUrl}</dd>
            </div>
            {checkpoint.confirmedAt && (
              <>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">确认人</dt>
                  <dd>{checkpoint.confirmedBy ?? "-"}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">确认时间</dt>
                  <dd>{checkpoint.confirmedAt}</dd>
                </div>
                {checkpoint.note && (
                  <div>
                    <dt className="text-muted-foreground mb-1">确认备注</dt>
                    <dd>{checkpoint.note}</dd>
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
        checkpointId={checkpoint.id}
        onConfirmed={onUpdate}
      />
    </>
  );
}

export function getReasonLabel(reason: HumanCheckpointReason): string {
  return reasonLabels[reason];
}
