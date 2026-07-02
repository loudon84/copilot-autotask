import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { openProfileFolder } from "@/actions/browser";
import { mockApi } from "@/services/mock-api";
import type { SRMPortal } from "@/types/srm-portal";
import {
  ExternalLink,
  FolderOpen,
  MoreHorizontal,
  RotateCcw,
  TestTube,
  Eye,
} from "lucide-react";

type PortalActionsProps = {
  portal: SRMPortal;
  compact?: boolean;
  onUpdate?: () => void;
};

export function PortalActions({ portal, compact, onUpdate }: PortalActionsProps) {
  const queryClient = useQueryClient();
  const [resetOpen, setResetOpen] = useState(false);

  const { data: sessions = [] } = useQuery({
    queryKey: ["browser-sessions"],
    queryFn: mockApi.getBrowserSessions,
  });

  const activeSession = sessions.find(
    (s) => s.portalId === portal.id && (s.status === "OPENED" || s.status === "ATTACHED")
  );
  const disabled = portal.status === "disabled";

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["browser-sessions"] });
    queryClient.invalidateQueries({ queryKey: ["srm-portals"] });
    onUpdate?.();
  };

  const handleOpen = async (testLogin = false) => {
    try {
      const session = await mockApi.openPortalMock({
        portalId: portal.id,
        targetUrl: testLogin ? portal.loginPageUrl ?? portal.url : undefined,
        source: testLogin ? "test_login" : "srm_portal_list",
      });
      toast.success(
        testLogin
          ? `已打开测试登录页面: ${portal.name}`
          : `已快速打开: ${portal.name}`,
        { description: `Session: ${session.id}` }
      );
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "打开失败");
    }
  };

  const handleReset = async () => {
    try {
      await mockApi.resetPortalProfileMock(portal.id);
      toast.success(`已重置 ${portal.name} 的登录态`);
      setResetOpen(false);
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "重置失败");
    }
  };

  const handleOpenFolder = async () => {
    try {
      await openProfileFolder(portal.profilePath);
      toast.success("已打开 Profile 目录");
    } catch {
      toast.info(`Profile 目录: ${portal.profilePath}`);
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
              <ExternalLink className="mr-2 h-4 w-4" />
              {activeSession ? "重新打开" : "快速打开"}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={disabled} onClick={() => handleOpen(true)}>
              <TestTube className="mr-2 h-4 w-4" /> 测试登录
            </DropdownMenuItem>
            {activeSession && (
              <DropdownMenuItem onClick={() => toast.info(`会话: ${activeSession.id}`)}>
                <Eye className="mr-2 h-4 w-4" /> 查看会话
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleOpenFolder}>
              <FolderOpen className="mr-2 h-4 w-4" /> 打开 Profile 目录
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setResetOpen(true)}>
              <RotateCcw className="mr-2 h-4 w-4" /> 重置登录态
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ConfirmDialog
          open={resetOpen}
          onOpenChange={setResetOpen}
          title="重置登录态"
          description={`确定要重置 ${portal.name} 的浏览器 Profile 吗？这将清除已保存的登录态。`}
          confirmLabel="确认重置"
          onConfirm={handleReset}
        />
      </>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => handleOpen(false)}>
        <ExternalLink className="mr-1 h-3 w-3" />
        {activeSession ? "重新打开" : "快速打开"}
      </Button>
      <Button variant="outline" size="sm" disabled={disabled} onClick={() => handleOpen(true)}>
        <TestTube className="mr-1 h-3 w-3" /> 测试登录
      </Button>
      {activeSession && (
        <Button variant="outline" size="sm" onClick={() => toast.info(`会话: ${activeSession.id}`)}>
          <Eye className="mr-1 h-3 w-3" /> 查看会话
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={handleOpenFolder}>
        <FolderOpen className="mr-1 h-3 w-3" /> 打开 Profile
      </Button>
      <Button variant="outline" size="sm" onClick={() => setResetOpen(true)}>
        <RotateCcw className="mr-1 h-3 w-3" /> 重置登录态
      </Button>
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="重置登录态"
        description={`确定要重置 ${portal.name} 的浏览器 Profile 吗？这将清除已保存的登录态。`}
        confirmLabel="确认重置"
        onConfirm={handleReset}
      />
    </div>
  );
}
