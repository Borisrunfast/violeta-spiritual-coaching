import { apiFetch } from "./client";

const requireToken = (token) => {
  if (!token) throw new Error("Admin token missing");
};

const withAuthHeaders = (token, headers = {}) => ({
  ...headers,
  Authorization: `Bearer ${token}`,
});

export function listProducts(params = {}, { token } = {}) {
  requireToken(token);
  const search = new URLSearchParams();
  if (params.limit) search.set("limit", String(params.limit));
  if (params.includePrices === false) search.set("includePrices", "false");
  const qs = search.toString();
  return apiFetch(`/admin-list-products${qs ? `?${qs}` : ""}`, {
    headers: withAuthHeaders(token),
  });
}

export function updateProduct(payload, { token } = {}) {
  requireToken(token);
  return apiFetch("/admin-update-product", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: withAuthHeaders(token),
  });
}

export function createPrice(payload, { token } = {}) {
  requireToken(token);
  return apiFetch("/admin-create-price", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: withAuthHeaders(token),
  });
}

export function setDefaultPrice(payload, { token } = {}) {
  requireToken(token);
  return apiFetch("/admin-set-default-price", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: withAuthHeaders(token),
  });
}

