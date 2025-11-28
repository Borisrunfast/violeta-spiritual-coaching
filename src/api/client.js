// Prefer /api if you add a redirect later; fall back to Netlify’s native path
const API_BASE = import.meta.env.VITE_API_BASE || "/.netlify/functions";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let payload;
  if (isJson) {
    payload = await res.json();
  } else {
    const text = await res.text();
    throw new Error(
      `API ${res.status}: Expected JSON but received ${contentType || "unknown"}${
        text ? ` - ${text.slice(0, 120)}` : ""
      }`
    );
  }

  if (!res.ok) {
    const msg = (payload && payload.error) || res.statusText;
    throw new Error(`API ${res.status}: ${msg}`);
  }

  return payload;
}

export { apiFetch, API_BASE };
