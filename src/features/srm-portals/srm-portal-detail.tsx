import { useState } from "react";
import { LoginStateBadge } from "@/components/business/login-state-badge";
import { PortalActions } from "@/components/business/portal-actions";
import { EmptyState } from "@/components/common/empty-state";
import { MockLoading } from "@/components/common/mock-loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortalAccount } from "@/features/srm-portals/api/use-portal-accounts";

const openModeLabels = {
  webcontents: "内置 Web 工作区",
  system_browser: "系统浏览器",
} as const;

export function SrmPortalDetailPage({ portalId }: { portalId: string }) {
  const [tab, setTab] = useState("basic");

  const { data: portal, isLoading } = usePortalAccount(portalId);

  if (isLoading) {
    return <MockLoading />;
  }
  if (!portal) {
    return <EmptyState title="门户不存在" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-2xl">{portal.name}</h2>
          <p className="text-muted-foreground">{portal.customerName}</p>
        </div>
        <PortalActions portal={portal} />
      </div>

      <Tabs onValueChange={setTab} value={tab}>
        <TabsList>
          <TabsTrigger value="basic">基础信息</TabsTrigger>
          <TabsTrigger value="login">登录配置</TabsTrigger>
          <TabsTrigger value="locators">页面定位器</TabsTrigger>
          <TabsTrigger value="mapping">字段映射</TabsTrigger>
          <TabsTrigger value="session">Session 配置</TabsTrigger>
          <TabsTrigger value="test">测试记录</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
              <Field label="客户名称" value={portal.customerName} />
              <Field label="门户名称" value={portal.name} />
              <Field label="门户 URL" value={portal.url} />
              <Field label="登录方式" value={portal.loginType} />
              <Field
                label="客户端打开方式"
                value={openModeLabels[portal.clientOpenMode]}
              />
              <Field
                label="Session 分区"
                value={portal.clientSessionPartition}
              />
              <Field
                label="服务器 RPA Profile"
                value={portal.serverRpaProfileId ?? "-"}
              />
              <div>
                <Label className="text-muted-foreground">状态</Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      portal.status === "enabled" ? "default" : "secondary"
                    }
                  >
                    {portal.status === "enabled" ? "启用" : "禁用"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
              <Field
                label="登录页 URL"
                value={portal.loginPageUrl ?? portal.url}
              />
              <Field label="账号占位符" value="srm_user@customer.com" />
              <Field label="密码占位符" value="********" />
              <Field label="MFA 策略" value={portal.mfaPolicy ?? "none"} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locators">
          <Card>
            <CardContent className="space-y-3 pt-4">
              {Object.entries(portal.locatorProfile).map(([key, value]) => (
                <div className="grid gap-1 text-sm sm:grid-cols-2" key={key}>
                  <span className="font-mono text-muted-foreground">{key}</span>
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {value}
                  </code>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping">
          <Card>
            <CardContent className="space-y-3 pt-4">
              {portal.fieldMapping ? (
                Object.entries(portal.fieldMapping).map(([key, value]) => (
                  <div className="grid gap-1 text-sm sm:grid-cols-2" key={key}>
                    <span className="text-muted-foreground">{key}</span>
                    <span className="font-mono">{value}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">暂无字段映射</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="session">
          <Card>
            <CardContent className="grid gap-4 pt-4 sm:grid-cols-2">
              <Field
                label="Session 分区"
                value={portal.clientSessionPartition}
              />
              <Field
                label="客户端打开方式"
                value={openModeLabels[portal.clientOpenMode]}
              />
              <Field
                label="服务器 RPA Profile"
                value={portal.serverRpaProfileId ?? "-"}
              />
              <Field label="最近打开时间" value={portal.lastOpenedAt ?? "-"} />
              <div>
                <Label className="text-muted-foreground">登录态</Label>
                <div className="mt-1">
                  <LoginStateBadge state={portal.loginState} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-sm">
                Mock 测试记录：点击【测试打开】可在 Web
                工作区中打开登录页进行验证。
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground">{label}</Label>
      <Input className="bg-muted/50" readOnly value={value} />
    </div>
  );
}
