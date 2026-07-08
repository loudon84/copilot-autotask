const LAST_LOGIN_EMAIL_KEY = "autotask:last-login-email";

export function getLastLoginEmail(): string {
  try {
    return localStorage.getItem(LAST_LOGIN_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

export function saveLastLoginEmail(email: string): void {
  try {
    localStorage.setItem(LAST_LOGIN_EMAIL_KEY, email);
  } catch {
    // ignore
  }
}
