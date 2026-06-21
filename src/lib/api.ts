const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5002/api";

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function getUser(): any | null {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

export function setUser(user: any) {
  localStorage.setItem("user", JSON.stringify(user));
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

// WebSocket connection broker for chat
export function connectChatSocket(onMessage: (msg: any) => void): { close: () => void } | null {
  const token = getToken();
  if (!token) return null;

  const wsUrl = (import.meta as any).env.VITE_WS_BASE_URL || "ws://localhost:5002";
  const ws = new WebSocket(`${wsUrl}?token=${encodeURIComponent(token)}`);

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "NEW_MESSAGE") {
        onMessage(data.payload);
      }
    } catch (err) {
      console.error("Failed to parse socket message:", err);
    }
  };

  ws.onerror = (err) => {
    console.error("Chat WebSocket error:", err);
  };

  return {
    close: () => ws.close(),
  };
}
