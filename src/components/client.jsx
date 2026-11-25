import Constants from "expo-constants";

const PORT = 5000;

function resolveBase() {
  // Dev: Metro runs on this same laptop, so reuse its IP automatically
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  if (host) return `http://${host}:${PORT}/api/v1`;
  return (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
}

const BASE = resolveBase();
let authToken = null;

export const setAuthToken = (t) => {
  authToken = t;
};

async function request(method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json.message || json.error || `Request failed (${res.status})`);
    }

    if (json && typeof json === "object") {
      Object.defineProperty(json, "data", { value: json, enumerable: false });
    }
    return json;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Server timed out. Check that the backend is running.");
    }
    if (/Network request failed|fetch failed|Host unreachable/i.test(err.message)) {
      throw new Error(`Cannot reach server at ${BASE}. Same Wi-Fi? Backend running? Firewall?`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b),
  put: (p, b) => request("PUT", p, b),
  patch: (p, b) => request("PATCH", p, b),
  delete: (p) => request("DELETE", p),
};

export default api;