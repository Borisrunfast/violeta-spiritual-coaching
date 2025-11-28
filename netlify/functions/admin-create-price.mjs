import { requireOwner } from "./_lib/auth.mjs";
import { stripe, jsonHeaders } from "./_lib/stripe.mjs";

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

  const { productId, unit_amount, currency, interval } = body || {};
  if (!productId) return badRequest("productId is required");
  if (typeof unit_amount !== "number" || !Number.isInteger(unit_amount) || unit_amount <= 0) {
    return badRequest("unit_amount must be a positive integer");
  }
  if (typeof currency !== "string" || currency.length !== 3) {
    return badRequest("currency must be a 3-letter code");
  }

  const pricePayload = {
    product: productId,
    unit_amount,
    currency: currency.toLowerCase(),
  };

  if (interval !== undefined) {
    const allowedIntervals = new Set(["day", "week", "month", "year"]);
    if (!allowedIntervals.has(interval)) {
      return badRequest("interval must be one of day|week|month|year");
    }
    pricePayload.recurring = { interval };
  }

  try {
    const price = await stripe.prices.create(pricePayload);
    return new Response(JSON.stringify({ price }), { headers: jsonHeaders });
  } catch (err) {
    console.error("admin-create-price", err);
    return new Response(JSON.stringify({ error: "Failed to create price" }), {
      status: err.statusCode || 500,
      headers: jsonHeaders,
    });
  }
};

