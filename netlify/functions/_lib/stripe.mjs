import Stripe from "stripe";

const stripe = new Stripe(Netlify.env.get("STRIPE_SECRET_KEY") || process.env.STRIPE_SECRET_KEY);

const jsonHeaders = { "content-type": "application/json" };

const formatProduct = (product, prices = []) => ({
  id: product.id,
  name: product.name,
  images: product.images,
  active: product.active,
  description: product.description,
  metadata: product.metadata || {},
  default_price: product.default_price,
  prices,
});

export { stripe, jsonHeaders, formatProduct };

