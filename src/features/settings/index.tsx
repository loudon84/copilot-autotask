import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common/page-header";
import { MockLoading } from "@/components/common/mock-loading";
import { setTheme } from "@/actions/theme";
import { mockApi } from "@/services/mock-api";
import type { AppSettings } from "@/types/settings";
import type { ThemeMode } from "@/types/theme-mode";

export function SettingsPage() {
  const [tab, setTab] = useState("basic");

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: mockApi.getSettings,
  });

  const updateMutation = useMutation({
    mutationFn: mockApi.updateSettings,
    onSuccess: () => toast.success("设置已保存"),
  });

  if (isLoading || !settings) return <MockLoading />;

  const update = (patch: Partial<AppSettings>) => {
    updateMutation.mutate(patch);
  };

  const handleThemeChange = async (theme: ThemeMode) => {
    await setTheme(theme);
    update({ themeMode: theme });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="系统设置" description="本地原型配置" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="basic">基础设置</TabsTrigger>
          <TabsTrigger value="browser">浏览器设置</TabsTrigger>
          <TabsTrigger value="worker">Worker 设置</TabsTrigger>
          <TabsTrigger value="storage">存储设置</TabsTrigger>
          <TabsTrigger value="appearance">外观设置</TabsTrigger>
          <TabsTrigger value="mock">Mock 数据设置</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <SettingsCard title="基础设置">
            <Field label="日志级别">
              <Select value={settings.logLevel} onValueChange={(v) => update({ logLevel: v as AppSettings["logLevel"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["DEBUG", "INFO", "WARN", "ERROR"].map((l) => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="browser">
          <SettingsCard title="浏览器设置">
            <Field label="默认浏览器类型">
              <Select value={settings.defaultBrowserType} onValueChange={(v) => update({ defaultBrowserType: v as AppSettings["defaultBrowserType"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="chromium">Chromium</SelectItem>
                  <SelectItem value="firefox">Firefox</SelectItem>
                  <SelectItem value="webkit">WebKit</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="默认运行模式">
              <Select value={settings.defaultRunMode} onValueChange={(v) => update({ defaultRunMode: v as AppSettings["defaultRunMode"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="headed">有头模式</SelectItem>
                  <SelectItem value="headless">无头模式</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="worker">
          <SettingsCard title="Worker 设置">
            <SwitchField
              label="失败自动重试"
              checked={true}
              onCheckedChange={() => toast.info("Mock 设置，未持久化")}
            />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="storage">
          <SettingsCard title="存储设置">
            <Field label="Artifact 本地路径">
              <Input
                value={settings.artifactPath}
                onChange={(e) => update({ artifactPath: e.target.value })}
              />
            </Field>
            <SwitchField
              label="保存截图"
              checked={settings.saveScreenshots}
              onCheckedChange={(v) => update({ saveScreenshots: v })}
            />
            <SwitchField
              label="开启 Trace"
              checked={settings.enableTrace}
              onCheckedChange={(v) => update({ enableTrace: v })}
            />
          </SettingsCard>
        </TabsContent>

        <TabsContent value="appearance">
          <SettingsCard title="外观设置">
            <Field label="主题模式">
              <Select value={settings.themeMode} onValueChange={(v) => handleThemeChange(v as ThemeMode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">浅色</SelectItem>
                  <SelectItem value="dark">深色</SelectItem>
                  <SelectItem value="system">跟随系统</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </SettingsCard>
        </TabsContent>

        <TabsContent value="mock">
          <SettingsCard title="Mock 数据设置">
            <Field label="Mock 延迟时间 (ms)">
              <Input
                type="number"
                value={settings.mockDelayMs}
                onChange={(e) => update({ mockDelayMs: Number(e.target.value) })}
              />
            </Field>
            <p className="text-xs text-muted-foreground">
              模拟 API 请求延迟，用于测试 loading 状态。
            </p>
          </SettingsCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SwitchField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
