import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  clearPortalSession,
  openExternal,
  openPortal,
} from "@/actions/web-workspace";
import type { SRMPortal } from "@/types/srm-portal";
import {
  ExternalLink,
  Globe,
  MoreHorizontal,
  RotateCcw,
  TestTube,
} from "lucide-react";

type PortalActionsProps = {
  portal: SRMPortal;
  compact?: boolean;
  onUpdate?: () => void;
};

export function PortalActions({ portal, compact, onUpdate }: PortalActionsProps) {
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const disabled = portal.status === "disabled";

  const handleOpen = async (testLogin = false) => {
    try {
      const targetUrl = testLogin ? portal.loginPageUrl ?? portal.url : portal.url;
      if (portal.clientOpenMode === "system_browser") {
        await openExternal(targetUrl);
        toast.success(`已在外部浏览器打开: ${portal.name}`);
        return;
      }

      const tab = await openPortal({
        portalId: portal.id,
        url: targetUrl,
        title: portal.name,
        sessionPartition: portal.clientSessionPartition,
        openMode: portal.clientOpenMode,
      });

      toast.success(
        testLogin ? `已打开测试登录: ${portal.name}` : `已快速打开: ${portal.name}`,
        { description: `Tab: ${tab.id}` }
      );
      navigate({ to: "/web-workspace" });
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "打开失败");
    }
  };

  const handleReset = async () => {
    try {
      await clearPortalSession(portal.clientSessionPartition);
      toast.success(`已重置 ${portal.name} 的本地登录态`);
      setResetOpen(false);
      onUpdate?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "重置失败");
    }
  };

  const handleOpenExternal = async () => {
    try {
      await openExternal(portal.url);
      toast.success("已在外部浏览器打开");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "打开失败");
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
            <DropdownMenuItem disabled={disabled} onClick={() => handleOpen(false)}>
              <Globe className="mr-2 h-4 w-4" />
              快速打开
            </DropdownMenuItem>
            <DropdownMenuItem disabled={disabled} onClick={() => handleOpen(true)}>
              <TestTube className="mr-2 h-4 w-4" /> 测试打开
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleOpenExternal}>
              <ExternalLink className="mr-2 h-4 w-4" /> 外部浏览器打开
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setResetOpen(true)}>
              <RotateCcw className="mr-2 h-4 w-4" /> 重置本地登录态
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ConfirmDialog
          open={resetOpen}
          onOpenChange={setResetOpen}
          title="重置登录态"
          description={`确定要重置 ${portal.name} 的本地 Session 吗？这将清除已保存的 cookie 和缓存。`}
          confirmLabel="确认重置"
          onConfirm={handleReset}
        />
      </>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => handleOpen(false)}>
        <Globe className="mr-1 h-3 w-3" />
        快速打开
      </Button>
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => handleOpen(true)}>
        <TestTube className="mr-1 h-3 w-3" /> 测试打开
      </Button>
      <Button variant="outline" size="sm" onClick={handleOpenExternal}>
        <ExternalLink className="mr-1 h-3 w-3" /> 外部浏览器打开
      </Button>
      <Button variant="outline" size="sm" onClick={() => setResetOpen(true)}>
        <RotateCcw className="mr-1 h-3 w-3" /> 重置登录态
      </Button>
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="重置登录态"
        description={`确定要重置 ${portal.name} 的本地 Session 吗？这将清除已保存的 cookie 和缓存。`}
        confirmLabel="确认重置"
        onConfirm={handleReset}
      />
    </div>
  );
}
