import Stripe from "stripe";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function getStripe() {
  const key = requiredEnv("STRIPE_SECRET_KEY");
  // Keep a pinned API version for predictable webhook payloads.
  return new Stripe(key, { apiVersion: "2025-12-15.clover" });
}

