import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { MockLoading } from "@/components/common/mock-loading";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePortalAccounts } from "@/features/srm-portals/api/use-portal-accounts";
import { useCreateTask } from "@/features/tasks/api/use-task-mutations";
import { useWorkflowTemplates } from "@/features/workflows/api/use-workflow-templates";
import type { TaskPriority } from "@/types/automation-task";

export function TaskNewPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [portalId, setPortalId] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [owner, setOwner] = useState("操作员");
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [confirmBeforeRun, setConfirmBeforeRun] = useState(true);
  const [saveScreenshots, setSaveScreenshots] = useState(true);
  const [enableTrace, setEnableTrace] = useState(false);
  const [autoRetry, setAutoRetry] = useState(true);

  const { data: portals = [], isLoading: portalsLoading } = usePortalAccounts();
  const { data: workflows = [], isLoading: workflowsLoading } =
    useWorkflowTemplates();

  const selectedWorkflow = workflows.find((w) => w.id === workflowId);
  const selectedPortal = portals.find((p) => p.id === portalId);

  const createMutation = useCreateTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!(title && workflowId && portalId)) {
      toast.error("请填写必填字段");
      return;
    }
    createMutation.mutate(
      {
        title,
        taskType: selectedWorkflow?.code ?? "custom",
        customerName: selectedPortal?.customerName ?? "",
        srmPortalName: selectedPortal?.name ?? "",
        workflowTemplateId: workflowId,
        workflowTemplateName: selectedWorkflow?.name ?? "",
        status: "READY",
        priority,
        owner,
        input: inputValues,
        progress: 0,
      },
      {
        onSuccess: (task) => {
          toast.success("任务已创建");
          navigate({ to: "/tasks/$taskId", params: { taskId: task.id } });
        },
      }
    );
  };

  if (portalsLoading || workflowsLoading) {
    return <MockLoading />;
  }

  return (
    <form className="mx-auto max-w-2xl space-y-6" onSubmit={handleSubmit}>
      <PageHeader description="创建自动化任务" title="新建任务" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">基础信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">任务名称 *</Label>
            <Input
              id="title"
              onChange={(e) => setTitle(e.target.value)}
              required
              value={title}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>优先级</Label>
              <Select
                onValueChange={(v) => setPriority(v as TaskPriority)}
                value={priority}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">低</SelectItem>
                  <SelectItem value="normal">普通</SelectItem>
                  <SelectItem value="high">高</SelectItem>
                  <SelectItem value="urgent">紧急</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">负责人</Label>
              <Input
                id="owner"
                onChange={(e) => setOwner(e.target.value)}
                value={owner}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SRM 与流程模板</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>SRM 门户 *</Label>
            <Select onValueChange={setPortalId} value={portalId}>
              <SelectTrigger>
                <SelectValue placeholder="选择 SRM 门户" />
              </SelectTrigger>
              <SelectContent>
                {portals
                  .filter((p) => p.status === "enabled")
                  .map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>流程模板 *</Label>
            <Select
              onValueChange={(v) => {
                setWorkflowId(v);
                setInputValues({});
              }}
              value={workflowId}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择流程模板" />
              </SelectTrigger>
              <SelectContent>
                {workflows
                  .filter((w) => w.status === "enabled")
                  .map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedWorkflow && selectedWorkflow.inputSchema.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">输入参数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedWorkflow.inputSchema.map((field) => (
              <div className="space-y-2" key={field.name}>
                <Label htmlFor={field.name}>
                  {field.label} {field.required && "*"}
                </Label>
                <Input
                  id={field.name}
                  onChange={(e) =>
                    setInputValues((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  required={field.required}
                  value={inputValues[field.name] ?? ""}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">执行选项</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={confirmBeforeRun}
              onCheckedChange={(v) => setConfirmBeforeRun(!!v)}
            />
            执行前确认
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={saveScreenshots}
              onCheckedChange={(v) => setSaveScreenshots(!!v)}
            />
            保存每步截图
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={enableTrace}
              onCheckedChange={(v) => setEnableTrace(!!v)}
            />
            开启 Trace
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={autoRetry}
              onCheckedChange={(v) => setAutoRetry(!!v)}
            />
            失败自动重试
          </label>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button disabled={createMutation.isPending} type="submit">
          保存任务
        </Button>
        <Button
          onClick={() => navigate({ to: "/tasks" })}
          type="button"
          variant="outline"
        >
          取消
        </Button>
      </div>
    </form>
  );
}
