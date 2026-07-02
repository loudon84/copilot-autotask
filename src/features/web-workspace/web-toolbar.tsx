import { Button } from "@/components/ui/button";
import { WebAddressInput } from "./web-address-input";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  X,
} from "lucide-react";
import type { WebTab } from "@/types/web-tab";

type WebToolbarProps = {
  activeTab: WebTab | null;
  addressValue: string;
  onAddressChange: (value: string) => void;
  onNavigate: (url: string) => void;
  onBack: () => void;
  onForward: () => void;
  onReload: () => void;
  onOpenExternal: () => void;
  onClose: () => void;
};

export function WebToolbar({
  activeTab,
  addressValue,
  onAddressChange,
  onNavigate,
  onBack,
  onForward,
  onReload,
  onOpenExternal,
  onClose,
}: WebToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b px-2 py-1.5">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onBack}
        disabled={!activeTab?.canGoBack}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onForward}
        disabled={!activeTab?.canGoForward}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onReload}
        disabled={!activeTab}
      >
        <RefreshCw className="h-4 w-4" />
      </Button>

      <WebAddressInput
        value={addressValue}
        onChange={onAddressChange}
        onNavigate={onNavigate}
        disabled={!activeTab}
      />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onOpenExternal}
        disabled={!activeTab}
      >
        <ExternalLink className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onClose}
        disabled={!activeTab}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
