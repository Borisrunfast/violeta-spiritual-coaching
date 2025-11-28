// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { getProducts } from "../api/products";

export default function Home() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    getProducts({ limit: 20, active: true })
      .then(({ data }) => setItems(data))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;

  return (
    <div className="p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <article key={p.id} className="border rounded-xl p-4">
          <h2 className="font-semibold text-lg">{p.name}</h2>
          {p.default_price && (
            <p className="text-gray-600">
              {(p.default_price.unit_amount ?? 0) / 100}{" "}
              {p.default_price.currency?.toUpperCase()}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
