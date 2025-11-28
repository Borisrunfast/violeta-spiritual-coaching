// src/api/products.js
import { apiFetch } from "./client";

export function getProducts(params = {}) {
  const q = new URLSearchParams();
  if (params.limit) q.set("limit", String(params.limit));
  if (params.active !== undefined) q.set("active", String(params.active));
  const qs = q.toString();
  return apiFetch(`/get-products${qs ? `?${qs}` : ""}`); // -> { data: [...] }
}

export function getProductById(id) {
  return apiFetch(`/get-product?id=${encodeURIComponent(id)}`); // -> product object
}
