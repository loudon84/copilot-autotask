import z from "zod";

export const openPortalInputSchema = z.object({
  portalId: z.string(),
  profilePath: z.string(),
  targetUrl: z.string(),
  browserType: z.enum(["chrome", "edge", "chromium"]).default("chrome"),
  executablePath: z.string().optional(),
});

export const openHumanTaskInputSchema = z.object({
  taskId: z.string(),
  profilePath: z.string(),
  targetUrl: z.string(),
  browserType: z.enum(["chrome", "edge", "chromium"]).default("chrome"),
  executablePath: z.string().optional(),
});

export const sessionIdInputSchema = z.object({
  sessionId: z.string(),
});

export const openProfileFolderInputSchema = z.object({
  profilePath: z.string(),
});

export const resetPortalProfileInputSchema = z.object({
  profilePath: z.string(),
});
