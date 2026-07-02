import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import { MockLoading } from "@/components/common/mock-loading";
import { mockApi } from "@/services/mock-api";

const categories = [
  "全部",
  "浏览器组件",
  "页面操作组件",
  "表单组件",
  "文件组件",
  "等待/断言组件",
  "证据组件",
  "人工介入组件",
];

export function ComponentsPage() {
  const [category, setCategory] = useState("全部");

  const { data: components = [], isLoading } = useQuery({
    queryKey: ["rpa-components"],
    queryFn: mockApi.getRpaComponents,
  });

  const filtered =
    category === "全部"
      ? components
      : components.filter((c) => c.category === category);

  if (isLoading) return <MockLoading />;

  return (
    <div className="space-y-4">
      <PageHeader title="RPA 组件库" description="平台支持的原子 RPA 组件" />

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex h-auto flex-wrap">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>{cat}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((comp) => (
          <Card key={comp.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-mono">{comp.name}</CardTitle>
                <Badge variant={comp.enabled ? "default" : "secondary"}>
                  {comp.enabled ? "启用" : "禁用"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Badge variant="outline">{comp.category}</Badge>
              <p className="text-muted-foreground">{comp.description}</p>
              <div>
                <p className="text-xs text-muted-foreground">输入参数</p>
                <p className="font-mono text-xs">{comp.inputParams.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">输出</p>
                <p className="font-mono text-xs">{comp.outputResult}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
