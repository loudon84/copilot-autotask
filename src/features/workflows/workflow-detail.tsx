import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MockLoading } from "@/components/common/mock-loading";
import { EmptyState } from "@/components/common/empty-state";
import { StepTimeline } from "@/components/business/step-timeline";
import { WorkflowStepCard } from "@/components/business/workflow-step-card";
import { mockApi } from "@/services/mock-api";

function toYaml(workflow: NonNullable<Awaited<ReturnType<typeof mockApi.getWorkflowById>>>): string {
  const lines = [
    `workflow_id: ${workflow.id}`,
    `name: ${workflow.name}`,
    `version: ${workflow.version}`,
    "steps:",
    ...workflow.steps.map((s) => `  - type: ${s.type}`),
  ];
  return lines.join("\n");
}

export function WorkflowDetailPage({ workflowId }: { workflowId: string }) {
  const [tab, setTab] = useState("basic");

  const { data: workflow, isLoading } = useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: () => mockApi.getWorkflowById(workflowId),
  });

  if (isLoading) return <MockLoading />;
  if (!workflow) return <EmptyState title="模板不存在" />;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">{workflow.name}</h2>
        <div className="mt-2 flex gap-2">
          <Badge variant="outline">v{workflow.version}</Badge>
          <Badge variant={workflow.status === "enabled" ? "default" : "secondary"}>
            {workflow.status === "enabled" ? "启用" : workflow.status === "disabled" ? "禁用" : "草稿"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Tabs value={tab} onValueChange={setTab} className="lg:col-span-4" orientation="vertical">
          <div className="flex flex-col gap-4 lg:flex-row">
            <TabsList className="flex h-auto flex-row lg:flex-col lg:w-40">
              <TabsTrigger value="basic">基础信息</TabsTrigger>
              <TabsTrigger value="input">输入参数</TabsTrigger>
              <TabsTrigger value="steps">步骤配置</TabsTrigger>
              <TabsTrigger value="error">错误处理</TabsTrigger>
              <TabsTrigger value="yaml">Mock YAML</TabsTrigger>
              <TabsTrigger value="test">测试运行</TabsTrigger>
            </TabsList>

            <div className="flex-1">
              <TabsContent value="basic">
                <Card>
                  <CardContent className="pt-4 space-y-2 text-sm">
                    <p><span className="text-muted-foreground">编码：</span>{workflow.code}</p>
                    <p><span className="text-muted-foreground">分类：</span>{workflow.category}</p>
                    <p><span className="text-muted-foreground">目标：</span>{workflow.target}</p>
                    <p><span className="text-muted-foreground">描述：</span>{workflow.description}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="input">
                <Card>
                  <CardContent className="pt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2">字段</th>
                          <th className="pb-2">标签</th>
                          <th className="pb-2">类型</th>
                          <th className="pb-2">必填</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workflow.inputSchema.map((f) => (
                          <tr key={f.name} className="border-b">
                            <td className="py-2 font-mono">{f.name}</td>
                            <td className="py-2">{f.label}</td>
                            <td className="py-2">{f.type}</td>
                            <td className="py-2">{f.required ? "是" : "否"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                <StepTimeline steps={workflow.steps} />
                <div className="grid gap-3 sm:grid-cols-2">
                  {workflow.steps.map((step) => (
                    <WorkflowStepCard key={step.id} step={step} />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="error">
                <Card>
                  <CardContent className="pt-4 space-y-3">
                    {workflow.steps.map((step) => (
                      <div key={step.id} className="flex justify-between text-sm border-b pb-2">
                        <span>{step.name}</span>
                        <Badge variant="outline">{step.onError ?? "fail"}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="yaml">
                <Card>
                  <CardHeader><CardTitle className="text-sm font-mono">Mock YAML</CardTitle></CardHeader>
                  <CardContent>
                    <pre className="rounded-md bg-muted p-4 text-xs font-mono overflow-auto">
                      {toYaml(workflow)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="test">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">
                      Mock 测试运行：点击后将模拟执行流程（本阶段不实际运行 RPA）。
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
