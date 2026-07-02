import { useState } from "react";
import type { RunLog, LogLevel } from "@/types/task-run";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tailwind";

const levelColors: Record<LogLevel, string> = {
  INFO: "text-blue-600 dark:text-blue-400",
  WARN: "text-yellow-600 dark:text-yellow-400",
  ERROR: "text-red-600 dark:text-red-400",
  DEBUG: "text-muted-foreground",
};

const allLevels: LogLevel[] = ["INFO", "WARN", "ERROR", "DEBUG"];

export function RunLogPanel({ logs }: { logs: RunLog[] }) {
  const [filter, setFilter] = useState<LogLevel | "ALL">("ALL");
  const filtered =
    filter === "ALL" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="flex h-full flex-col rounded-lg border bg-muted/30 font-mono text-xs">
      <div className="flex items-center gap-1 border-b p-2">
        <span className="text-muted-foreground mr-2">日志级别:</span>
        <Button
          variant={filter === "ALL" ? "secondary" : "ghost"}
          size="sm"
          className="h-6 text-xs"
          onClick={() => setFilter("ALL")}
        >
          全部
        </Button>
        {allLevels.map((level) => (
          <Button
            key={level}
            variant={filter === level ? "secondary" : "ghost"}
            size="sm"
            className="h-6 text-xs"
            onClick={() => setFilter(level)}
          >
            {level}
          </Button>
        ))}
      </div>
      <ScrollArea className="flex-1 h-[300px] p-2">
        {filtered.map((log) => (
          <div key={log.id} className="flex gap-2 py-0.5">
            <span className="text-muted-foreground shrink-0">{log.timestamp}</span>
            <Badge variant="outline" className={cn("h-4 text-[10px] px-1", levelColors[log.level])}>
              {log.level}
            </Badge>
            <span>{log.message}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-muted-foreground text-center py-4">无日志</p>
        )}
      </ScrollArea>
    </div>
  );
}
