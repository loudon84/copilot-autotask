import type { SRMPortal } from "@/types/srm-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

export function SrmPortalCard({ portal }: { portal: SRMPortal }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{portal.name}</CardTitle>
          <Badge variant={portal.status === "enabled" ? "default" : "secondary"}>
            {portal.status === "enabled" ? "启用" : "禁用"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{portal.customerName}</p>
        <p className="flex items-center gap-1 truncate">
          <Globe className="h-3 w-3 shrink-0" />
          {portal.url}
        </p>
        <div className="flex gap-2 text-xs">
          <Badge variant="outline">{portal.loginType}</Badge>
          <Badge variant="outline">{portal.browserType}</Badge>
          <Badge variant="outline">{portal.runMode}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
