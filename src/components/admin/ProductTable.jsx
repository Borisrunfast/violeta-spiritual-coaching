const formatPrice = (price) => {
  if (!price || typeof price !== "object") return "-";
  const currency = (price.currency || "").toUpperCase();
  const amount = price.unit_amount != null ? (price.unit_amount / 100).toFixed(2) : "0.00";
  if (price.recurring?.interval) {
    return `${currency} ${amount} / ${price.recurring.interval}`;
  }
  return `${currency} ${amount} one-time`;
};

export default function ProductTable({ products, selectedId, onSelect, loading, error, onRefresh }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">Products</p>
          <p className="text-sm text-slate-500">Owner-only visibility</p>
        </div>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
      {error ? (
        <div className="bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Default price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => {
                const isSelected = product.id === selectedId;
                return (
                  <tr key={product.id} className={isSelected ? "bg-slate-50/70" : ""}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-500">{product.id}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatPrice(product.default_price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          product.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {product.active ? "Active" : "Archived"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelect(product.id)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                          isSelected
                            ? "bg-slate-900 text-white hover:bg-slate-800"
                            : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!products.length && (
                <tr>
                  <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={4}>
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


