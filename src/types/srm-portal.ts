import type { ClientOpenMode } from "@/types/web-tab";

export type PortalLoginState = "unknown" | "valid" | "expired";

export interface SRMPortal {
  id: string;
  customerName: string;
  name: string;
  url: string;

  loginType: "username_password" | "sso" | "manual";
  status: "enabled" | "disabled";

  clientOpenMode: ClientOpenMode;
  clientSessionPartition: string;

  serverRpaProfileId?: string;

  loginState: PortalLoginState;
  lastOpenedAt?: string;
  lastLoginCheckedAt?: string;

  locatorProfile: Record<string, string>;
  fieldMapping?: Record<string, string>;
  mfaPolicy?: string;
  loginPageUrl?: string;
  description?: string;
  tags?: string[];

  createdAt: string;
  updatedAt: string;
}
