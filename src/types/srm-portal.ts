import type { BrowserType } from "@/types/browser";

export type PortalLoginState = "unknown" | "valid" | "expired";

export interface SRMPortal {
  id: string;
  customerName: string;
  name: string;
  url: string;
  loginType: "username_password" | "sso" | "manual";
  browserType: BrowserType;
  runMode: "headed" | "headless";
  status: "enabled" | "disabled";

  profileId: string;
  profilePath: string;
  quickOpenUrl?: string;

  loginState: PortalLoginState;
  lastOpenedAt?: string;
  lastLoginCheckedAt?: string;

  locatorProfile: Record<string, string>;
  fieldMapping?: Record<string, string>;
  mfaPolicy?: string;
  loginPageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
