import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrowserSessionStatusBadge } from "@/components/business/browser-session-status-badge";
import { mockApi } from "@/services/mock-api";

type BrowserSessionPanelProps = {
  taskId?: string;
  portalId?: string;
};

export function BrowserSessionPanel({ taskId, portalId }: BrowserSessionPanelProps) {
  const { data: sessions = [] } = useQuery({
    queryKey: ["browser-sessions"],
    queryFn: mockApi.getBrowserSessions,
  });

  const session = sessions.find((s) => {
    if (taskId && s.taskId === taskId) return true;
    if (portalId && s.portalId === portalId) return s.status === "OPENED" || s.status === "ATTACHED";
    return false;
  });

  if (!session) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">浏览器会话</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Session ID</dt>
            <dd className="font-mono text-xs">{session.id}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">状态</dt>
            <dd><BrowserSessionStatusBadge status={session.status} /></dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Profile</dt>
            <dd className="font-mono text-xs truncate max-w-[250px]">{session.profilePath}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">目标页面</dt>
            <dd className="font-mono text-xs truncate max-w-[250px]">{session.targetUrl}</dd>
          </div>
          {session.cdpEndpoint && (
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">CDP Endpoint</dt>
              <dd className="font-mono text-xs">{session.cdpEndpoint}</dd>
            </div>
          )}
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">打开时间</dt>
            <dd>{session.startedAt}</dd>
          </div>
          {session.lastActiveAt && (
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">最近活跃</dt>
              <dd>{session.lastActiveAt}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
}
