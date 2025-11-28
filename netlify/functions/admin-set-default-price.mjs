import { requireOwner } from "./_lib/auth.mjs";
import { stripe, jsonHeaders, formatProduct } from "./_lib/stripe.mjs";

const badRequest = (message) =>
  new Response(JSON.stringify({ error: message }), { status: 400, headers: jsonHeaders });

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response(null, { status: 405, headers: jsonHeaders });
  }

  const owner = requireOwner(context);
  if (owner instanceof Response) return owner;

  let body;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const { productId, priceId } = body || {};
  if (!productId || !priceId) {
    return badRequest("productId and priceId are required");
  }

  try {
    await stripe.products.update(productId, { default_price: priceId });
    const product = await stripe.products.retrieve(productId, { expand: ["default_price"] });
    const prices = await stripe.prices.list({ product: productId, limit: 20 });

    return new Response(JSON.stringify({ product: formatProduct(product, prices.data) }), {
      headers: jsonHeaders,
    });
  } catch (err) {
    console.error("admin-set-default-price", err);
    return new Response(JSON.stringify({ error: "Failed to update default price" }), {
      status: err.statusCode || 500,
      headers: jsonHeaders,
    });
  }
};

