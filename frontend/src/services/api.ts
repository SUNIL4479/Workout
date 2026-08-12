const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://fiti-fy.onrender.com/api").replace(/\/$/, "");

export const apiUrl = (path: string): string =>
  `${API_BASE_URL}/${path.replace(/^\//, "")}`;

export const apiFetch = (path: string, init?: RequestInit): Promise<Response> =>
  fetch(apiUrl(path), {
    credentials: "include",
    ...init,
  });