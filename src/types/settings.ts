export interface AppSettings {
  defaultBrowserType: "chromium" | "firefox" | "webkit";
  defaultRunMode: "headed" | "headless";
  saveScreenshots: boolean;
  enableTrace: boolean;
  artifactPath: string;
  logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
  themeMode: "light" | "dark" | "system";
  mockDelayMs: number;
}
