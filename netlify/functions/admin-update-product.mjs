import { requireOwner } from "./_lib/auth.mjs";
import { stripe, jsonHeaders, formatProduct } from "./_lib/stripe.mjs";

const badRequest = (message) =>
  new Response(JSON.stringify({ error: message }), { status: 400, headers: jsonHeaders });

const parseBody = async (req) => {
  try {
    return await req.json();
  } catch {
    throw badRequest("Invalid JSON body");
  }
};

const sanitizeImages = (images) => {
  if (!Array.isArray(images)) throw badRequest("images must be an array");
  const cleaned = images
    .map((url) => String(url).trim())
    .filter(Boolean);
  cleaned.forEach((url) => {
    try {
      new URL(url);
    } catch {
      throw badRequest(`Invalid image URL: ${url}`);
    }
  });
  return cleaned;
};

const sanitizeMetadata = (metadata) => {
  if (metadata == null || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw badRequest("metadata must be an object");
  }
  return Object.entries(metadata).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: value == null ? "" : String(value) }),
    {}
  );
};

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(null, { status: 405, headers: jsonHeaders });
  }

  const owner = requireOwner(context);
  if (owner instanceof Response) return owner;

  let body;
  try {
    body = await parseBody(req);
  } catch (err) {
    return err;
  }

  const { productId, name, images, descriptionJson, metadata } = body || {};
  if (!productId) return badRequest("productId is required");

  const updatePayload = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) return badRequest("name must be a non-empty string");
    updatePayload.name = name.trim();
  }

  if (images !== undefined) {
    updatePayload.images = sanitizeImages(images);
  }

  if (descriptionJson !== undefined) {
    if (descriptionJson == null || typeof descriptionJson !== "object" || Array.isArray(descriptionJson)) {
      return badRequest("descriptionJson must be an object");
    }
    updatePayload.description = JSON.stringify(descriptionJson);
  }

  if (metadata !== undefined) {
    updatePayload.metadata = sanitizeMetadata(metadata);
  }

  if (!Object.keys(updatePayload).length) {
    return badRequest("No updatable fields provided");
  }

  try {
    await stripe.products.update(productId, updatePayload);
    const product = await stripe.products.retrieve(productId, { expand: ["default_price"] });
    const prices = await stripe.prices.list({ product: productId, limit: 20 });

    return new Response(JSON.stringify({ product: formatProduct(product, prices.data) }), {
      headers: jsonHeaders,
    });
  } catch (err) {
    console.error("admin-update-product", err);
    return new Response(JSON.stringify({ error: "Failed to update product" }), {
      status: err.statusCode || 500,
      headers: jsonHeaders,
    });
  }
};

