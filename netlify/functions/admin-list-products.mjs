import { requireOwner } from "./_lib/auth.mjs";
import { stripe, jsonHeaders, formatProduct } from "./_lib/stripe.mjs";

const MAX_LIMIT = 50;

export default async (req, context) => {
  const owner = requireOwner(context);
  if (owner instanceof Response) return owner;

  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "10"), MAX_LIMIT);
    const includePrices = url.searchParams.get("includePrices") !== "false";

    const products = await stripe.products.list({
      limit,
      expand: ["data.default_price"],
    });

    const data = await Promise.all(
      products.data.map(async (product) => {
        if (!includePrices) return formatProduct(product);
        const prices = await stripe.prices.list({
          product: product.id,
          limit: 20,
        });
        return formatProduct(product, prices.data);
      })
    );

    return new Response(JSON.stringify({ data }), {
      headers: { ...jsonHeaders, "cache-control": "no-store" },
    });
  } catch (err) {
    console.error("admin-list-products", err);
    return new Response(JSON.stringify({ error: "Failed to fetch admin products" }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
};

