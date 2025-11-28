import { useEffect, useMemo, useState } from "react";

const formatPrice = (price) => {
  if (!price) return "-";
  const amount = price.unit_amount != null ? (price.unit_amount / 100).toFixed(2) : "0.00";
  const currency = (price.currency || "").toUpperCase();
  const cadence = price.recurring?.interval ? ` / ${price.recurring.interval}` : "";
  return `${currency} ${amount}${cadence || " one-time"}`;
};

const formatTimestamp = (price) => {
  if (!price?.created) return "";
  const date = new Date(price.created * 1000);
  return date.toLocaleDateString();
};

export default function PricePanel({ product, onCreatePrice, onSetDefaultPrice, creating, settingDefault }) {
  const [unitAmount, setUnitAmount] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [interval, setInterval] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setFormError("");
    setUnitAmount("");
    setInterval("");
    setCurrency("usd");
  }, [product?.id]);

  const defaultPriceId =
    typeof product?.default_price === "string" ? product.default_price : product?.default_price?.id;

  const priceList = useMemo(() => {
    if (!product) return [];
    const seen = new Map();
    (product.prices || []).forEach((price) => seen.set(price.id, price));
    if (product.default_price && typeof product.default_price === "object") {
      seen.set(product.default_price.id, product.default_price);
    }
    return Array.from(seen.values()).sort((a, b) => (b.created || 0) - (a.created || 0));
  }, [product]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!product || creating) return;
    const amountNumber = Number(unitAmount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setFormError("Enter a valid amount greater than zero");
      return;
    }
    const payload = {
      productId: product.id,
      unit_amount: Math.round(amountNumber * 100),
      currency: currency.trim().toLowerCase(),
      ...(interval ? { interval } : {}),
    };
    setFormError("");
    await onCreatePrice(payload);
    setUnitAmount("");
  };

  if (!product) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white/50 p-6 text-center text-sm text-slate-500">
        Select a product to manage prices.
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Prices</h2>
        <p className="text-sm text-slate-500">
          Create immutable prices, then point the product&apos;s default price to the new one.
        </p>
      </div>

      <form className="space-y-4 rounded-md border border-slate-100 p-4" onSubmit={handleCreate}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex-1 text-sm">
            <span className="font-medium text-slate-700">Amount</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none"
              placeholder="199.00"
              value={unitAmount}
              onChange={(e) => setUnitAmount(e.target.value)}
            />
          </label>
          <label className="w-full text-sm sm:w-28">
            <span className="font-medium text-slate-700">Currency</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 uppercase text-slate-900 focus:border-slate-500 focus:outline-none"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              maxLength={3}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">Interval (optional)</span>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          >
            <option value="">One-time</option>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </label>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={creating}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create price"}
        </button>
      </form>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Existing prices
        </h3>
        <ul className="space-y-3">
          {priceList.map((price) => {
            const isDefault = price.id === defaultPriceId;
            return (
              <li
                key={price.id}
                className={`rounded-md border px-4 py-3 text-sm ${
                  isDefault ? "border-slate-900 bg-slate-900/5" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{formatPrice(price)}</p>
                    <p className="text-xs text-slate-500">
                      {price.id} · Created {formatTimestamp(price) || "n/a"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isDefault && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        Default
                      </span>
                    )}
                    <button
                      type="button"
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => onSetDefaultPrice({ productId: product.id, priceId: price.id })}
                      disabled={isDefault || settingDefault}
                    >
                      Set as default
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
          {!priceList.length && (
            <li className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              No prices yet - create one above.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

