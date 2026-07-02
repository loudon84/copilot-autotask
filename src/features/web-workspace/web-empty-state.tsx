import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

type WebEmptyStateProps = {
  onOpenUrl?: () => void;
};

export function WebEmptyState({ onOpenUrl }: WebEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
      <Globe className="h-12 w-12 opacity-40" />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Web 工作区</p>
        <p className="mt-1 text-xs">打开客户 SRM、人工处理页面或输入网址开始浏览</p>
      </div>
      {onOpenUrl && (
        <Button variant="outline" size="sm" onClick={onOpenUrl}>
          输入网址
        </Button>
      )}
    </div>
  );
}
