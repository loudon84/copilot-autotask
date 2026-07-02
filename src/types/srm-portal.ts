export interface SRMPortal {
  id: string;
  customerName: string;
  name: string;
  url: string;
  loginType: "username_password" | "sso" | "manual";
  browserType: "chromium" | "firefox" | "webkit";
  runMode: "headed" | "headless";
  status: "enabled" | "disabled";
  locatorProfile: Record<string, string>;
  fieldMapping?: Record<string, string>;
  mfaPolicy?: string;
  loginPageUrl?: string;
  createdAt: string;
  updatedAt: string;
}
