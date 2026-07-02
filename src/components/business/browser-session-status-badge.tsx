import type { BrowserSessionStatus } from "@/types/browser";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/tailwind";

const sessionStatusConfig: Record<BrowserSessionStatus, { label: string; className: string }> = {
  STARTING: { label: "启动中", className: "bg-blue-500/15 text-blue-700 dark:text-blue-300" },
  OPENED: { label: "已打开", className: "bg-green-500/15 text-green-700 dark:text-green-300" },
  ATTACHED: { label: "已接管", className: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  LOCKED: { label: "已锁定", className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300" },
  CLOSED: { label: "已关闭", className: "bg-muted text-muted-foreground" },
  ERROR: { label: "异常", className: "bg-red-500/15 text-red-700 dark:text-red-300" },
};

export function BrowserSessionStatusBadge({ status }: { status: BrowserSessionStatus }) {
  const config = sessionStatusConfig[status];
  return (
    <Badge variant="outline" className={cn("border-0 font-normal", config.className)}>
      {config.label}
    </Badge>
  );
}
