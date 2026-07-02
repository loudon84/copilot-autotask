import { useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppHeader } from "./app-header";
import { getPageTitle } from "./data/sidebar-data";
import { GlobalSearch } from "./global-search";
import { WorkerStatusBadge } from "@/components/business/worker-status-card";
import ToggleTheme from "@/components/toggle-theme";
import { mockApi } from "@/services/mock-api";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = useLocation({ select: (l) => l.pathname });
  const title = getPageTitle(pathname);

  const { data: workers = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: mockApi.getWorkers,
  });

  return (
    <div className="flex h-full flex-col">
      <AppHeader title={title}>
        <GlobalSearch />
        <WorkerStatusBadge workers={workers} />
        <ToggleTheme />
      </AppHeader>
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}
