import type { WebTab } from "@/types/web-tab";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tailwind";
import { X, Plus } from "lucide-react";

type WebTabBarProps = {
  tabs: WebTab[];
  activeTabId: string | null;
  onActivate: (tabId: string) => void;
  onClose: (tabId: string) => void;
  onNewTab: () => void;
};

export function WebTabBar({
  tabs,
  activeTabId,
  onActivate,
  onClose,
  onNewTab,
}: WebTabBarProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b bg-muted/30 px-2 py-1">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={cn(
            "group flex max-w-[200px] shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs",
            activeTabId === tab.id
              ? "bg-background shadow-sm"
              : "hover:bg-background/60"
          )}
        >
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-1"
            onClick={() => onActivate(tab.id)}
          >
            {tab.favicon ? (
              <img src={tab.favicon} alt="" className="h-3 w-3 shrink-0" />
            ) : (
              <span className="h-3 w-3 shrink-0 rounded-full bg-muted" />
            )}
            <span className="truncate">{tab.title}</span>
            {tab.status === "loading" && (
              <span className="text-muted-foreground">...</span>
            )}
          </button>
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.id);
            }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onNewTab}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
