import fs from "node:fs";
import path from "node:path";
import { app, safeStorage } from "electron";
import type { StoredAuthSession } from "./nodeskclaw-auth-response";

const KEYTAR_SERVICE = "autotask-studio";
const KEYTAR_ACCOUNT = "auth-session";
const FALLBACK_FILE = "auth-session.enc";

let memorySession: StoredAuthSession | null = null;
let keytarAvailable: boolean | null = null;

async function isKeytarAvailable(): Promise<boolean> {
  if (keytarAvailable !== null) {
    return keytarAvailable;
  }
  try {
    await import("keytar");
    keytarAvailable = true;
  } catch {
    keytarAvailable = false;
  }
  return keytarAvailable;
}

function getFallbackPath(): string {
  return path.join(app.getPath("userData"), FALLBACK_FILE);
}

async function loadFromKeytar(): Promise<StoredAuthSession | null> {
  if (!(await isKeytarAvailable())) {
    return null;
  }
  try {
    const keytar = await import("keytar");
    const raw = await keytar.getPassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredAuthSession;
  } catch {
    return null;
  }
}

async function saveToKeytar(session: StoredAuthSession): Promise<boolean> {
  if (!(await isKeytarAvailable())) {
    return false;
  }
  try {
    const keytar = await import("keytar");
    await keytar.setPassword(
      KEYTAR_SERVICE,
      KEYTAR_ACCOUNT,
      JSON.stringify(session)
    );
    return true;
  } catch {
    return false;
  }
}

async function deleteFromKeytar(): Promise<void> {
  if (!(await isKeytarAvailable())) {
    return;
  }
  try {
    const keytar = await import("keytar");
    await keytar.deletePassword(KEYTAR_SERVICE, KEYTAR_ACCOUNT);
  } catch {
    // ignore
  }
}

function loadFromSafeStorage(): StoredAuthSession | null {
  try {
    const filePath = getFallbackPath();
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const encrypted = fs.readFileSync(filePath);
    if (!safeStorage.isEncryptionAvailable()) {
      return null;
    }
    const decrypted = safeStorage.decryptString(encrypted);
    return JSON.parse(decrypted) as StoredAuthSession;
  } catch {
    return null;
  }
}

function saveToSafeStorage(session: StoredAuthSession): boolean {
  try {
    if (!safeStorage.isEncryptionAvailable()) {
      return false;
    }
    const encrypted = safeStorage.encryptString(JSON.stringify(session));
    const filePath = getFallbackPath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, encrypted);
    return true;
  } catch {
    return false;
  }
}

function deleteFallbackFile(): void {
  try {
    const filePath = getFallbackPath();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore
  }
}

export async function loadSession(): Promise<StoredAuthSession | null> {
  if (memorySession) {
    return memorySession;
  }

  const fromKeytar = await loadFromKeytar();
  if (fromKeytar) {
    memorySession = fromKeytar;
    return fromKeytar;
  }

  const fromSafe = loadFromSafeStorage();
  if (fromSafe) {
    memorySession = fromSafe;
    return fromSafe;
  }

  return null;
}

export async function saveSession(session: StoredAuthSession): Promise<void> {
  memorySession = session;
  const savedKeytar = await saveToKeytar(session);
  if (!savedKeytar) {
    saveToSafeStorage(session);
  }
}

export async function clearSession(): Promise<void> {
  memorySession = null;
  await deleteFromKeytar();
  deleteFallbackFile();
}

export function getMemorySession(): StoredAuthSession | null {
  return memorySession;
}

export function setMemorySession(session: StoredAuthSession | null): void {
  memorySession = session;
}
