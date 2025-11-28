import Stripe from "stripe";

const stripe = new Stripe(Netlify.env.get("STRIPE_SECRET_KEY") || process.env.STRIPE_SECRET_KEY);

export default async (req) => {
  try {
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const active = url.searchParams.get("active");

    const list = await stripe.products.list({
      limit,
      ...(active != null ? { active: active === "true" } : {}),
      expand: ["data.default_price"],
    });

    return new Response(
      JSON.stringify({ data: list.data }),
      { headers: { "content-type": "application/json", "cache-control": "no-store" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch products" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
};
