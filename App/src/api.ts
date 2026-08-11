import * as SecureStore from "expo-secure-store";

// The deployed Render API — never localhost in production builds.
export const API_BASE_URL = "https://fiti-fy.onrender.com/api";

const TOKEN_KEY = "fitify_session_token";

export const getToken = (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY);
export const setToken = (token: string): Promise<void> => SecureStore.setItemAsync(TOKEN_KEY, token);
export const clearToken = (): Promise<void> => SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

export async function apiFetch<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/${path.replace(/^\//, "")}`, { ...options, headers });
  } catch {
    throw new ApiError(0, "Network error. Check your connection and try again.");
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore non-JSON responses
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || `Request failed (${res.status})`);
  }
  if (!data || data.success === false) {
    throw new ApiError(res.status, data?.error || "Unexpected server response");
  }
  return data as T;
}
