const AUTH_KEY = "pulserate_auth";

export interface AuthData {
  authenticated: boolean;
  adminId?: string;
  orgId?: string;
  timestamp: number;
}

export function getAuth(): AuthData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (data && data.authenticated) return data as AuthData;
  } catch {
    return null;
  }
  return null;
}

export function setAuth(adminId: string, orgId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      authenticated: true,
      adminId,
      orgId,
      timestamp: Date.now(),
    })
  );
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

